from django.shortcuts import render
from rest_framework.decorators import api_view
from .tokenAuth import JWTAuthentication
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.decorators import authentication_classes
from .serializers import UserSerializer, LoginSerializer
from .tokens import create_access_token, create_refresh_token
from django.views.decorators.csrf import csrf_exempt
import jwt
from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import status

User = get_user_model()  
import logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    return Response(
        {
            "user": UserSerializer(user).data,
            "message": "Registration successful"
        },
        status=status.HTTP_201_CREATED
    )
    
@api_view(["POST"])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data["user"]

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    response = Response(
        {
            "user": UserSerializer(user).data,
            "message": "Login successful"
        },
        status=status.HTTP_200_OK,
    )

    # Set access token as httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # False for localhost (True in production)
        samesite="Lax",  # Changed from "None" to "Lax"
        path="/",
        max_age=15 * 60,  # 15 minutes
    )
    logger.info(f"access_token set (SameSite=None for cross-origin)")

    # Set refresh token as httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="Lax",  # Changed from "None" to "Lax"
        path="/",  # Use "/" so the cookie is sent with all requests
        max_age=7 * 24 * 60 * 60,
    )
    logger.info(f"refresh_token set (SameSite=Lax for cross-origin)")
    logger.info("=" * 60 + "\n")

    return response

@api_view(["POST"])
@authentication_classes([])  # ← CRITICAL: Empty list = no authentication
@permission_classes([AllowAny])  # ← Allow unauthenticated requests
def refresh_token(request):
    """
    Refresh access token using refresh token from httpOnly cookie.
    This endpoint should NOT be protected by JWT authentication middleware.
    """
    # logger.info("\n" + "=" * 60)
    # logger.info("🔄 REFRESH TOKEN REQUEST")
    # logger.info(f"📍 Request path: {request.path}")
    # logger.info(f"🔧 Request method: {request.method}")
    
    # Log all cookies for debugging
    # all_cookies = request.COOKIES
    # logger.info(f"All cookies present: {list(all_cookies.keys())}")
    
    token = request.COOKIES.get("refresh_token")
    # logger.info(f"🔑 Refresh token: {token[:30] if token else 'NONE'}...")

    if not token:
        # logger.info("No refresh token found in cookies")
        # logger.info("=" * 60 + "\n")
        return Response({"detail": "No refresh token"}, status=400)
    
    try:
        # Decode and validate refresh token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        
        # logger.info(f"Refresh token decoded successfully")
        # logger.info(f"Token payload: {payload}")

        # Verify it's a refresh token, not an access token
        if payload.get("type") != "refresh":
            # logger.info(f"Invalid token type: {payload.get('type')} (expected 'refresh')")
            # logger.info("=" * 60 + "\n")
            return Response({"detail": "Invalid token type"}, status=400)

        # Get user from token payload
        user_id = payload.get("id")
        if not user_id:
            # logger.info("No user ID in token payload")
            # logger.info("=" * 60 + "\n")
            return Response({"detail": "Invalid token payload"}, status=400)
            
        user = User.objects.get(id=user_id)
        logger.info(f"User found: {user.email} (ID: {user_id})")

        # Generate new tokens
        new_access_token = create_access_token(user.id)
        new_refresh_token = create_refresh_token(user.id)
        
        # logger.info(f"New access token generated: {new_access_token[:30]}...")
        # logger.info(f"New refresh token generated: {new_refresh_token[:30]}...")

        response = Response(
            {
                "message": "Token refreshed successfully",
                "user_id": user_id
            },
            status=200
        )

        # Set new access token (short-lived)
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",
            path="/",
            max_age=15 * 60,  # 15 minutes
        )
        # logger.info(f"New access_token cookie set (expires in 15 min)")

        # Set new refresh token (token rotation for better security)
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",
            path="/",
            max_age=7 * 24 * 60 * 60,  # 7 days
        )
        # logger.info(f"New refresh_token cookie set (expires in 7 days)")
        # logger.info("REFRESH SUCCESSFUL")
        # logger.info("=" * 60 + "\n")
        
        return response

    except jwt.ExpiredSignatureError:
        # logger.info(f"Refresh token expired")
        # logger.info("=" * 60 + "\n")
        return Response({"detail": "Refresh token expired"}, status=401)

    except User.DoesNotExist:
        # logger.info(f"User not found: ID {user_id if 'user_id' in locals() else 'unknown'}")
        # logger.info("=" * 60 + "\n")
        return Response({"detail": "User not found"}, status=401)

    except jwt.InvalidTokenError as e:
        # logger.info(f"Invalid refresh token: {str(e)}")
        # logger.info("=" * 60 + "\n")
        return Response({"detail": "Invalid refresh token"}, status=401)
    
    except Exception as e:
        # logger.info(f"Unexpected error: {str(e)}")
        import traceback
        traceback.logger.info_exc()
        # logger.info("=" * 60 + "\n")
        return Response({"detail": "Server error"}, status=500)

@api_view(['POST'])
def logout_user(request):
    # logger.info("\n" + "=" * 60)
    # logger.info("logout request")
    
    response = Response({"message": "Logged out"}, status=200)
    
    # Delete cookies with same settings
    response.delete_cookie("access_token", path="/", samesite="Lax")
    response.delete_cookie("refresh_token", path="/", samesite="Lax")
    
    # logger.info("Cookies deleted")
    # logger.info("=" * 60 + "\n")
    return response