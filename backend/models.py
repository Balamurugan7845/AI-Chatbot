from pydantic import BaseModel, Field, constr
from typing import Optional, Literal
from datetime import datetime

# ---------------- USER MODEL ---------------- #

class UserModel(BaseModel):
    username: constr(min_length=3, max_length=30, strip_whitespace=True)
    password: constr(min_length=6, max_length=128)


class UserInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    username: str
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


# ---------------- CHAT MODEL ---------------- #

class ChatMessage(BaseModel):
    role: Literal["user", "bot"]   # ✅ restricted values
    text: constr(min_length=1)


class ChatModel(BaseModel):
    user: str
    message: constr(min_length=1)
    response: constr(min_length=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------- REQUEST MODEL ---------------- #

class ChatRequest(BaseModel):
    message: constr(min_length=1, max_length=2000)


# ---------------- RESPONSE MODELS ---------------- #

class TokenResponse(BaseModel):
    token: str


class MessageResponse(BaseModel):
    response: str


class ErrorResponse(BaseModel):
    error: str