from django.db import models
from django.conf import settings  
import uuid
class Message(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Refer to the custom user model
        on_delete=models.CASCADE,
        related_name='messages'
    )
    chat_room = models.CharField(max_length=255)  
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email}: {self.message[:30]}"

    class Meta:
        ordering = ['-timestamp']


class Rooms(models.Model):
    room_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  # Unique room ID for sharing
    chat_room_name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.chat_room_name} ({self.room_id})"

class RoomParticipant(models.Model):
    room = models.ForeignKey(Rooms, related_name="participants", on_delete=models.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  
        related_name="room_participation",
        on_delete=models.CASCADE
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} in {self.room.chat_room_name}"
