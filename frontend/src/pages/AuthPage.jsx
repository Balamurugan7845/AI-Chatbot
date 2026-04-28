import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage({ setToken }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ Read mode from URL
  const initialMode = searchParams.get("mode") || "login";
  const [mode, setMode] = useState(initialMode);

  // ✅ Sync state → URL
  useEffect(() => {
    setSearchParams({ mode });
  }, [mode]);

  // ✅ After login redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/chat");
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl w-[380px] border border-white/10 shadow-2xl"
      >

        {/* Toggle Buttons */}
        <div className="flex mb-6 bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md transition ${mode === "login"
                ? "bg-blue-600 text-white"
                : "text-gray-400"
              }`}
          >
            Login
          </button>

          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md transition ${mode === "register"
                ? "bg-green-600 text-white"
                : "text-gray-400"
              }`}
          >
            Register
          </button>
        </div>

        {/* Animated Form Switch */}
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
                switchToRegister={() => setMode("register")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <Register switchToLogin={() => setMode("login")} />
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}