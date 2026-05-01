from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ IMPORTANT: import modules, NOT router directly
from app.routes import auth, chat

app = FastAPI()

# ---------------- CORS ---------------- #

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
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
app.include_router(chat.router)   # ✅ THIS LINE IS CRITICAL

# ---------------- DEBUG ---------------- #

@app.get("/")
def root():
    return {"message": "API running"}