from django.urls import path

from .consumers import PersonalChatConsumer
from .views import send_message, get_messages
websocket_urlpatterns = [
    path('ws/chat/<str:room_id>/', PersonalChatConsumer.as_asgi()), 
    path('messages/<str:room_id>/receive/', PersonalChatConsumer.receive, name='recive_message'),
]
