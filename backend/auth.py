# ---------------- IMPORTS ---------------- #

from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import hashlib
import os
from dotenv import load_dotenv

from database import blacklist

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
    sha = hashlib.sha256(password.encode()).hexdigest()
    return pwd.hash(sha)

def verify_password(password: str, hashed: str) -> bool:
    password = normalize_password(password)
    sha = hashlib.sha256(password.encode()).hexdigest()
    return pwd.verify(sha, hashed)

# ---------------- TOKEN ---------------- #

def create_token(data: dict) -> str:
    payload = {
        **data,
        "exp": datetime.utcnow() + timedelta(hours=EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        # BLACKLIST CHECK
        if blacklist.find_one({"token": token}):
            print("🚫 Token is blacklisted")
            return None

        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])

        if not payload or "username" not in payload:
            return None

        return payload

    except jwt.ExpiredSignatureError:
        print("❌ Token expired")
        return None

    except jwt.InvalidTokenError:
        print("❌ Invalid token")
        return None

# ---------------- LOGOUT ---------------- #

def blacklist_token(token: str):
    try:
        blacklist.insert_one({
            "token": token,
            "created_at": datetime.utcnow()
        })
    except Exception as e:
        print("❌ Blacklist error:", str(e))