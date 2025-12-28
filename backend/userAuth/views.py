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

User = get_user_model()  


@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
 
    if serializer.is_valid():
     serializer.save()  
     return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)


@api_view(["POST"])
@csrf_exempt
def login_user(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    user = serializer.validated_data["user"]

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    response = Response(
        {
            "user": UserSerializer(user).data,
            "message": "Login successful"
        },
        status=200,
    )

    # Set access token as httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # False for localhost (True in production)
        samesite="Lax",  # ✅ Changed from "None" to "Lax"
        path="/",
        max_age=15 * 60,  # 15 minutes
    )
    print(f"   ✓ access_token set (SameSite=None for cross-origin)")

    # Set refresh token as httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="Lax",  # ✅ Changed from "None" to "Lax"
        path="/",  # ✅ Changed from "/refresh" to "/" so it's sent with all requests
        max_age=7 * 24 * 60 * 60,
    )
    print(f"   ✓ refresh_token set (SameSite=None for cross-origin)")
    print("=" * 60 + "\n")

    return response


@api_view(["POST"])
@csrf_exempt
def refresh_token(request):
    """
    Refresh access token using refresh token from httpOnly cookie.
    This endpoint should NOT be protected by JWT authentication middleware.
    """
    print("\n" + "=" * 60)
    print("🔄 REFRESH TOKEN REQUEST")
    
    token = request.COOKIES.get("refresh_token")
    print(f"🍪 Refresh token from cookie: {token[:30] if token else 'None'}...")

    if not token:
        print("   ✗ No refresh token found in cookies")
        print("=" * 60 + "\n")
        return Response({"detail": "No refresh token"}, status=401)
    
    try:
        # Decode and validate refresh token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        # Verify it's a refresh token, not an access token
        if payload.get("type") != "refresh":
            print("   ✗ Invalid token type - expected 'refresh'")
            print("=" * 60 + "\n")
            return Response({"detail": "Invalid token type"}, status=401)

        # Get user from token payload
        user = User.objects.get(id=payload["id"])
        print(f"   ✓ User found: {user.email}")

        # Generate new tokens
        new_access_token = create_access_token(user.id)
        new_refresh_token = create_refresh_token(user.id)  

        response = Response(
            {"message": "Token refreshed successfully"},
            status=200
        )

        # Set new access token (short-lived)
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",  # Changed from "None" to "Lax" for same-origin
            path="/",
            max_age=15 * 60,  # 15 minutes
        )
        print(f"   ✓ New access_token set (expires in 15 min)")

        # Set new refresh token (token rotation for better security)
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token, 
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",  # Changed from "None" to "Lax"
            path="/",  # Changed from "/refresh" to "/" so it's accessible
            max_age=7 * 24 * 60 * 60,  # 7 days
        )
        print(f"   ✓ New refresh_token set (expires in 7 days)")
        print("=" * 60 + "\n")
        
        return response

    except jwt.ExpiredSignatureError:
        print(f"   ✗ Refresh token expired")
        print("=" * 60 + "\n")
        return Response({"detail": "Refresh token expired"}, status=401)

    except (jwt.InvalidTokenError, User.DoesNotExist) as e:
        print(f"   ✗ Invalid refresh token or user not found: {e}")
        print("=" * 60 + "\n")
        return Response({"detail": "Invalid refresh token"}, status=401)

@api_view(["POST"])
def logout_user(request):
    print("\n" + "=" * 60)
    print("🚪 LOGOUT REQUEST")
    
    response = Response({"message": "Logged out"}, status=200)
    
    # Delete cookies with same settings
    response.delete_cookie("access_token", path="/", samesite=None)
    response.delete_cookie("refresh_token", path="/", samesite=None)
    
    print("✅ Cookies deleted")
    print("=" * 60 + "\n")
    return response