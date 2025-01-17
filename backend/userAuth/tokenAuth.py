import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from channels.db import database_sync_to_async
from rest_framework.authentication import BaseAuthentication
from jwt import decode
User = get_user_model()

import logging
logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)

class JWTWebsocketMiddleware:
    async def __call__(self, scope, receive, send):
        # Log the token for debugging
        logger.debug(f"WebSocket connection request with query string: {scope.get('query_string', b'').decode('utf-8')}")

        # Remaining code...

class JWTAuthentication(BaseAuthentication):
    # Generate token, extract token from header, decode token, get user, validate token
    def authenticate(self, request):
        token = self.extract_token(request)
        if token is None:
            return None
        try:
            # Decode the token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            self.verify_token(payload)

            user_id = payload['id']
            user = User.objects.get(id=user_id)
            return (user, None)
        except (InvalidTokenError, ExpiredSignatureError, User.DoesNotExist):
            raise AuthenticationFailed("Invalid token")
    
    
    @staticmethod
    def generate_token(payload):
        expiration = datetime.now() + timedelta(hours=24)
        payload['exp'] = expiration
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return token

    def extract_token(self, request):  # Fixed to accept 'self'
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer'):
            return auth_header.split(' ')[1]
        return None

    def verify_token(self, payload):  # Fixed to accept 'self'
        if "exp" not in payload:  # Fix: check if 'exp' is missing, not present
            raise InvalidTokenError("Token has no expiration time")
        expiration_timestamp = payload['exp']
        curr_timestamp = datetime.now().timestamp()
        if curr_timestamp > expiration_timestamp:
            raise ExpiredSignatureError("Token has expired")
        return True
    

    # since we are making a req we need async calls , so we use the decorator database_sync_to_async
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