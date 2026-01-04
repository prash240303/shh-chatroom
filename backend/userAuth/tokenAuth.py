import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta, timezone
from channels.db import database_sync_to_async
from rest_framework.authentication import BaseAuthentication
from jwt import decode

User = get_user_model()

import logging
logger = logging.getLogger(__name__)


class JWTAuthentication(BaseAuthentication):
    """
    JWT Authentication class that reads tokens from httpOnly cookies
    """
    
    def authenticate(self, request):
        """
        Authenticate the request using access_token from httpOnly cookie
        """
        # print("\n" + "=" * 60)
        # print("🔐 JWT AUTHENTICATION ATTEMPT")
        # print(f"📍 Path: {request.path}")
        # print(f"🔧 Method: {request.method}")
        
        # Print all cookies
        
        # Print all headers
        for key, value in request.headers.items():
            # Don't print full authorization header for security
            if key.lower() == 'authorization':
                logger.info(f"   {key}: Bearer {value[7:27]}..." if len(value) > 7 else f"   {key}: {value}")
            else:
                logger.info(f"   {key}: {value}")
        
        # Try to get token from httpOnly cookie first
        token = request.COOKIES.get('access_token')
        
        if token:
            logger.info(f"Access token from cookie: {token[:30]}...")
        else:
            logger.info("No access_token cookie found")
        
        # Fallback to Authorization header (for backward compatibility or testing)
        if not token:
            logger.info("🔍 Checking Authorization header...")
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                logger.info("No Bearer token in Authorization header")
        
        # If no token found, return None (not authenticated)
        if not token:
            logger.info("NO TOKEN FOUND - User not authenticated")
            return None

        try:
            # Decode the token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            # Verify token type
            token_type = payload.get("type")
            
            if token_type != "access":
                raise AuthenticationFailed("Invalid token type")

            # Get user from database
            user_id = payload.get("id")
            
            user = User.objects.get(id=user_id)
          
            
            # Return tuple of (user, None)
            return (user, None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Access token expired")

        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed("Invalid token")
            
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")
        
        except Exception as e:
            raise AuthenticationFailed(f"Authentication error: {str(e)}")
    
    
    @staticmethod
    def generate_token(payload, token_type="access", expiry_hours=24):
        """
        Generate a JWT token with the given payload
        
        Args:
            payload: Dictionary containing token data
            token_type: Type of token ('access' or 'refresh')
            expiry_hours: Token expiration time in hours
        """
        expiration = datetime.now(timezone.utc) + timedelta(hours=expiry_hours)
        payload['exp'] = expiration
        payload['type'] = token_type
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return token

    def extract_token_from_cookie(self, request):
        """
        Extract access token from httpOnly cookie
        """
        token = request.COOKIES.get('access_token')
        return token
    
    def extract_token_from_header(self, request):
        """
        Extract token from Authorization header (fallback method)
        """
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            return token
        return None

    def verify_token(self, token):
        """
        Verify if token is valid and not expired
        
        Returns:
            payload: Dictionary containing token data
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Check if expiration exists
            if "exp" not in payload:
                raise InvalidTokenError("Token has no expiration time")
            
            # Check if token is expired (jwt.decode already does this, but explicit check)
            expiration_timestamp = payload['exp']
            curr_timestamp = datetime.now(timezone.utc).timestamp()
            
            if curr_timestamp > expiration_timestamp:
                raise ExpiredSignatureError("Token has expired")
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise ExpiredSignatureError("Token has expired")
        except jwt.InvalidTokenError as e:
            raise InvalidTokenError(f"Invalid token: {str(e)}")
    

    @database_sync_to_async
    def auth_websocket(self, token):
        """
        Authenticate WebSocket connection and return the user.
        
        Note: This is for WebSocket connections where cookies might not be available.
        Token should be passed via query string or connection headers.
        """
        try:
            # Decode the token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            
            # Verify token type
            if payload.get("type") != "access":
                raise AuthenticationFailed("Invalid token type")
            
            # Get user ID from payload
            user_id = payload.get("id")
            if not user_id:
                raise AuthenticationFailed("Invalid token payload")
            
            # Fetch user from database
            user = User.objects.get(id=user_id)
            return user
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Access token expired")
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed("Invalid token")
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")