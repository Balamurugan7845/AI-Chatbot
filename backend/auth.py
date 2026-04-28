# ---------------- IMPORTS ---------------- #

from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta
import hashlib
import os
from dotenv import load_dotenv

from database import blacklist  # ✅ required for logout

load_dotenv()

# ---------------- CONFIG ---------------- #

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
EXPIRE_HOURS = 12

if not SECRET:
    raise ValueError("❌ JWT_SECRET missing in .env")

# ---------------- PASSWORD ---------------- #

def normalize_password(password: str) -> str:
    return password.strip()


def hash_password(password: str) -> str:
    password = normalize_password(password)

    sha = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd.hash(sha)


def verify_password(password: str, hashed: str) -> bool:
    password = normalize_password(password)

    sha = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd.verify(sha, hashed)

# ---------------- TOKEN ---------------- #

def create_token(data: dict) -> str:
    now = datetime.utcnow()

    payload = {
        **data,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=EXPIRE_HOURS)).timestamp())
    }

    token = jwt.encode(payload, SECRET, algorithm=ALGORITHM)
    return token


def decode_token(token: str):
    try:
        # 🚫 BLACKLIST CHECK (logout support)
        if blacklist.find_one({"token": token}):
            print("🚫 Token is blacklisted")
            return None

        # `python-jose` does not accept a `leeway` kwarg on decode in some versions.
        # Use standard decode with verified expiration. Token timestamps are numeric.
        payload = jwt.decode(
            token,
            SECRET,
            algorithms=[ALGORITHM],
            options={"verify_exp": True},
        )

        print("📦 DECODED PAYLOAD:", payload)

        # strict validation
        if not payload or "username" not in payload:
            print("❌ Invalid payload structure")
            return None

        return payload

    except ExpiredSignatureError:
        print("❌ JWT ERROR: Token expired")
        return None

    except JWTError as e:
        print("❌ JWT ERROR:", str(e))
        return None

# ---------------- LOGOUT (BLACKLIST) ---------------- #

def blacklist_token(token: str):
    """
    Store token in blacklist so it can't be used again.
    """
    try:
        blacklist.insert_one({
            "token": token,
            "created_at": datetime.utcnow()
        })
        print("✅ Token blacklisted")

    except Exception as e:
        print("❌ Blacklist error:", str(e))