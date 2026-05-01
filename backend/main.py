# ---------------- IMPORTS ---------------- #

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import users, chats, blacklist, sessions
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
security = HTTPBearer(auto_error=False)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY missing")

client = genai.Client(api_key=GEMINI_API_KEY)

# ---------------- CORS ---------------- #

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ai-chatbot-iota-mocha.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- AUTH ---------------- #


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserModel):
    try:
        email = user.email.strip().lower()

        if not email:
            raise HTTPException(400, "Email cannot be empty")

        if len(user.password) < 6:
            raise HTTPException(400, "Password must be at least 6 characters")

        users.insert_one(
            {
                "email": email,
                "password": hash_password(user.password),
                "created_at": datetime.utcnow(),
            }
        )

        return {"message": "User created successfully"}

    except DuplicateKeyError:
        raise HTTPException(400, "User already exists")


@app.post("/login")
def login(user: UserModel):
    try:
        email = user.email.strip().lower()

        db_user = users.find_one({"email": email})

        if not db_user or not verify_password(user.password, db_user["password"]):
            raise HTTPException(401, "Invalid credentials")

        existing = sessions.find_one({"email": email})

        if existing:
            blacklist.insert_one(
                {"token": existing["token"], "created_at": datetime.utcnow()}
            )
            sessions.delete_one({"email": email})

        token = create_token({"email": email})

        sessions.insert_one(
            {"email": email, "token": token, "created_at": datetime.utcnow()}
        )

        return {"token": token}

    except Exception as e:
        print("LOGIN ERROR:", e)
        raise HTTPException(500, str(e))



@app.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(401, "Missing token")

    token = credentials.credentials

    blacklist.insert_one({"token": token, "created_at": datetime.utcnow()})

    sessions.delete_one({"token": token})

    return {"message": "Logged out successfully"}


# ---------------- AUTH MIDDLEWARE ---------------- #


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(401, "Missing Authorization header")

    token = credentials.credentials

    # Check blacklist
    if blacklist.find_one({"token": token}):
        raise HTTPException(401, "Token expired. Login again")

    payload = decode_token(token)

    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    email = payload.get("email")

    session = sessions.find_one({"email": email})

    if not session or session["token"] != token:
        raise HTTPException(401, "Session expired. Login again")

    return email


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


# ---------------- FORMAT DETECTION ---------------- #


def detect_format(message: str):
    msg = (message or "").lower()

    if "bullet" in msg or "points" in msg:
        return "bullet"
    if "paragraph" in msg:
        return "paragraph"
    if "structured" in msg or "format" in msg:
        return "structured"

    return "default"


# ---------------- CHAT STREAM ---------------- #


@app.post("/chat-stream")
async def chat_stream(
    req: ChatRequest, request: Request, user: str = Depends(get_current_user)
):
    check_rate_limit(user, request)

    format_type = detect_format(req.message)

    if format_type == "structured":
        prompt = f"Structured format:\n{req.message}"
    elif format_type == "bullet":
        prompt = f"Bullet points:\n{req.message}"
    elif format_type == "paragraph":
        prompt = f"Paragraph:\n{req.message}"
    else:
        prompt = req.message

    try:
        stream = client.models.generate_content_stream(
            model="gemini-2.5-flash", contents=prompt
        )
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

    async def generate():
        full = ""
        for chunk in stream:
            if await request.is_disconnected():
                break
            if hasattr(chunk, "text") and chunk.text:
                full += chunk.text
                yield chunk.text

        chats.insert_one(
            {
                "user": user,
                "message": req.message,
                "response": full,
                "created_at": datetime.utcnow(),
            }
        )

    return StreamingResponse(generate(), media_type="text/plain")


# ---------------- HEALTH ---------------- #


@app.get("/")
def home():
    return {"message": "Backend running 🚀"}
