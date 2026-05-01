import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URI = os.getenv("MONGO_URI_LINK")
    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

settings = Settings()

# validation
required = ["MONGO_URI_LINK", "JWT_SECRET", "JWT_REFRESH_SECRET"]

for key in required:
    if not getattr(settings, key):
        raise ValueError(f"Missing env variable: {key}")