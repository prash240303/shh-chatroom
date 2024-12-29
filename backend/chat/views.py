from rest_framework.decorators import api_view , permission_classes
from django.contrib.auth import get_user_model
from chat.serializers import UserGetSerializer, MessageSerializer
from rest_framework.response import Response
from .models import Message
from .models import Rooms, RoomParticipant

from rest_framework.permissions import IsAuthenticated
User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_list(request):
  try:
    user_obj = User.objects.exclude(id=request.user.id)
    serializer = UserGetSerializer(user_obj, many=True)
    return Response(serializer.data, status=200)
  
  except Exception as e:
    print("error getting thelist of users", str(e))
    return Response({"error":"Erorr gettting user list"}, status=400)
  
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, room_name):
    """
    View to get messages from a particular chat room.
    """
    try:
        # Correct the field name to match the model
        messages = Message.objects.filter(chat_room=room_name).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        return Response({"error": "Error fetching messages"}, status=400)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, room_name):
    try:
        # Get the message content from the request
        message_text = request.data.get('message')  # Fetching the 'message' field
        if not message_text:
            return Response({"error": "Message field is required"}, status=400)

        # Create the message
        message = Message.objects.create(
            user=request.user,
            message=message_text,  # Assigning the correct variable to the message field
            chat_room=room_name
        )

        # Serialize and return the message
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=201)
    except Exception as e:
        print("Error sending message:", str(e))
        return Response({"error": "Error sending message"}, status=500)


from .models import Rooms, RoomParticipant

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_rooms(request):
    """
    API to get all chat rooms the authenticated user is part of.
    """
    try:
        # Query all rooms the user is a participant of
        participant_rooms = RoomParticipant.objects.filter(user=request.user).select_related('room')
        
        # Prepare room details
        rooms_data = [
            {
                "room_id": participant.room.chat_room_name,
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
    Create a new chat room with a random room ID.
    """
    try:
        chat_room_name = request.data.get('chat_room_name')
        if not chat_room_name:
            return Response({"error": "Chat room name is required"}, status=400)

        room = Rooms.objects.create(chat_room_name=chat_room_name)
        return Response({"room_id": str(room.room_id), "chat_room_name": room.chat_room_name}, status=201)
    except Exception as e:
        print(f"Error creating room: {str(e)}")
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

        # Add the user to the participants list
        RoomParticipant.objects.get_or_create(room=room, user=request.user)
        return Response({"message": f"Joined room {room.chat_room_name}"}, status=200)
    except Exception as e:
        print(f"Error joining room: {str(e)}")
        return Response({"error": "Error joining room"}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_room(room_id):
    """
    Delete a chat room by its room ID.
    """
    try:
        room = Rooms.objects.filter(room_id=room_id).first()
        if not room:
            return Response({"error": "Room not found"}, status=404)

        # Delete the room and all participants
        room.delete()
        return Response({"message": "Room deleted successfully"}, status=200)
    except Exception as e:
        print(f"Error deleting room: {str(e)}")
        return Response({"error": "Error deleting room"}, status=500)