from fastapi import APIRouter, Depends
from database import chat_collection
from google import genai
import os

router = APIRouter()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

user_limits = {}

@router.post("/chat")
def chat(user_id: str, message: str):

    # Rate limit
    if user_id not in user_limits:
        user_limits[user_id] = 0

    if user_limits[user_id] >= int(os.getenv("MAX_REQUESTS", 5)):
        return {"error": "Limit reached"}

    user_limits[user_id] += 1

    # AI response
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=message
    )

    # Save chat
    chat_collection.insert_one({
        "user_id": user_id,
        "message": message,
        "response": response.text
    })

    return {"response": response.text}