from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from app.models.chat import ChatCreate, ChatResponse
from app.db.database import chats
from app.routes.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])


# ---------------- AI RESPONSE ---------------- #

def generate_ai_response(message: str) -> str:
    return f"AI response to: {message}"


# ---------------- SEND MESSAGE ---------------- #
# ✅ supports BOTH /chat and /chat/

@router.post("")
@router.post("/")
def chat(req: ChatCreate, user=Depends(get_current_user)):
    try:
        ai_reply = generate_ai_response(req.message)

        chat_doc = {
            "user": user["email"],
            "message": req.message,
            "response": ai_reply,
            "created_at": datetime.utcnow(),
        }

        chats.insert_one(chat_doc)

        return {"response": ai_reply}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- GET HISTORY ---------------- #

@router.get("/history")
def get_history(user=Depends(get_current_user)):
    try:
        user_chats = list(
            chats.find({"user": user["email"]})
            .sort("created_at", -1)
            .limit(50)
        )

        for chat in user_chats:
            chat["_id"] = str(chat["_id"])

        return user_chats

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- DEBUG ROUTE ---------------- #

@router.get("/test")
def test():
    return {"message": "Chat route working"}