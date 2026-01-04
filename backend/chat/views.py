from rest_framework.decorators import api_view, authentication_classes
from django.contrib.auth import get_user_model
from chat.serializers import UserGetSerializer, MessageSerializer
from rest_framework.response import Response
from .models import Message, Rooms, RoomParticipant
from rest_framework.permissions import IsAuthenticated
from userAuth.tokenAuth import JWTAuthentication
User = get_user_model()
from rest_framework import status

@api_view(['GET'])
@authentication_classes([JWTAuthentication]) 
def get_user_list(request):
    """
    Fetch a list of all users except the authenticated user.
    """
    try:
        user_obj = User.objects.exclude(id=request.user.id)
        serializer = UserGetSerializer(user_obj, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error getting the list of users:", str(e))
        return Response({"error": "Error getting user list"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([JWTAuthentication]) 
def get_messages(request, room_name):
    """
    Fetch message history for a specific chat room.
    """
    try:
        room_group_name = f"chat_{room_name}"
        messages = Message.objects.filter(chat_room=room_group_name).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)

        response_data = {
            "type": "message_history",
            "messages": [
                {
                    "user": msg["user"],
                    "message": msg["message"],
                    "timestamp": msg["timestamp"],
                }
                for msg in serializer.data
            ]
        }

        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        return Response({"error": "Error fetching messages"}, status=status.HTTP_400_BAD_REQUEST)

        
@api_view(['POST'])
@authentication_classes([JWTAuthentication]) 
def send_message(request, room_name):
    """
    Send a message to a specific chat room.
    """
    try:
        message_text = request.data.get('message')
        if not message_text:
            return Response({"error": "Message field is required"}, status=status.HTTP_400_BAD_REQUEST)

        room_group_name = f"chat_{room_name}"

        message = Message.objects.create(
            user=request.user,
            message=message_text,
            chat_room=room_group_name
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("Error sending message:", str(e))
        return Response({"error": "Error sending message"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([JWTAuthentication]) 
def get_user_rooms(request):
    """
    Get all chat rooms the authenticated user is part of.
    """
    try:
        participant_rooms = RoomParticipant.objects.filter(
            user=request.user
        ).select_related('room')
        
        rooms_data = [
            {
                "room_name": participant.room.chat_room_name,
                "room_id": str(participant.room.room_id),
                "created_at": participant.room.created_at.isoformat(),
                "created_by": {
                    "id": str(participant.user.id),
                    "email": participant.user.email,
                    "username": getattr(participant.user, 'username', participant.user.email.split('@')[0])
                }
            }
            for participant in participant_rooms
        ]

        return Response({
            "rooms": rooms_data,
            "count": len(rooms_data),
            "message": "No rooms found" if len(rooms_data) == 0 else "Rooms fetched successfully"
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error fetching user rooms: {str(e)}")
        return Response({"error": "Error fetching user rooms"}, status=status.HTTP_400_BAD_REQUEST)

        
@api_view(['POST'])
@authentication_classes([JWTAuthentication]) 
def create_room(request):
    """
    Create a new chat room and add the creator as a participant.
    """
    try:
        chat_room_name = request.data.get('chat_room_name')
        if not chat_room_name:
            return Response({"error": "Chat room name is required"}, status=status.HTTP_400_BAD_REQUEST)

        if Rooms.objects.filter(chat_room_name=chat_room_name).exists():
            return Response({"error": "A room with this name already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the room
        room = Rooms.objects.create(chat_room_name=chat_room_name)
        
        # Add the creator as a participant
        RoomParticipant.objects.create(room=room, user=request.user)
        
        return Response({
            "room_id": str(room.room_id),
            "chat_room_name": room.chat_room_name,
            "created_by": {
                "id": str(request.user.id),
                "email": request.user.email,
                "username": request.user.username
            },
            "created_at": room.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Error creating room: {e}")
        return Response({"error": "Error creating room"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
@api_view(['POST'])
@authentication_classes([JWTAuthentication]) 
def join_room(request):
    """
    Join a chat room by room ID.
    """
    try:
        room_id = request.data.get('room_id')
        if not room_id:
            return Response({"error": "Room ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        room = Rooms.objects.filter(room_id=room_id).first()
        if not room:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        participant, created = RoomParticipant.objects.get_or_create(room=room, user=request.user)
        
        return Response({
            "message": f"{'Joined' if created else 'Already in'} room {room.chat_room_name}",
            "room": {
                "room_id": str(room.room_id),
                "room_name": room.chat_room_name,
                "created_at": room.created_at.isoformat()
            },
            "user": {
                "id": str(request.user.id),
                "email": request.user.email,
                "username": getattr(request.user, 'username', request.user.email.split('@')[0])
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error joining room: {str(e)}")
        return Response({"error": "Error joining room"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication]) 
def delete_room(request, room_id):
    """
    Delete a chat room by its room ID.
    Only room creator or admin can delete.
    """
    try:
        room = Rooms.objects.filter(room_id=room_id).first()
        if not room:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        # Optional: Check if user is room creator
        # first_participant = RoomParticipant.objects.filter(room=room).order_by('joined_at').first()
        # if first_participant.user != request.user:
        #     return Response({"error": "Only the room creator can delete this room"}, status=403)

        room.delete()
        return Response({
            "message": "Room deleted successfully",
            "deleted_room": {
                "room_id": str(room_id),
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error deleting room: {str(e)}")
        return Response({"error": "Error deleting room"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)