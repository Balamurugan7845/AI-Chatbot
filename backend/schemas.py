from pydantic import BaseModel

class User(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    message: str