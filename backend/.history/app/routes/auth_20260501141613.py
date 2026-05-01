from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime

from app.models.user import UserCreate, UserLogin, TokenResponse
from app.db.database import users
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    blacklist_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()

# ---------------- REGISTER ---------------- #

@router.post("/register", status_code=201)
def register(user: UserCreate):
    existing = users.find_one({"email": user.email})

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)

    new_user = {
        "email": user.email,
        "hashed_password": hashed,
        "created_at": datetime.utcnow(),
        "token_version": 0,
    }

    users.insert_one(new_user)

    return {"message": "User registered successfully"}


# ---------------- LOGIN ---------------- #

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin):
    db_user = users.find_one({"email": user.email})

    if not db_user or not verify_password(
        user.password, db_user["hashed_password"]
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_access_token(db_user)
    refresh = create_refresh_token(db_user)

    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
    )


# ---------------- REFRESH ---------------- #

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    payload = decode_refresh_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = users.find_one({"_id": payload["id"]})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_access = create_access_token(user)
    new_refresh = create_refresh_token(user)

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
    )


# ---------------- LOGOUT ---------------- #

@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    blacklist_token(token)

    return {"message": "Logged out successfully"}


# ---------------- CURRENT USER ---------------- #

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = users.find_one({"_id": payload["id"]})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user