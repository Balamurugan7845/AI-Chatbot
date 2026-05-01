import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage({ setToken }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize from URL safely
  const getModeFromURL = () => {
    const m = searchParams.get("mode");
    return m === "register" ? "register" : "login";
  };

  const [mode, setMode] = useState(getModeFromURL);

  // Sync UI → URL (no infinite loop)
  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get("mode");

    if (current !== mode) {
      setSearchParams({ mode }, { replace: true });
    }
  }, [mode, setSearchParams]);

  // Sync URL → UI (handles manual URL change)
  useEffect(() => {
    const urlMode = getModeFromURL();
    if (urlMode !== mode) {
      setMode(urlMode);
    }
  }, [searchParams]); // intentionally depends on searchParams

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/chat", { replace: true });
    }
  }, [navigate]);

  // Centralized switch (prevents duplication)
  const switchMode = (nextMode) => {
    if (nextMode !== mode) {
      setMode(nextMode);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]">

      {/* Glow Background */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-[380px] p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)]"
      >
        {/* Tabs */}
        <div className="flex mb-6 border-b border-white/10">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => switchMode("register")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "register"
                ? "text-green-400 border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Register
          </button>
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
            >
              <Login
                setToken={setToken}
                switchToRegister={() => switchMode("register")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <Register
                switchToLogin={() => switchMode("login")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}