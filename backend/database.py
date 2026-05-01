from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI_LINK")
DB_NAME = os.getenv("DB_NAME", "chatbot")

if not MONGO_URI:
    raise ValueError("❌ MONGO_URI missing in .env")

try:
    client = MongoClient(
        MONGO_URI,
        server_api=ServerApi("1"),
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        maxPoolSize=50,
        retryWrites=True,
        tls=True
    )

    client.admin.command("ping")
    print("✅ MongoDB connected")

except ConnectionFailure as e:
    print("❌ MongoDB connection failed:", str(e))
    raise

db = client[DB_NAME]

users = db["users"]
chats = db["chats"]
blacklist = db["blacklist"]
sessions = db["sessions"]

def create_indexes():
    users.create_index([("email", 1)], unique=True)
    chats.create_index([("user", 1)])
    chats.create_index([("created_at", -1)])

    blacklist.create_index([("token", 1)], unique=True)
    blacklist.create_index([("created_at", 1)], expireAfterSeconds=86400)

    sessions.create_index("email", unique=True)

    print("✅ Indexes ensured")

create_indexes()
