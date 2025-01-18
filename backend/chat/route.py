from django.urls import path

from .consumers import PersonalChatConsumer
from .views import send_message, get_messages
websocket_urlpatterns = [
    path('ws/chat/<str:room_id>/', PersonalChatConsumer.as_asgi()),  # Change uuid to str
]
