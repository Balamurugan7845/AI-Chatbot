# ---------------- IMPORTS ---------------- #

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import users, chats, blacklist
from schemas import ChatRequest
from models import UserModel

from pymongo.errors import DuplicateKeyError
from google import genai
from dotenv import load_dotenv

from datetime import datetime
import os

from auth import hash_password, verify_password, create_token, decode_token

# ---------------- INIT ---------------- #

load_dotenv()

app = FastAPI()

# 🔥 FIX: disable auto 401
security = HTTPBearer(auto_error=False)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY missing")

client = genai.Client(api_key=GEMINI_API_KEY)

# ---------------- CORS ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- AUTH ---------------- #


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserModel):
    try:
        username = user.username.strip().lower()

        if not username:
            raise HTTPException(400, "Username cannot be empty")

        if len(user.password) < 6:
            raise HTTPException(400, "Password must be at least 6 characters")

        users.insert_one(
            {
                "username": username,
                "password": hash_password(user.password),
                "created_at": datetime.utcnow(),
            }
        )

        return {"message": "User created successfully"}

    except DuplicateKeyError:
        raise HTTPException(400, "User already exists")

    except Exception as e:
        print("❌ REGISTER ERROR:", str(e))
        raise HTTPException(500, "Internal server error")


@app.post("/login")
def login(user: UserModel):
    username = user.username.strip().lower()
    db_user = users.find_one({"username": username})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_token({"username": username})
    return {"token": token}


@app.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(401, "Missing token")

    token = credentials.credentials

    # store token in blacklist
    blacklist.insert_one({"token": token, "created_at": datetime.utcnow()})

    return {"message": "Logged out successfully"}


# ---------------- AUTH MIDDLEWARE ---------------- #


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    print("🔍 Credentials:", credentials)

    if not credentials:
        raise HTTPException(401, "Missing Authorization header")

    token = credentials.credentials
    print("🔑 Token:", token)

    payload = decode_token(token)

    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    return payload.get("username")


# ---------------- RATE LIMIT ---------------- #

user_limits = {}


def check_rate_limit(user: str, request: Request):
    max_requests = int(os.getenv("MAX_REQUESTS", 5))

    identifier = user or f"anon:{request.client.host if request.client else 'unknown'}"

    if identifier not in user_limits:
        user_limits[identifier] = 0

    if user_limits[identifier] >= max_requests:
        raise HTTPException(429, "Daily limit reached")

    user_limits[identifier] += 1


def detect_format(message: str):
    msg = (message or "").lower()

    if "bullet" in msg or "points" in msg:
        return "bullet"

    if "paragraph" in msg:
        return "paragraph"

    if "structured" in msg or "format" in msg:
        return "structured"

    return "default"



@app.post("/chat-stream")
async def chat_stream(
    req: ChatRequest, request: Request, user: str = Depends(get_current_user)
):
    check_rate_limit(user, request)

    identifier = user or f"anon:{request.client.host if request.client else 'unknown'}"

    # Build a prompt based on requested format
    format_type = detect_format(req.message)

    if format_type == "structured":
        prompt = f"""
Format the answer EXACTLY like this:

Title
<short title>

Definition
<short paragraph>

Key Characteristics
• point 1
• point 2
• point 3

Core Functions
• point 1
• point 2
• point 3
• point 4

Question: {req.message}
"""

    elif format_type == "bullet":
        prompt = f"""
Answer in bullet points only:

• point 1
• point 2
• point 3
• point 4

Question: {req.message}
"""

    elif format_type == "paragraph":
        prompt = f"""
Answer in a clean paragraph only (no bullets, no headings):

Question: {req.message}
"""

    else:
        prompt = req.message

    try:
        upstream_stream = client.models.generate_content_stream(
            model="gemini-2.5-flash", contents=prompt
        )
    except Exception as e:
        # rollback rate limit
        if identifier in user_limits and user_limits[identifier] > 0:
            user_limits[identifier] -= 1

        err_str = str(e)
        print("❌ STREAM ERROR (preflight):", err_str)

        import re, math

        m = re.search(r"Please retry in (\d+\.?\d*)s", err_str)
        retry_after = str(math.ceil(float(m.group(1)))) if m else None

        return JSONResponse(
            content={"detail": err_str[:200]},
            status_code=503,
            headers={"Retry-After": retry_after} if retry_after else {},
        )

    async def generate():
        full_text = ""

        try:
            for chunk in upstream_stream:
                if await request.is_disconnected():
                    break

                if hasattr(chunk, "text") and chunk.text:
                    full_text += chunk.text
                    yield chunk.text

            chats.insert_one(
                {
                    "user": user,
                    "message": req.message,
                    "response": full_text,
                    "created_at": datetime.utcnow(),
                }
            )

        except Exception as e:
            print("❌ STREAM ERROR:", str(e))
            yield f"\n[ERROR]: {str(e)}"

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


# ---------------- HEALTH ---------------- #


@app.get("/")
def home():
    return {"message": "Backend running 🚀"}
