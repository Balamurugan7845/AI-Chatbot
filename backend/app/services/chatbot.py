import os
import time
from dotenv import load_dotenv
from google import genai

load_dotenv()

# ---------------- CLIENT ---------------- #

_client = None


def get_client():
    global _client

    if _client:
        return _client

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("❌ Missing GEMINI_API_KEY in .env")

    # ✅ NEW SDK: pass api_key directly
    _client = genai.Client(api_key=api_key)

    return _client


# ---------------- NORMAL RESPONSE ---------------- #

def generate_ai_response(message: str) -> str:
    client = get_client()

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=message,
            config={
                "max_output_tokens": 1024,
                "temperature": 0.7,
            },
        )

        return response.text.strip() if response.text else "⚠️ Empty response"

    except Exception as e:
        error_str = str(e)
        print("GEMINI ERROR:", error_str)

        if "429" in error_str:
            return "⚠️ Rate limit reached. Please try again later."

        if "timeout" in error_str.lower():
            return "⚠️ AI timeout. Try again."

        return "⚠️ AI error occurred"


# ---------------- STREAM RESPONSE ---------------- #

def stream_ai_response(message: str):
    client = get_client()

    try:
        stream = client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=message,
        )

        has_output = False

        for chunk in stream:
            text = getattr(chunk, "text", None)

            # 🔒 guard against None / invalid chunks
            if not text or not isinstance(text, str):
                continue

            has_output = True
            yield text

        if not has_output:
            yield "⚠️ No response from AI"

    except Exception as e:
        error_str = str(e)
        print("STREAM ERROR:", error_str)

        # ⚠️ IMPORTANT: DO NOT block inside streaming
        if "429" in error_str:
            yield "⏳ Rate limit hit. Try again shortly."
            return

        # fallback (non-stream)
        fallback = generate_ai_response(message)
        yield fallback