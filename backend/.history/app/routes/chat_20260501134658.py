from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from app.models.chat import ChatCreate, ChatResponse
from app.db.database import chats
from app.routes.auth import get_current_user

# Replace with your Gemini/OpenAI logic
def generate_ai_response(message: str) -> str:
    return f"AI response to: {message}"


router = APIRouter(prefix="/chat", tags=["Chat"])


# ---------------- SEND MESSAGE ---------------- #

@router.post("/", response_model=ChatResponse)
def chat(
    req: ChatCreate,
    user=Depends(get_current_user),
):
    try:
        # Generate AI response
        ai_reply = generate_ai_response(req.message)

        chat_doc = {
            "user": user["email"],
            "message": req.message,
            "response": ai_reply,
            "created_at": datetime.utcnow(),
        }

        chats.insert_one(chat_doc)

        return ChatResponse(response=ai_reply)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- GET USER CHAT HISTORY ---------------- #

@router.get("/history")
def get_history(user=Depends(get_current_user)):
    user_chats = list(
        chats.find({"user": user["email"]}).sort("created_at", -1).limit(50)
    )

    # convert ObjectId → str
    for chat in user_chats:
        chat["_id"] = str(chat["_id"])

    return user_chats