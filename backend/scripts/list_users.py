import os
import sys
import json

# ensure backend is on sys.path so `app` imports resolve
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import users

docs = list(users.find({}, {"email":1, "hashed_password":1, "_id":1}))
out = [{"_id": str(d.get("_id")), "email": d.get("email"), "hashed_password": d.get("hashed_password")} for d in docs]
print(json.dumps(out, indent=2))
