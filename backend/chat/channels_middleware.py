from channels.db import database_sync_to_async
from rest_framework.exceptions import AuthenticationFailed
from django.db import close_old_connections
from jwt import ExpiredSignatureError, InvalidTokenError
from django.conf import settings
from userAuth.models import User  # Update with the correct User model import
from jwt import decode


class JWTWebsocketMiddleware:
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        close_old_connections()

        query_string = scope.get("query_string", b"").decode("utf-8")
        query_parameters = dict(qp.split("=") for qp in query_string.split("&") if "=" in qp)
        token = query_parameters.get("token")

        if not token:
            # Close connection if token is missing
            await send({"type": "websocket.close", "code": 4000})
            return  # Exit middleware

        try:
            user = await self.auth_websocket(token)  # Await the asynchronous call
            scope['user'] = user
        except AuthenticationFailed:
            # Close connection if token is invalid
            await send({"type": "websocket.close", "code": 4002})
            return  # Exit middleware

        # Pass to the inner application (AuthMiddlewareStack, URLRouter, etc.)
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def auth_websocket(self, token):
        """
        Authenticate and return the user for the given token.
        """
        try:
            # Decode the token
            payload = decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            
            # Verify payload (implement your logic if needed)
            user_id = payload.get("id")
            if not user_id:
                raise AuthenticationFailed("Invalid token payload")
            
            # Fetch user
            user = User.objects.get(id=user_id)
            return user
        except (InvalidTokenError, ExpiredSignatureError, User.DoesNotExist):
            raise AuthenticationFailed("Invalid token")
