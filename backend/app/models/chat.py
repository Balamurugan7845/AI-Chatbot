from pydantic import BaseModel, Field, constr
from typing import Optional, Literal, List
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

# ---------------- MESSAGE (FOR CONVERSATIONS) ---------------- #

class ChatMessage(BaseModel):
    role: Literal["user", "bot"]
    text: constr(min_length=1, max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ---------------- SIMPLE CHAT (1 REQUEST → 1 RESPONSE) ---------------- #

class ChatCreate(BaseModel):
    message: constr(min_length=1, max_length=2000)


class ChatInDB(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user: str  # email or user_id
    message: constr(min_length=1, max_length=2000)
    response: constr(min_length=1, max_length=4000)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ---------------- CONVERSATION MODEL (SCALABLE CHAT) ---------------- #

class ConversationInDB(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user: str
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ---------------- RESPONSE MODELS ---------------- #

class ChatResponse(BaseModel):
    response: str


class ConversationResponse(BaseModel):
    id: str
    messages: List[ChatMessage]