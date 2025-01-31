from channels.generic.websocket import AsyncWebsocketConsumer
import json
from chat.models import Message 
from datetime import datetime
from asgiref.sync import sync_to_async

class PersonalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        request_user = self.scope['user']
        if request_user.is_authenticated:
            await self.accept()  # Accept the WebSocket connection

            # Use room_id from URL kwargs
            room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f"chat_{room_id}"

            # Add user to the room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            # Fetch chat history from the database
            history = await sync_to_async(self.fetch_message_history)()

            # Send message history to the WebSocket
            await self.send(text_data=json.dumps({
                "type": "history",
                "messages": history
            }))
        else:
            await self.close()



    async def disconnect(self, close_code):
        if self.room_group_name:  # Ensure room_group_name exists before accessing
            # Remove user from the room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
            message = data.get('message', '')

            if message == "typing":  # Handle typing event
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "user_typing",
                        "user": self.scope['user'].username
                    }
                )
            else:
                # Save the message to the database asynchronously
                await sync_to_async(self.save_message_to_db)(message)

                # Broadcast the message to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": message,
                        "user": self.scope['user'].username,
                        "timestamp": datetime.now().isoformat()
                    }
                )
        except Exception as e:
            print(f"Error receiving message: {e}")
            await self.send(text_data=json.dumps({"type": "error", "message": "An error occurred."}))

    async def chat_message(self, event):
        message = event['message']
        user = event['user']
        timestamp = event.get('timestamp', datetime.now().isoformat())
        # Send the chat message to the WebSocket
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": message,
            "user": user,
            "timestamp": timestamp
        }))

    async def user_typing(self, event):
        user = event['user']
        # Notify the WebSocket that a user is typing
        await self.send(text_data=json.dumps({
            "type": "typing",
            "user": user
        }))

    def fetch_message_history(self):
        # Fetch chat history from the database
        messages = Message.objects.filter(chat_room=self.room_group_name).order_by('timestamp')
        return [
            {
                "user": msg.user.username,
                "message": msg.message,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in messages
        ]

    def save_message_to_db(self, message):
        # Save the chat message to the database
        Message.objects.create(
            user=self.scope['user'],
            chat_room=self.room_group_name,
            message=message,
            timestamp=datetime.now()
        )
