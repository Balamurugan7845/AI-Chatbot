# 🤖 AI Chatbot Backend (FastAPI)

A scalable, production-ready backend for an AI chatbot built with:

* ⚡ **FastAPI** (high-performance API framework)
* 🧠 **Gemini API** (AI responses)
* 🍃 **MongoDB** (Atlas / Local)
* 🔐 **JWT Authentication** (access + refresh tokens)
* 🚀 Deployment-ready (**Render / Railway / Fly.io**)

---

## 📁 Project Structure

```
backend/
│
├── app/
│   ├── core/              # security, config
│   │   ├── security.py    # JWT + password hashing
│   │   └── config.py      # environment config
│   │
│   ├── db/
│   │   └── database.py    # MongoDB connection
│   │
│   ├── models/
│   │   ├── user.py
│   │   └── chat.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   └── chat.py
│   │
│   └── main.py            # FastAPI entry point
│
├── .env                   # environment variables (not committed)
├── requirements.txt
└── README.md
```

---

## ⚙️ Features

### 🔐 Authentication

* User registration & login
* JWT access + refresh tokens
* Token blacklist (logout support)
* Password hashing with bcrypt

### 💬 Chat System

* Send message → get AI response
* Chat history stored in MongoDB
* Ready for multi-turn conversations

### ⚡ Performance & Scalability

* Async-ready FastAPI
* MongoDB connection pooling
* Indexed queries for fast lookups

### 🛡️ Security

* Input validation (Pydantic)
* Token expiration & validation
* Environment-based secrets

---

## 🚀 Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd backend
```

---

### 2. Create Virtual Environment

```bash
python -m venv venv
```

Activate:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / Mac**

```bash
source venv/bin/activate
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Configure Environment Variables

Create a `.env` file in the root:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chatbot

# JWT
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# Gemini API
GEMINI_API_KEY=your_api_key

# Optional
DB_NAME=chatbot
MAX_REQUESTS=7
FRONTEND_URL=http://localhost:5173
```

⚠️ Never commit `.env` to Git.

---

### 5. Run the Server

```bash
uvicorn app.main:app --reload
```

Server will start at:

```
http://localhost:8000
```

---

## 📚 API Documentation

FastAPI automatically generates docs:

* Swagger UI:

  ```
  http://localhost:8000/docs
  ```

* ReDoc:

  ```
  http://localhost:8000/redoc
  ```

---

## 🔐 Authentication Flow

1. **Register**

   ```
   POST /auth/register
   ```

2. **Login**

   ```
   POST /auth/login
   ```

   → returns `access_token` + `refresh_token`

3. **Access Protected Routes**

   ```
   Authorization: Bearer <access_token>
   ```

4. **Refresh Token**

   ```
   POST /auth/refresh
   ```

5. **Logout**

   ```
   POST /auth/logout
   ```

---

## 💬 Chat Endpoints

### Send Message

```
POST /chat/
```

**Request**

```json
{
  "message": "Hello AI"
}
```

**Response**

```json
{
  "response": "AI reply here"
}
```

---

### Get Chat History

```
GET /chat/history
```

---

## 🧠 AI Integration

Replace the placeholder in `routes/chat.py`:

```python
def generate_ai_response(message: str):
    # integrate Gemini here
```

Example (Gemini):

```python
import google.generativeai as genai

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-pro")

response = model.generate_content(message)
return response.text
```

---

## 🗄️ Database Design

### Users Collection

```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "hashed_password": "...",
  "created_at": "...",
  "token_version": 0
}
```

### Chats Collection

```json
{
  "_id": ObjectId,
  "user": "user@example.com",
  "message": "...",
  "response": "...",
  "created_at": "..."
}
```

---

## 🚀 Deployment

### Backend (Render / Railway)

1. Push code to GitHub
2. Create service on Render
3. Set environment variables
4. Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 10000
```

---

### Frontend (Vercel)

* Update API URL:

```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## ⚠️ Common Issues

### CORS Error

* Add frontend URL in `main.py`

### 404 on Routes (Vercel)

* Add `vercel.json` rewrite

### MongoDB Connection Failed

* Check IP whitelist (Atlas)
* Verify URI

---

## 🔐 Security Best Practices

* Never expose API keys
* Rotate secrets if leaked
* Use strong JWT secrets
* Restrict MongoDB access (IP whitelist)
* Enable HTTPS in production

---

## 📈 Future Improvements

* 🔁 Refresh token rotation
* 💬 Conversation memory (multi-turn)
* ⚡ Rate limiting middleware
* 🔔 WebSocket streaming (real-time chat)
* 👥 Role-based access (admin/user)

---

## 👨‍💻 Author

**Bala**

---

## ⭐ Support

If you found this useful, consider starring the repo ⭐
