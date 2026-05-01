import os
from datetime import datetime, timedelta
from typing import Optional, Dict

from dotenv import load_dotenv
from passlib.context import CryptContext
import jwt

from app.db.database import blacklist

# ---------------- LOAD ENV ---------------- #

load_dotenv()  

# ---------------- CONFIG ---------------- #

SECRET = os.getenv("JWT_SECRET")
REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET")

if not SECRET:
    raise ValueError("❌ JWT_SECRET missing")

if not REFRESH_SECRET:
    raise ValueError("❌ JWT_REFRESH_SECRET missing")

ALGORITHM = "HS256"
ACCESS_EXPIRE_MINUTES = 60
REFRESH_EXPIRE_DAYS = 7

ISSUER = "ai-chatbot"
AUDIENCE = "ai-users"

# ---------------- PASSWORD ---------------- #

pwd_context = CryptContext(
    schemes=["bcrypt_sha256", "bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    if not password or not isinstance(password, str):
        raise ValueError("Invalid password")
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(password, hashed)
    except Exception:
        return False


# ---------------- TOKEN CREATION ---------------- #

def create_access_token(user: Dict) -> str:
    if not user or "_id" not in user:
        raise ValueError("Invalid user object")

    now = datetime.utcnow()

    payload = {
        "id": str(user["_id"]),
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "token_version": user.get("token_version", 0),
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_EXPIRE_MINUTES),
        "iss": ISSUER,
        "aud": AUDIENCE,
    }

    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def create_refresh_token(user: Dict) -> str:
    if not user or "_id" not in user:
        raise ValueError("Invalid user object")

    now = datetime.utcnow()

    payload = {
        "id": str(user["_id"]),
        "token_version": user.get("token_version", 0),
        "iat": now,
        "exp": now + timedelta(days=REFRESH_EXPIRE_DAYS),
        "iss": ISSUER,
        "aud": AUDIENCE,
    }

    return jwt.encode(payload, REFRESH_SECRET, algorithm=ALGORITHM)


# ---------------- TOKEN DECODE ---------------- #

def decode_access_token(token: str) -> Optional[Dict]:
    try:
        if blacklist.find_one({"token": token}):
            return None

        payload = jwt.decode(
            token,
            SECRET,
            algorithms=[ALGORITHM],
            audience=AUDIENCE,
            issuer=ISSUER,
            leeway=5  # ✅ handles clock drift
        )

        if not payload or "id" not in payload:
            return None

        return payload

    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def decode_refresh_token(token: str) -> Optional[Dict]:
    try:
        payload = jwt.decode(
            token,
            REFRESH_SECRET,
            algorithms=[ALGORITHM],
            audience=AUDIENCE,
            issuer=ISSUER,
            leeway=5
        )

        if not payload or "id" not in payload:
            return None

        return payload

    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# ---------------- BLACKLIST ---------------- #

def blacklist_token(token: str):
    try:
        blacklist.insert_one({
            "token": token,
            "created_at": datetime.utcnow()
        })
    except Exception as e:
        print("❌ Blacklist error:", str(e))


# ---------------- INIT INDEX ---------------- #

def init_blacklist_index():
    try:
        blacklist.create_index("token", unique=True)
    except Exception:
        pass