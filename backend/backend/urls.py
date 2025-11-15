from django.contrib import admin
from django.urls import path
from chat.views import get_user_list, get_messages,send_message, get_user_rooms, create_room, join_room,delete_room
from userAuth.views import register_user, login_user
from django.contrib.staticfiles.urls import staticfiles_urlpatterns



urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', register_user, name="register"),
    path('login/', login_user, name="login"),

    path('messages/<str:room_name>/', get_messages, name='get_messages'),
    path('messages/<str:room_name>/send/', send_message, name='send_message'),
    path('api/users/', get_user_list, name="users" ),
 
    path('rooms/', get_user_rooms, name='get_user_rooms'),
    path('rooms/create/', create_room, name='create_room'),

    path('room/join/', join_room, name='join_room'),
    path('room/delete/<str:room_id>/', delete_room)

]


urlpatterns += staticfiles_urlpatterns()