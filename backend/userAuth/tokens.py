import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings

ACCESS_TOKEN_LIFETIME = timedelta(minutes=5)
REFRESH_TOKEN_LIFETIME = timedelta(days=7)


def create_access_token(user_id):
    payload = {
        "id": user_id,
        "type": "access",
        "exp": datetime.now(timezone.utc) + ACCESS_TOKEN_LIFETIME,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def create_refresh_token(user_id):
    payload = {
        "id": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + REFRESH_TOKEN_LIFETIME,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
