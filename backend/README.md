# SHH Chatroom Backend

A real-time chatroom backend built with Django, Django Channels, and WebSockets. This backend provides RESTful APIs for user authentication, room management, and message handling, along with WebSocket support for real-time messaging.

## Tech Stack

- **Django 4.2.20** - Web framework
- **Django REST Framework** - REST API framework
- **Django Channels** - WebSocket support for real-time communication
- **Django Channels Redis** - Channel layer backend for WebSocket scaling
- **Redis** - Message broker and channel layer backend
- **SQLite** - Database (development)
- **PostgreSQL** - Database support via `psycopg` (production ready)
- **JWT Authentication** - Token-based authentication
- **Daphne** - ASGI HTTP/WebSocket server
- **Gunicorn** - WSGI HTTP server (production)

## Prerequisites

- Python 3.8+
- Redis server
- pip (Python package manager)

## Installation

### 1. Clone the repository

```bash
cd backend
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

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory (optional, for production):

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
REDIS_URL=redis://127.0.0.1:6379/0
```

### Settings

Key settings can be modified in `backend/settings.py`:

- `SECRET_KEY` - Django secret key (change in production)
- `DEBUG` - Debug mode (set to `False` in production)
- `ALLOWED_HOSTS` - Allowed host headers
- `CORS_ALLOWED_ORIGINS` - CORS allowed origins for frontend
- `CHANNEL_LAYERS` - Redis channel layer configuration
- `DATABASES` - Database configuration

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
- **Headers:** `Authorization: Bearer <token>`
- **Response:** List of all users except the authenticated user

### Rooms

#### Get User Rooms
- **GET** `/rooms/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** List of rooms the authenticated user is part of

#### Create Room
- **POST** `/rooms/create/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "chat_room_name": "string"
  }
  ```
- **Response:** Created room object with `room_id` and `chat_room_name`

#### Join Room
- **POST** `/room/join/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "room_id": "uuid"
  }
  ```
- **Response:** Success message

#### Delete Room
- **DELETE** `/room/delete/<room_id>/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Success message

### Messages

#### Get Messages
- **GET** `/messages/<room_name>/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Message history for the specified room

#### Send Message
- **POST** `/messages/<room_name>/send/`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "message": "string"
  }
  ```
- **Response:** Created message object

## WebSocket Endpoints

### Chat WebSocket
- **WebSocket** `ws://localhost:8000/ws/chat/<room_id>/`
- **Authentication:** JWT token (via custom middleware)
- **Events:**
  - `message` - Send a message to the room
  - `message_history` - Receive message history
  - `chat_message` - Receive new messages in real-time

## Project Structure

```
backend/
├── backend/          # Django project settings
│   ├── asgi.py      # ASGI configuration for WebSockets
│   ├── settings.py  # Django settings
│   └── urls.py      # URL routing
├── chat/            # Chat application
│   ├── consumers.py # WebSocket consumers
│   ├── models.py    # Chat models (Message, Rooms, RoomParticipant)
│   ├── views.py     # REST API views
│   ├── route.py     # WebSocket routing
│   └── serializers.py # DRF serializers
├── userAuth/        # Authentication application
│   ├── models.py    # User model
│   ├── views.py     # Authentication views
│   ├── serializers.py # User serializers
│   └── tokenAuth.py # JWT authentication
├── manage.py        # Django management script
└── requirements.txt # Python dependencies
```

## Database Models

### User
- Custom user model extending Django's AbstractUser
- Fields: username, email, password, etc.

### Rooms
- Chat room model
- Fields: `room_id` (UUID), `chat_room_name`, `created_at`

### RoomParticipant
- Many-to-many relationship between users and rooms
- Fields: `room`, `user`

### Message
- Chat message model
- Fields: `user`, `message`, `chat_room`, `timestamp`

## Authentication

The backend uses JWT (JSON Web Tokens) for authentication:

1. **REST API:** Token is passed in the `Authorization` header as `Bearer <token>`
2. **WebSocket:** Token is passed as a query parameter or in the connection handshake (implemented via custom middleware)

## CORS Configuration

CORS is configured to allow requests from:
- `http://127.0.0.1:5173` (Vite dev server)
- `http://localhost:5173`

To add more origins, update `CORS_ALLOWED_ORIGINS` in `settings.py`.

## Development

### Running Tests (Soon)

```bash
python manage.py test
```

### Creating Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Django Admin

Access the admin panel at `http://localhost:8000/admin/` after creating a superuser.

## Production Deployment

### Important Security Settings

1. Set `DEBUG = False` in `settings.py`
2. Update `SECRET_KEY` to a secure random value
3. Configure `ALLOWED_HOSTS` with your domain
4. Use a production database (PostgreSQL recommended)
5. Use environment variables for sensitive data
6. Set up SSL/HTTPS
7. Configure proper CORS origins

### Using Gunicorn

```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

### Using Daphne (for WebSocket support)

```bash
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

## Troubleshooting

### Redis Connection Error

Ensure Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### WebSocket Connection Issues

1. Verify Redis is running and accessible
2. Check CORS settings
3. Ensure JWT token is valid
4. Verify WebSocket URL format: `ws://localhost:8000/ws/chat/<room_id>/`

### Database Issues

If you encounter database errors:
```bash
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
python manage.py migrate
python manage.py makemigrations
```

## License

This project is part of the Shh Chatroom application.

