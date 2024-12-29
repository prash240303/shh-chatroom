# from channels.generic.websocket import AsyncWebsocketConsumer
# import json
# class PersonalChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         request_user = self.scope['user']
#         if request_user.is_authenticated:  # Use as a property
#             chat_with_user = self.scope['url_route']['kwargs']['id']  # Fixed key
#             user_ids = sorted([int(request_user.id), int(chat_with_user)])  # Ensure consistent room naming
#             self.room_group_name = f"chat_{user_ids[0]}-{user_ids[1]}"

#             await self.channel_layer.group_add(
#                 self.room_group_name,
#                 self.channel_name
#             )
#             await self.accept()
#         else:
#             await self.close()



#     async def disconnect(self, close_code):
#         self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data=None,bytes_data=None):
#         data = json.loads(text_data)
#         message= data['message']
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 "type":"chat_message",
#                 "message":message
#             }
#         )
#     async def chat_message(self, event):
#         message = event['message']
#         await self.send(text_data=json.dumps({
#             "message":message
#         }))





from channels.generic.websocket import AsyncWebsocketConsumer
import json
from chat.models import Message  # Assuming the Message model exists in your app
from datetime import datetime

class PersonalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        request_user = self.scope['user']
        if request_user.is_authenticated:  # Check if the user is authenticated
            chat_with_user = self.scope['url_route']['kwargs']['id']  # Get the chat partner's ID
            user_ids = sorted([int(request_user.id), int(chat_with_user)])  # Ensure consistent room naming
            self.room_group_name = f"chat_{user_ids[0]}-{user_ids[1]}"  # Create a unique group name

            # Fetch chat history (messages) from the database
            messages = Message.objects.filter(room=self.room_group_name).order_by('timestamp')
            history = [{"user": msg.user.username, "message": msg.message} for msg in messages]

            # Send the message history to the WebSocket
            await self.send(text_data=json.dumps({
                "type": "history",
                "messages": history
            }))

            # Add user to the room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()  # Close connection if user is not authenticated

    async def disconnect(self, close_code):
        # Remove the user from the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Optionally, you could update the user status to "offline" here, if you have a status system
        # user = self.scope['user']
        # user.status = "offline"
        # user.save()

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)  # Parse the incoming message
            message = data['message']

            if message == "typing":  # Handle typing event
                # Send typing status to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "user_typing",
                        "user": self.scope['user'].username
                    }
                )
            else:
                # Save the message to the database
                Message.objects.create(user=self.scope['user'], room=self.room_group_name, message=message, timestamp=datetime.now())

                # Send the message to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": message
                    }
                )
        except Exception as e:
            # Handle error gracefully (e.g., invalid message format, etc.)
            print(f"Error receiving message: {e}")
            await self.send(text_data=json.dumps({"type": "error", "message": "An error occurred."}))

    async def chat_message(self, event):
        message = event['message']
        # Send the chat message to the WebSocket
        await self.send(text_data=json.dumps({
            "message": message
        }))

    async def user_typing(self, event):
        user = event['user']
        # Notify the group that the user is typing
        await self.send(text_data=json.dumps({
            "type": "typing",
            "user": user
        }))
