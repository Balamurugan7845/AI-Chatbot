import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage({ setToken }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialMode = searchParams.get("mode") || "login";
  const [mode, setMode] = useState(initialMode);

  // Sync mode → URL
  useEffect(() => {
    setSearchParams({ mode });
  }, [mode]);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/chat");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]">

      {/* Glow Background */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-3xl rounded-full"></div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-[380px] p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)]"
      >

        {/* 🔥 CLEAN TAB TOGGLE (no background) */}
        <div className="flex mb-6 border-b border-white/10">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "register"
                ? "text-green-400 border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Register
          </button>
        </div>

        {/* 🔄 Animated Forms */}
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
            >
              <Login
                setToken={setToken}
                switchToRegister={() => setMode("register")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <Register switchToLogin={() => setMode("login")} />
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}