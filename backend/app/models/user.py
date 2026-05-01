# app/models/user.py

from pydantic import BaseModel, Field, EmailStr, constr
from typing import Optional
from datetime import datetime
from bson import ObjectId

# ---------------- CUSTOM OBJECT ID ---------------- #

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

# ---------------- REQUEST MODEL ---------------- #

class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=6, max_length=128)


# ---------------- LOGIN MODEL ---------------- #

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------------- DATABASE MODEL ---------------- #

class UserInDB(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    email: EmailStr
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    token_version: int = 0  # for logout-all-devices

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ---------------- RESPONSE MODEL ---------------- #

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    created_at: datetime

# ---------------- TOKEN RESPONSE ---------------- #

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"