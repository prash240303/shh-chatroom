from django.urls import path

from .consumers import PersonalChatConsumer
from .views import send_message, get_messages
websocket_urlpatterns=[
  path('ws/chat/<int:id>/',PersonalChatConsumer.as_asgi()),
  path('messages/<str:room_name>/', get_messages, name='get_messages'),
  path('messages/<str:room_name>/send/', send_message, name='send_message'),
]