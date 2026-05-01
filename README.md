# 🤖 AI Chatbot (Full Stack)

A modern AI chatbot built with:

* ⚛️ React + Tailwind (Frontend)
* ⚡ FastAPI (Backend)
* 🧠 Gemini API (AI Model)
* 🍃 MongoDB (Database)
* 🔐 JWT Authentication

---

## 🚀 Features

* 🔐 User Authentication (Login/Register)
* 💬 Real-time AI Chat (Streaming)
* 📁 Chat History (Local Storage)
* ⚡ Typing Indicator
* 🧠 Structured AI Responses (Title, Points, Sections)
* 📱 Responsive UI (Mobile + Desktop)
* 🚫 Rate Limiting (Daily usage control)
* 🔓 Logout with Token Blacklisting

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/        # config, security
│   │   ├── db/          # database connection
│   │   ├── models/      # schemas/models
│   │   ├── routes/      # API routes
│   │   ├── services/    # business logic (AI, etc.)
│   │   └── main.py      # FastAPI entry point
│   ├── requirements.txt
│   └── .env             # (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── README.md
├── LICENSE
└── render.yaml
```

---

## ⚙️ Setup Instructions

### 🔹 1. Clone the Repository

```
https://github.com/Balamurugan7845/AI-Chatbot.git
cd ai-chatbot
```

---

### 🔹 2. Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### 📄 Create `.env`

```
JWT_SECRET=your_secret_key
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_api_key
```

---

### 🔹 3. Frontend Setup

```
cd ../frontend
npm install
```

---

## ▶️ Run the Project

### 🔥 Option 1: Using Batch Script (Recommended)

Double-click:

```
start.bat
```

---

### 🔥 Option 2: Manual Run

#### Backend

```
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

#### Frontend

```
cd frontend
npm run dev
```

---

## 🌐 App URLs

* Frontend → http://localhost:5173
* Backend → http://localhost:8000

---

## 🔐 Authentication

* JWT-based authentication
* Tokens stored in localStorage
* Logout uses token blacklist (MongoDB)

---

## 🧠 AI Response Format

The chatbot supports structured responses like:

```
Title
Computer

Definition
A computer is an electronic device...

Key Characteristics
• Programmable
• Electronic
• Data processing

Core Functions
• Input
• Processing
• Storage
• Output
```

---

## 📱 Responsive Design

* Desktop: Sidebar always visible
* Mobile: Sidebar toggle with overlay

---

## 🚀 Deployment

### Backend → Render

### Frontend → Vercel

### Database → MongoDB Atlas

---

## ⚠️ Common Issues

### ❌ 401 Unauthorized

* Token missing or expired

### ❌ CORS Error

* Add frontend URL in backend CORS config

### ❌ Streaming Not Working

* Ensure `StreamingResponse` is used

---

## 🛠️ Tech Stack

* FastAPI
* React (Vite)
* Tailwind CSS
* MongoDB
* Gemini API
* JWT Auth

---

## 📌 Future Improvements

* 🔄 Refresh Token System
* 📊 Usage Dashboard
* 💳 Subscription Plans
* 🧠 Markdown Rendering
* 📁 Chat Sync with Database

---

## 👨‍💻 Author

Bala

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
