import os
import sys

# ensure backend is on sys.path so `app` imports resolve
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import users
from app.core.security import pwd_context

for u in users.find({}, {"email":1, "hashed_password":1}):
    email = u.get("email")
    h = u.get("hashed_password")
    scheme = pwd_context.identify(h)
    print(f"{email} -> {scheme}")
