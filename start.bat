@echo off
echo ===============================
echo 🚀 Starting AI Chatbot Project
echo ===============================

:: ---------- BACKEND ----------
echo 🔧 Starting Backend...

cd backend

:: Activate virtual environment
IF EXIST venv (
    call venv\Scripts\activate
) ELSE (
    echo ❌ Virtual environment not found. Creating...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
)

:: Start backend in new window
start cmd /k "uvicorn main:app --reload"

cd ..

:: ---------- FRONTEND ----------
echo 💻 Starting Frontend...

cd frontend

:: Install dependencies if missing
IF NOT EXIST node_modules (
    echo 📦 Installing frontend dependencies...
    npm install
)

:: Start frontend
start cmd /k "npm run dev"

cd ..

echo ===============================
echo ✅ Project Started Successfully
echo ===============================
pause