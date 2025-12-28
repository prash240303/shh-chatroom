from channels.generic.websocket import AsyncWebsocketConsumer
import json
from chat.models import Message
from datetime import datetime
from asgiref.sync import sync_to_async


class PersonalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("\n" + "=" * 60)
        print("🔌 WEBSOCKET CONSUMER - Connection Handler")
        
        # User is already authenticated by middleware
        request_user = self.scope.get('user')
        
        if not request_user or not request_user.is_authenticated:
            print("❌ User not authenticated (middleware should have blocked this)")
            print("=" * 60 + "\n")
            await self.close(code=4001)
            return
        
        self.user = request_user
        print(f"✅ User from middleware: {request_user.email}")
        
        # Accept the connection
        await self.accept()
        
        # Get room details
        room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f"chat_{room_id}"
        
        print(f"📍 Joining room: {self.room_group_name}")
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Fetch and send message history
        print("📜 Fetching message history...")
        history = await sync_to_async(self.fetch_message_history)()
        
        await self.send(text_data=json.dumps({
            "type": "message_history",
            "messages": history
        }))
        
        print(f"✅ Sent {len(history)} messages from history")
        print("=" * 60 + "\n")

    async def disconnect(self, close_code):
        print("\n" + "=" * 60)
        print(f"🔌 WEBSOCKET DISCONNECTING - Code: {close_code}")
        
        if hasattr(self, 'room_group_name'):
            print(f"📍 Leaving room: {self.room_group_name}")
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        
        print("=" * 60 + "\n")

    async def receive(self, text_data=None, bytes_data=None):
        try:
            if not text_data:
                await self.send(text_data=json.dumps({
                    "type": "error", 
                    "message": "Received empty message."
                }))
                return

            data = json.loads(text_data)
            message = data.get('message', '')

            if not message:
                await self.send(text_data=json.dumps({
                    "type": "error", 
                    "message": "Message is empty."
                }))
                return

            request_user = self.scope['user']

            if message == "typing":
                # Get username for typing indicator
                username = await sync_to_async(self.get_username)(request_user)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "user_typing",
                        "user": request_user.email,
                        "username": username
                    }
                )
            else:
                print(f"💬 Received message from {request_user.email}: {message[:50]}...")
                
                # Save message to database
                saved_message = await sync_to_async(self.save_message_to_db)(request_user, message)

                # Broadcast new message with username
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": saved_message['message'],
                        "user": saved_message['user'],
                        "username": saved_message['username'],
                        "timestamp": saved_message['timestamp']
                    }
                )
                
                print(f"✅ Message broadcasted to room: {self.room_group_name}")
                
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON received: {text_data}")
            await self.send(text_data=json.dumps({
                "type": "error", 
                "message": "Invalid JSON format."
            }))
        except Exception as e:
            print(f"❌ Error receiving message: {e}")
            await self.send(text_data=json.dumps({
                "type": "error", 
                "message": "An error occurred."
            }))

    async def chat_message(self, event):
        """Send new message to WebSocket clients."""
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event['message'],
            "user": event['user'],
            "username": event['username'],
            "timestamp": event['timestamp']
        }))

    async def message_history(self, event):
        """Send chat history when requested."""
        await self.send(text_data=json.dumps({
            "type": "message_history",
            "messages": event["messages"]
        }))

    async def user_typing(self, event):
        """Notify all clients that a user is typing."""
        await self.send(text_data=json.dumps({
            "type": "typing",
            "user": event["user"],
            "username": event["username"]
        }))

    def get_username(self, user):
        """Get username or fallback to email prefix."""
        if hasattr(user, 'username') and user.username:
            return user.username
        return user.email.split('@')[0]

    def fetch_message_history(self):
        """Fetch chat history from the database."""
        messages = Message.objects.filter(chat_room=self.room_group_name).order_by('timestamp')
        return [
            {
                "user": msg.user.email,
                "username": self.get_username(msg.user),
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
            "username": self.get_username(saved_message.user),
            "message": saved_message.message,
            "timestamp": saved_message.timestamp.isoformat()
        }