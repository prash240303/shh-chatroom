# shh-chatroom

A modern, privacy-focused chatroom application designed for secure and real-time group communication. The `shh-chatroom` repository provides a streamlined and extensible solution for creating your own chatrooms, supporting user authentication, message encryption(will be implemented soon), and rich real-time messaging features.

---

## Introduction

**shh-chatroom** is an open-source chat application designed to foster secure and efficient group communication. It leverages **WebSockets** for real-time interactions while prioritizing **minimalism**, **UI/UX quality**, and **ease of use**.

This project primarily serves as a learning codebase for:
- Django
- Django REST Framework
- WebSockets
- Frontend engineering
- Building scalable systems

### Demo

<video controls width="600">
  <source src="demo_assets/shh.mp4" type="video/mp4">
</video>

> If the video doesn’t load, you can <a href="https://youtu.be/r7_p-ARvhTw?si=TrH225y7xx0eNqch" target="_blank" rel="noopener noreferrer">watch it on YouTube</a>.


## Features

- **Real-Time Messaging:** Instantly send and receive messages using WebSockets.
- **User Authentication:** Simple signup and login system ensures that only registered users can participate.
- **Room Management:** Users can create, join, and leave chatrooms dynamically.
- **Private Messaging:** Support for sending direct messages between users.
- **Message Encryption:** End-to-end encryption for privacy (soon to be implemented).
- **Responsive UI:** Clean and modern interface that works well on desktop and mobile devices.
- **Extensibility:** Modular and clear codebase for easy customization and feature addition.

---

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory (optional, for production):

```env
SECRET_KEY=your-secret-key-here
```

Create a `.env` file in the `frontend` directory (optional, for production):

```env
VITE_BASE_URL=http://localhost:8000/
NODE_ENV="development"
```

### Settings

Key settings can be modified in `backend/settings.py`:

- `SECRET_KEY` - Django secret key (change in production)
- `DEBUG` - Debug mode (set to `False` in production)
- `ALLOWED_HOSTS` - Allowed host headers
- `CORS_ALLOWED_ORIGINS` - CORS allowed origins for frontend
- `CHANNEL_LAYERS` - Redis channel layer configuration
- `DATABASES` - Database configuration

---

## Prerequisites

- Python 3.8+
- Redis server
- pip (Python package manager)
---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/prash240303/shh-chatroom.git
cd shh-chatroom/backend
```

### 2. Create a virtual environment

```bash
python3 -m venv venv
```

### 3. Activate the virtual environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Install and start Redis

**On macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**On Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**On Windows:**
Download and install Redis from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)

### 6. Run database migrations

```bash
python manage.py migrate
```

### 7. Create a superuser (optional)

```bash
python manage.py createsuperuser
```


## Running the Server

### Development Server

```bash
python manage.py runserver
```

The server will run on `http://127.0.0.1:8000`

### Using Daphne (ASGI server for WebSocket support)

```bash
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

---

## API Endpoints

### Authentication

#### Register User
- **POST** `/register/`
- **Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** User object with status 201

#### Login User
- **POST** `/login/`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "jwt-token",
    "user": {...}
  }
  ```

### Users

#### Get User List
- **GET** `/api/users/`
- **Authentication:** HttpOnly Cookie (Automatic)
- **Response:** List of all users except the authenticated user

### Rooms

#### Get User Rooms
- **GET** `/rooms/`
- **Authentication:** HttpOnly Cookie (Automatic)
- **Response:** List of rooms the authenticated user is part of

#### Create Room
- **POST** `/rooms/create/`
- **Authentication:** HttpOnly Cookie (Automatic)
- **Body:**
  ```json
  {
    "chat_room_name": "string"
  }
  ```
- **Response:** Created room object with `room_id` and `chat_room_name`

#### Join Room
- **POST** `/room/join/`
- **Authentication:** HttpOnly Cookie (Automatic)
- **Body:**
  ```json
  {
    "room_id": "uuid"
  }
  ```
- **Response:** Success message

#### Delete Room
- **DELETE** `/room/delete/<room_id>/`
- **Authentication:** HttpOnly Cookie (Automatic)
- **Response:** Success message


## WebSocket Endpoints

### Chat WebSocket
- **WebSocket** `ws://localhost:8000/ws/chat/<room_id>/`
- **Authentication:** HttpOnly Cookie (via upgrade request)
- **Events:**
  - `message` - Send a message to the room
  - `message_history` - Receive message history
  - `receive` - Receive new messages in real-time
  - `chat_message` - Send a message to the room
  - `user_typing` - Notify all clients that a user is typing
  - `save_message_to_db` - save messages to DB
  - 

---


### Frontend



## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

