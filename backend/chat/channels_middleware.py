# chat/channels_middleware.py
from channels.db import database_sync_to_async
from rest_framework.exceptions import AuthenticationFailed
from django.db import close_old_connections
from jwt import ExpiredSignatureError, InvalidTokenError, decode
from django.conf import settings
from userAuth.models import User


class JWTWebsocketMiddleware:
    """
    Middleware to authenticate WebSocket connections using JWT tokens from cookies.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Ensure old database connections are closed
        close_old_connections()

        # Extract cookies from headers
        headers = dict(scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode("utf-8")
        
        
        # Parse cookies
        cookies = self.parse_cookies(cookie_header)
        token = cookies.get("access_token")

        if not token:
            await send({"type": "websocket.close", "code": 4000})
            return

        try:
            user = await self.authenticate_user(token)
            scope['user'] = user
            
        except ExpiredSignatureError:
            # Close with 4001 to trigger frontend token refresh
            await send({"type": "websocket.close", "code": 4001})
            return
        except AuthenticationFailed as e:
            await send({"type": "websocket.close", "code": 4002})
            return

        # Pass to the inner application
        return await self.inner(scope, receive, send)

    def parse_cookies(self, cookie_header):
        """
        Parse cookie header into a dictionary.
        """
        cookies = {}
        if not cookie_header:
            return cookies
        
        for cookie in cookie_header.split(";"):
            cookie = cookie.strip()
            if "=" in cookie:
                key, value = cookie.split("=", 1)
                cookies[key.strip()] = value.strip()
        
        return cookies

    @database_sync_to_async
    def authenticate_user(self, token):
        """
        Authenticate the user using the provided JWT token.
        Raises ExpiredSignatureError separately so it can be handled differently.
        """
        try:
            # Decode the JWT token
            payload = decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            
            # Verify token type (should be 'access', not 'refresh')
            token_type = payload.get("type")
            if token_type != "access":
                raise AuthenticationFailed(f"Invalid token type: {token_type}")
            
            # Extract user ID from the token payload
            user_id = payload.get("id")
            if not user_id:
                raise AuthenticationFailed("Invalid token payload")
            
            # Fetch and return the user
            user = User.objects.get(id=user_id)
            return user
            
        except ExpiredSignatureError:
            # Re-raise this so it can be caught separately in __call__
            raise ExpiredSignatureError("Token has expired")
        except InvalidTokenError as e:
            raise AuthenticationFailed(f"Invalid token: {str(e)}")
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")