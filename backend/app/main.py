from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, chat
from app.db.database import create_indexes

app = FastAPI(title="AI Chatbot API", version="1.0.0")

# ---------------- CORS ---------------- #

origins = [
    "http://localhost:5173",  # React (Vite)
    "http://127.0.0.1:5173",
    "https://ai-chatbot-git-main-balamurugan7845s-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROUTES ---------------- #

app.include_router(auth.router)
app.include_router(chat.router)

# ---------------- STARTUP ---------------- #


@app.on_event("startup")
def startup():
    create_indexes()
    print("🚀 Server started successfully")


# ---------------- ROOT ---------------- #


@app.get("/")
def root():
    return {"message": "API running"}
