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

class JWTWebsocketMiddleware:
    """
    WebSocket middleware for JWT authentication
    Note: WebSockets cannot use httpOnly cookies from JavaScript
    Token must be passed in query string or connection headers
    """
    async def __call__(self, scope, receive, send):
        print("=" * 60)
        print("🔌 WEBSOCKET CONNECTION ATTEMPT")
        
        # Log the token for debugging
        query_string = scope.get('query_string', b'').decode('utf-8')
        print(f"🔍 Query String: {query_string}")
        logger.debug(f"WebSocket connection request with query string: {query_string}")
        
        # Extract token from query string or headers
        token = None
        
        # Try to get token from query string (e.g., ?token=xxx)
        if 'token=' in query_string:
            token = query_string.split('token=')[1].split('&')[0]
            print(f"🔑 Token from query string: {token[:20]}...")
        
        # Try to get token from cookies (if available in scope)
        if not token and 'cookies' in scope:
            cookies = scope.get('cookies', {})
            token = cookies.get('access_token')
            print(f"🍪 Token from cookies: {token[:20] if token else 'None'}...")
        
        if token:
            try:
                # Authenticate using the token
                auth = JWTAuthentication()
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                
                if payload.get("type") != "access":
                    print("❌ Invalid token type for WebSocket")
                    logger.warning("Invalid token type for WebSocket")
                    scope['user'] = None
                else:
                    user_id = payload.get("id")
                    user = await database_sync_to_async(User.objects.get)(id=user_id)
                    scope['user'] = user
                    print(f"✅ WebSocket authenticated for user: {user.email}")
                    logger.info(f"WebSocket authenticated for user: {user.email}")
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist) as e:
                print(f"❌ WebSocket authentication failed: {str(e)}")
                logger.warning(f"WebSocket authentication failed: {str(e)}")
                scope['user'] = None
        else:
            print("❌ No token found for WebSocket")
            scope['user'] = None
        
        print("=" * 60)
        return await self.app(scope, receive, send)


