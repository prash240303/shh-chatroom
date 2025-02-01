from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from chat.serializers import UserGetSerializer, MessageSerializer
from rest_framework.response import Response
from .models import Message, Rooms, RoomParticipant
from rest_framework.permissions import IsAuthenticated

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_list(request):
    """
    Fetch a list of all users except the authenticated user.
    """
    try:
        user_obj = User.objects.exclude(id=request.user.id)
        serializer = UserGetSerializer(user_obj, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        print("Error getting the list of users:", str(e))
        return Response({"error": "Error getting user list"}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, room_name):
    """
    Fetch message history for a specific chat room.
    """
    try:
        # Ensure the `room_name` matches the format used in WebSocket's `room_group_name`
        room_group_name = f"chat_{room_name}"

        # Fetch messages for the given chat room
        messages = Message.objects.filter(chat_room=room_group_name).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data, status=200)
    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        return Response({"error": "Error fetching messages"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, room_name):
    """
    Send a message to a specific chat room.
    """
    try:
        # Get the message content from the request
        message_text = request.data.get('message')
        if not message_text:
            return Response({"error": "Message field is required"}, status=400)

        # Ensure the `room_name` matches the format used in WebSocket's `room_group_name`
        room_group_name = f"chat_{room_name}"

        # Save the message to the database
        message = Message.objects.create(
            user=request.user,
            message=message_text,
            chat_room=room_group_name
        )

        # Serialize and return the saved message
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=201)
    except Exception as e:
        print("Error sending message:", str(e))
        return Response({"error": "Error sending message"}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_rooms(request):
    """
    Get all chat rooms the authenticated user is part of.
    """
    try:
        participant_rooms = RoomParticipant.objects.filter(user=request.user).select_related('room')
        
        rooms_data = [
            {
                "room_name": participant.room.chat_room_name,
                "room_id": participant.room.room_id,
                "created_at": participant.room.created_at,
            }
            for participant in participant_rooms
        ]

        return Response({"rooms": rooms_data}, status=200)
    except Exception as e:
        print(f"Error fetching user rooms: {str(e)}")
        return Response({"error": "Error fetching user rooms"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request):
    """
    Create a new chat room.
    """
    try:
        chat_room_name = request.data.get('chat_room_name')
        if not chat_room_name:
            return Response({"error": "Chat room name is required"}, status=400)

        if Rooms.objects.filter(chat_room_name=chat_room_name).exists():
            return Response({"error": "A room with this name already exists"}, status=400)

        room = Rooms.objects.create(chat_room_name=chat_room_name)
        return Response({"room_id": str(room.room_id), "chat_room_name": room.chat_room_name}, status=201)
    except Exception as e:
        print(f"Error creating room: {e}")
        return Response({"error": "Error creating room"}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_room(request):
    """
    Join a chat room by room ID.
    """
    try:
        room_id = request.data.get('room_id')
        if not room_id:
            return Response({"error": "Room ID is required"}, status=400)

        room = Rooms.objects.filter(room_id=room_id).first()
        if not room:
            return Response({"error": "Room not found"}, status=404)

        RoomParticipant.objects.get_or_create(room=room, user=request.user)
        return Response({"message": f"Joined room {room.chat_room_name}"}, status=200)
    except Exception as e:
        print(f"Error joining room: {str(e)}")
        return Response({"error": "Error joining room"}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_room(request, room_id):
    """
    Delete a chat room by its room ID.
    """
    try:
        room = Rooms.objects.filter(room_id=room_id).first()
        if not room:
            return Response({"error": "Room not found"}, status=404)

        room.delete()
        return Response({"message": "Room deleted successfully"}, status=200)
    except Exception as e:
        print(f"Error deleting room: {str(e)}")
        return Response({"error": "Error deleting room"}, status=500)
