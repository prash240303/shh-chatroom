from django.shortcuts import render
from rest_framework.decorators import api_view
from .tokenAuth import JWTAuthentication
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, LoginSerializer

User = get_user_model()  


@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
 
    if serializer.is_valid():
     serializer.save()  
     return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)


@api_view(['POST'])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        token = JWTAuthentication.generate_token(payload=serializer.data)
        return Response({
            'message': "Login successful",
            'token': token,
            'user': serializer.data
        }, status=201)

    return Response(serializer.errors, status=400)