class JWTAuthentication(BaseAuthentication):
    """
    JWT Authentication class that reads tokens from httpOnly cookies
    """
    
    def authenticate(self, request):
        """
        Authenticate the request using access_token from httpOnly cookie
        """
        print("\n" + "=" * 60)
        print("🔐 JWT AUTHENTICATION ATTEMPT")
        print(f"📍 Path: {request.path}")
        print(f"🔧 Method: {request.method}")
        
        # Print all cookies
        print(f"🍪 All Cookies: {dict(request.COOKIES)}")
        
        # Print all headers
        print("📋 Request Headers:")
        for key, value in request.headers.items():
            # Don't print full authorization header for security
            if key.lower() == 'authorization':
                print(f"   {key}: Bearer {value[7:27]}..." if len(value) > 7 else f"   {key}: {value}")
            else:
                print(f"   {key}: {value}")
        
        # Try to get token from httpOnly cookie first
        token = request.COOKIES.get('access_token')
        
        if token:
            print(f"✅ Access token found in cookie: {token[:30]}...")
            logger.info(f"Access token from cookie: {token[:30]}...")
        else:
            print("❌ No access_token cookie found")
        
        # Fallback to Authorization header (for backward compatibility or testing)
        if not token:
            print("🔍 Checking Authorization header...")
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                print(f"✅ Access token found in header: {token[:30]}...")
            else:
                print("❌ No Bearer token in Authorization header")
        
        # If no token found, return None (not authenticated)
        if not token:
            print("❌ NO TOKEN FOUND - User not authenticated")
            print("=" * 60 + "\n")
            return None

        try:
            print("🔓 Decoding JWT token...")
            # Decode the token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            print(f"✅ Token decoded successfully")
            print(f"📦 Payload: {payload}")

            # Verify token type
            token_type = payload.get("type")
            print(f"🏷️  Token type: {token_type}")
            
            if token_type != "access":
                print(f"❌ Invalid token type: {token_type} (expected 'access')")
                raise AuthenticationFailed("Invalid token type")

            # Get user from database
            user_id = payload.get("id")
            print(f"🔍 Looking up user with ID: {user_id}")
            
            user = User.objects.get(id=user_id)
            print(f"✅ USER AUTHENTICATED: {user.email}")
            print("=" * 60 + "\n")
            
            # Return tuple of (user, None)
            return (user, None)

        except jwt.ExpiredSignatureError:
            print("❌ ACCESS TOKEN EXPIRED")
            print("=" * 60 + "\n")
            raise AuthenticationFailed("Access token expired")

        except jwt.InvalidTokenError as e:
            print(f"❌ INVALID TOKEN: {str(e)}")
            print("=" * 60 + "\n")
            raise AuthenticationFailed("Invalid token")
            
        except User.DoesNotExist:
            print(f"❌ USER NOT FOUND: ID {payload.get('id')}")
            print("=" * 60 + "\n")
            raise AuthenticationFailed("User not found")
        
        except Exception as e:
            print(f"❌ UNEXPECTED ERROR: {str(e)}")
            print("=" * 60 + "\n")
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
        print(f"🔨 Generating {token_type} token with {expiry_hours}h expiry")
        expiration = datetime.utcnow() + timedelta(hours=expiry_hours)
        payload['exp'] = expiration
        payload['type'] = token_type
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        print(f"✅ Token generated: {token[:30]}...")
        return token

    def extract_token_from_cookie(self, request):
        """
        Extract access token from httpOnly cookie
        """
        token = request.COOKIES.get('access_token')
        print(f"🍪 Extracting token from cookie: {token[:30] if token else 'None'}...")
        return token
    
    def extract_token_from_header(self, request):
        """
        Extract token from Authorization header (fallback method)
        """
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            print(f"📋 Extracting token from header: {token[:30]}...")
            return token
        print("❌ No token in Authorization header")
        return None

    def verify_token(self, token):
        """
        Verify if token is valid and not expired
        
        Returns:
            payload: Dictionary containing token data
        """
        print(f"🔍 Verifying token: {token[:30]}...")
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Check if expiration exists
            if "exp" not in payload:
                print("❌ Token has no expiration time")
                raise InvalidTokenError("Token has no expiration time")
            
            # Check if token is expired (jwt.decode already does this, but explicit check)
            expiration_timestamp = payload['exp']
            curr_timestamp = datetime.utcnow().timestamp()
            
            if curr_timestamp > expiration_timestamp:
                print("❌ Token has expired")
                raise ExpiredSignatureError("Token has expired")
            
            print("✅ Token is valid")
            return payload
            
        except jwt.ExpiredSignatureError:
            print("❌ Token expired during verification")
            raise ExpiredSignatureError("Token has expired")
        except jwt.InvalidTokenError as e:
            print(f"❌ Invalid token during verification: {str(e)}")
            raise InvalidTokenError(f"Invalid token: {str(e)}")
    

    @database_sync_to_async
    def auth_websocket(self, token):
        """
        Authenticate WebSocket connection and return the user.
        
        Note: This is for WebSocket connections where cookies might not be available.
        Token should be passed via query string or connection headers.
        """
        print(f"🔌 Authenticating WebSocket with token: {token[:30]}...")
        try:
            # Decode the token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            
            # Verify token type
            if payload.get("type") != "access":
                print("❌ Invalid token type for WebSocket")
                raise AuthenticationFailed("Invalid token type")
            
            # Get user ID from payload
            user_id = payload.get("id")
            if not user_id:
                print("❌ Invalid token payload - no user ID")
                raise AuthenticationFailed("Invalid token payload")
            
            # Fetch user from database
            user = User.objects.get(id=user_id)
            print(f"✅ WebSocket user authenticated: {user.email}")
            return user
            
        except jwt.ExpiredSignatureError:
            print("❌ WebSocket token expired")
            raise AuthenticationFailed("Access token expired")
        except jwt.InvalidTokenError as e:
            print(f"❌ WebSocket invalid token: {str(e)}")
            raise AuthenticationFailed("Invalid token")
        except User.DoesNotExist:
            print(f"❌ WebSocket user not found: ID {user_id}")
            raise AuthenticationFailed("User not found")