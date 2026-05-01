from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, chat
from app.db.database import create_indexes

app = FastAPI(
)

# ---------------- CORS ---------------- #

origins = [
    "http://localhost:5173",
    "http://localhost:3000"
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