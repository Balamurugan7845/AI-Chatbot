from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, chat
# Defer DB import to startup to avoid failing at module import when env missing
create_indexes = None

# ---------------- APP INIT ---------------- #

app = FastAPI(
    title="AI Chatbot API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ---------------- CORS ---------------- #
# Add your Vercel domain here

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ai-chatbot-git-main-balamurugan7845s-projects.vercel.app"
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
    try:
        from app.db.database import create_indexes as _create_indexes
        _create_indexes()
    except Exception as e:
        print("⚠️ Startup: could not ensure DB indexes:", str(e))
    print("🚀 Server started successfully")

# ---------------- HEALTH CHECK ---------------- #

@app.get("/")
def root():
    return {"message": "AI Chatbot API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}