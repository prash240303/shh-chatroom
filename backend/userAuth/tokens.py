import jwt
from datetime import datetime, timedelta
from django.conf import settings

ACCESS_TOKEN_LIFETIME = timedelta(minutes=1)
REFRESH_TOKEN_LIFETIME = timedelta(days=7)


def create_access_token(user_id):
    payload = {
        "id": user_id,
        "type": "access",
        "exp": datetime.utcnow() + ACCESS_TOKEN_LIFETIME,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def create_refresh_token(user_id):
    payload = {
        "id": user_id,
        "type": "refresh",
        "exp": datetime.utcnow() + REFRESH_TOKEN_LIFETIME,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
