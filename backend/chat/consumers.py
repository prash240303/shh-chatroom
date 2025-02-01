from channels.generic.websocket import AsyncWebsocketConsumer
import json
from chat.models import Message
from datetime import datetime
from asgiref.sync import sync_to_async

class PersonalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        request_user = self.scope['user']
        if request_user.is_authenticated:
            await self.accept()

            room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f"chat_{room_id}"

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            # Fetch and send message history
            history = await sync_to_async(self.fetch_message_history)()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "message_history",
                    "messages": history
                }
            )
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data=None, bytes_data=None):
        try:
            print(f"Received raw WebSocket message: {text_data}")  # Debugging

            if not text_data:
                await self.send(text_data=json.dumps({"type": "error", "message": "Received empty message."}))
                return

            data = json.loads(text_data)
            message = data.get('message', '')

            if not message:
                await self.send(text_data=json.dumps({"type": "error", "message": "Message is empty."}))
                return

            request_user = self.scope['user']

            if message == "typing":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {"type": "user_typing", "user": str(request_user)}
                )
            else:
                # Save message to database
                saved_message = await sync_to_async(self.save_message_to_db)(request_user, message)

                # Broadcast new message
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": saved_message['message'],
                        "user": saved_message['user'],
                        "timestamp": saved_message['timestamp']
                    }
                )
        except json.JSONDecodeError:
            print(f"Invalid JSON received: {text_data}")
            await self.send(text_data=json.dumps({"type": "error", "message": "Invalid JSON format."}))
        except Exception as e:
            print(f"Error receiving message: {e}")
            await self.send(text_data=json.dumps({"type": "error", "message": "An error occurred."}))

    async def chat_message(self, event):
        """Send new message to WebSocket clients."""
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event['message'],
            "user": event['user'],
            "timestamp": event['timestamp']
        }))

    async def message_history(self, event):
        """Send chat history when a new user connects."""
        await self.send(text_data=json.dumps({
            "type": "message_history",
            "messages": event["messages"]
        }))

    async def user_typing(self, event):
        """Notify all clients that a user is typing."""
        await self.send(text_data=json.dumps({
            "type": "typing",
            "user": event["user"]
        }))

    def fetch_message_history(self):
        """Fetch chat history from the database."""
        messages = Message.objects.filter(chat_room=self.room_group_name).order_by('timestamp')
        return [
            {
                "user": msg.user.email,
                "message": msg.message,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in messages
        ]

    def save_message_to_db(self, user, message):
        """Save message to the database."""
        saved_message = Message.objects.create(
            user=user,
            chat_room=self.room_group_name,
            message=message,
            timestamp=datetime.now()
        )
        return {
            "user": saved_message.user.email,
            "message": saved_message.message,
            "timestamp": saved_message.timestamp.isoformat()
        }
