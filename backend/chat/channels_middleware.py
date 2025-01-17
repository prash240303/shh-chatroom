from channels.db import database_sync_to_async
from rest_framework.exceptions import AuthenticationFailed
from django.db import close_old_connections
from jwt import ExpiredSignatureError, InvalidTokenError, decode
from django.conf import settings
from userAuth.models import User  # Update with the correct User model import


class JWTWebsocketMiddleware:
    """
    Middleware to authenticate WebSocket connections using JWT tokens.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Ensure old database connections are closed
        close_old_connections()

        # Parse the query string for the token
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_parameters = self.parse_query_string(query_string)
        token = query_parameters.get("token")

        if not token:
            # Close connection if token is missing
            await send({"type": "websocket.close", "code": 4000})
            return

        try:
            user = await self.authenticate_user(token)  # Authenticate user asynchronously
            scope['user'] = user  # Add authenticated user to scope
        except AuthenticationFailed:
            # Close connection if token is invalid or expired
            await send({"type": "websocket.close", "code": 4002})
            return

        # Pass to the inner application
        return await self.inner(scope, receive, send)

    def parse_query_string(self, query_string):
        """
        Parse query string into a dictionary of parameters.
        """
        try:
            return dict(qp.split("=") for qp in query_string.split("&") if "=" in qp)
        except ValueError:
            # Return empty dict if query string is malformed
            return {}

    @database_sync_to_async
    def authenticate_user(self, token):
        """
        Authenticate the user using the provided JWT token.
        """
        try:
            # Decode the JWT token
            payload = decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            
            # Extract user ID from the token payload
            user_id = payload.get("id")
            if not user_id:
                raise AuthenticationFailed("Invalid token payload")
            
            # Fetch and return the user
            user = User.objects.get(id=user_id)
            return user
        except ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")
        except (InvalidTokenError, User.DoesNotExist):
            raise AuthenticationFailed("Invalid token")
