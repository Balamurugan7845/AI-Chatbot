# ---------------- IMPORTS ---------------- #

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

# ---------------- CONFIG ---------------- #

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "chatbot")

if not MONGO_URI:
    raise ValueError("❌ MONGO_URI missing in .env")

# ---------------- CONNECTION ---------------- #

try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        maxPoolSize=50,      # ✅ connection pooling
        retryWrites=True
    )

    client.admin.command("ping")  # ✅ verify connection
    print("✅ MongoDB connected")

except ConnectionFailure as e:
    print("❌ MongoDB connection failed:", str(e))
    raise

# ---------------- DATABASE ---------------- #

db = client[DB_NAME]

users = db["users"]
chats = db["chats"]

# ✅ NEW: for logout token blacklist
blacklist = db["blacklist"]

# ---------------- INDEXES ---------------- #

def create_indexes():
    try:
        # Users
        users.create_index("username", unique=True)

        # Chats
        chats.create_index("user")
        chats.create_index("created_at")

        # Blacklist
        blacklist.create_index("token", unique=True)

        # 🔥 TTL index → auto delete tokens after expiry window
        blacklist.create_index(
            "created_at",
            expireAfterSeconds=86400  # 24 hours
        )

        print("✅ Indexes ensured")

    except Exception as e:
        print("⚠️ Index creation warning:", str(e))

create_indexes()