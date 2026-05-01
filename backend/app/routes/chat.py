from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from datetime import datetime
import asyncio

from app.models.chat import ChatCreate
from app.db.database import chats
from app.routes.auth import get_current_user
from app.services.chatbot import generate_ai_response, stream_ai_response

router = APIRouter(prefix="/chat", tags=["Chat"])


# ---------------- SEND MESSAGE ---------------- #

@router.post("", summary="Send message (non-stream)")
@router.post("/", include_in_schema=False)
def chat(req: ChatCreate, user=Depends(get_current_user)):
    try:
        ai_reply = generate_ai_response(req.message)

        chats.insert_one({
            "user": user["email"],
            "message": req.message,
            "response": ai_reply,
            "created_at": datetime.utcnow(),
        })

        return {"response": ai_reply}

    except Exception as e:
        print("CHAT ERROR:", e)
        raise HTTPException(status_code=500, detail="Chat error")


# ---------------- STREAM CHAT ---------------- #

@router.post("/stream", summary="Stream AI response")
async def chat_stream(
    req: ChatCreate,
    request: Request,
    user=Depends(get_current_user)
):
    print("STREAM START:", user["email"])

    full_text = ""
    disconnected = False

    # ✅ Safe bridge: sync → async generator
    async def iterate_sync(gen):
        for item in gen:
            yield item
            await asyncio.sleep(0)  # prevent blocking

    async def wrapped_stream():
        nonlocal full_text, disconnected

        try:
            async for chunk in iterate_sync(stream_ai_response(req.message)):

                # 🔌 client disconnected
                if await request.is_disconnected():
                    print("⚠️ Client disconnected")
                    disconnected = True
                    break

                # 🧹 sanitize chunk
                if not chunk or not isinstance(chunk, str):
                    continue

                safe_chunk = chunk.replace("\n", " ").strip()

                if not safe_chunk:
                    continue

                full_text += safe_chunk

                # ✅ proper SSE format
                yield f"event: message\ndata: {safe_chunk}\n\n"

                # ✅ keep-alive (prevents buffering issues)
                yield ":\n\n"

        except Exception as e:
            print("STREAM ERROR:", e)
            yield f"data: ⚠️ {str(e)}\n\n"

        finally:
            # ✅ send explicit end signal
            yield "data: [DONE]\n\n"

            # ✅ store only completed responses
            if not disconnected and full_text.strip():
                try:
                    chats.insert_one({
                        "user": user["email"],
                        "message": req.message,
                        "response": full_text,
                        "created_at": datetime.utcnow(),
                    })
                    print("✅ Chat saved")
                except Exception as db_err:
                    print("DB SAVE ERROR:", db_err)
            else:
                print("⚠️ Skipped saving (disconnect or empty)")

    return StreamingResponse(
        wrapped_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # nginx fix
        },
    )


# ---------------- GET HISTORY ---------------- #

@router.get("/history", summary="Get user chat history")
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
        print("HISTORY ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch history")


# ---------------- DEBUG ---------------- #

@router.get("/test")
def test():
    return {"message": "Chat route working"}