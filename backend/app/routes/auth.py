from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

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
    try:
        hashed = hash_password(user.password)

        users.insert_one({
            "email": user.email,
            "hashed_password": hashed,
            "created_at": datetime.utcnow(),
            "token_version": 0,
        })

        return {"message": "User registered successfully"}

    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="User already exists")

    except Exception as e:
        print("REGISTER ERROR:", e)
        raise HTTPException(status_code=500, detail="Server error")


# ---------------- LOGIN ---------------- #

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin):
    try:
        db_user = users.find_one({"email": user.email})

        if not db_user or not verify_password(
            user.password, db_user["hashed_password"]
        ):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # ✅ Normalize
        normalized_user = {
            "_id": str(db_user["_id"]),
            "email": db_user["email"],
            "token_version": db_user.get("token_version", 0),
        }

        access = create_access_token(normalized_user)
        refresh = create_refresh_token(normalized_user)

        return {
            "access_token": access,
            "refresh_token": refresh,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("LOGIN ERROR:", e)
        raise HTTPException(status_code=500, detail="Server error")


# ---------------- REFRESH ---------------- #

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    payload = decode_refresh_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    try:
        user = users.find_one({"_id": ObjectId(payload["id"])})
    except:
        raise HTTPException(status_code=401, detail="Invalid user ID")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ Normalize again (IMPORTANT)
    normalized_user = {
        "_id": str(user["_id"]),
        "email": user["email"],
        "token_version": user.get("token_version", 0),
    }

    new_access = create_access_token(normalized_user)
    new_refresh = create_refresh_token(normalized_user)

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
    }


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

    try:
        user = users.find_one({"_id": ObjectId(payload["id"])})
    except:
        raise HTTPException(status_code=401, detail="Invalid user ID")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

