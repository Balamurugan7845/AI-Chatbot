from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

# ---------------- LOAD ENV ---------------- #

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "C")

if not MONGO_URI:
    raise ValueError("❌ MONGO_URI missing in .env")

# ---------------- CONNECTION ---------------- #

def create_client():
    is_atlas = "mongodb+srv://" in MONGO_URI

    return MongoClient(
        MONGO_URI,
        server_api=ServerApi("1") if is_atlas else None,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        maxPoolSize=50,
        retryWrites=True,
        tls=is_atlas  # ✅ only for Atlas
    )


try:
    client = create_client()
    client.admin.command("ping")
    print("✅ MongoDB connected")

except ConnectionFailure as e:
    print("❌ MongoDB connection failed:", str(e))
    raise

db = client[DB_NAME]

# ---------------- COLLECTIONS ---------------- #

users = db["users"]
chats = db["chats"]
blacklist = db["blacklist"]
sessions = db["sessions"]

# ---------------- INDEXES ---------------- #

def create_indexes():
    try:
        users.create_index("email", unique=True)

        chats.create_index("user")
        chats.create_index("created_at")

        blacklist.create_index("token", unique=True)
        blacklist.create_index(
            "created_at",
            expireAfterSeconds=86400  # auto-delete after 1 day
        )

        sessions.create_index("email", unique=True)

        print("✅ Indexes ensured")

    except Exception as e:
        print("❌ Index creation error:", str(e))


# ⚠️ Call this manually from startup, not on import