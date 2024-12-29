from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Message,Rooms
User = get_user_model()

class UserGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'id']
        extra_kwargs = {'id': {'read_only': True}}

class MessageSerializer(serializers.ModelSerializer):
    user = UserGetSerializer(read_only=True)  # Nested serializer to show the sender's details

    class Meta:
        model = Message
        fields = ['user', 'message', 'timestamp', 'chat_room']  # Use correct field names
        read_only_fields = ['timestamp', 'user', 'chat_room']  # Specify read-only fields



class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rooms
        fields = ['room_id', 'chat_room_name', 'created_at']
        read_only_fields = ['room_id', 'created_at']
