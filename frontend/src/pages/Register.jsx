import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Register({ switchToLogin }) {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleRegister = async () => {
    setError("");

    if (!data.username || !data.password) {
      setError("Please fill all fields");
      return;
    }

    if (data.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/register`, data);
      switchToLogin();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message;

      if (msg?.toLowerCase().includes("already")) {
        setError("Account already exists. Please login.");
        setTimeout(() => switchToLogin(), 1500);
      } else {
        setError(msg || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white text-center mb-6">
        Create Account
      </h2>

      {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
      )}

      {/* Username */}
      <div className="relative mb-6">
        <input
          type="text"
          value={data.username}
          onChange={(e) => setData({ ...data, username: e.target.value })}
          placeholder=" "
          className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border border-white/10 text-white
           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
        />

        <label className="absolute left-4 top-2 text-xs text-gray-400 transition-all
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
        peer-placeholder-shown:text-gray-500
        peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
          Username
        </label>
      </div>

      {/* Password */}
      <div className="relative mb-3">
        <input
          type="password"
          value={data.password}
          onChange={(e) =>
            setData({ ...data, password: e.target.value })
          }
          placeholder=" "
          className="peer w-full p-3 rounded-lg bg-transparent border border-gray-600 text-white focus:outline-none focus:border-green-500"
        />
        <label className="absolute left-4 top-2 text-xs text-gray-400 transition-all
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
        peer-placeholder-shown:text-gray-500
        peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
          Password
        </label>
      </div>

      <p className="text-xs text-gray-500 mb-5">
        Use at least 6 characters
      </p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={handleRegister}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white"
      >
        {loading ? "Creating..." : "Register"}
      </motion.button>

      <p className="text-gray-400 text-sm text-center mt-5">
        Already have an account?{" "}
        <span
          onClick={switchToLogin}
          className="text-green-400 cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>
    </div>
  );
}