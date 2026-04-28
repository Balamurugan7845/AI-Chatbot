import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Register({ switchToLogin }) {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

      // Smooth transition to login after success
      setTimeout(() => {
        switchToLogin();
      }, 600);

    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Registration failed";

      if (msg.toLowerCase().includes("already")) {
        setError("Account already exists. Redirecting to login...");
        setTimeout(() => switchToLogin(), 1200);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <h2 className="text-3xl font-semibold text-white text-center mb-2">
        Create Account
      </h2>

      <p className="text-gray-400 text-sm text-center mb-6">
        Start your journey with us
      </p>

      {/* Error */}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs text-center">{error}</p>
        </div>
      )}

      {/* Username */}
      <div className="relative mb-6">
        <input
          type="text"
          value={data.username}
          onChange={(e) =>
            setData({ ...data, username: e.target.value })
          }
          placeholder=" "
          className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border border-white/10 text-white
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
        />

        <label className="absolute left-4 top-2 text-xs text-gray-400 transition-all
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-gray-500
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-green-400">
          Username
        </label>
      </div>

      {/* Password */}
      <div className="relative mb-3">
        <input
          type={showPassword ? "text" : "password"}
          value={data.password}
          onChange={(e) =>
            setData({ ...data, password: e.target.value })
          }
          placeholder=" "
          className="peer w-full px-4 pt-5 pb-2 pr-12 rounded-xl bg-white/5 border border-white/10 text-white
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
        />

        <label className="absolute left-4 top-2 text-xs text-gray-400 transition-all
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-gray-500
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-green-400">
          Password
        </label>

        {/* Show/Hide */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-400 hover:text-white text-sm"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500 mb-6">
        Use at least 6 characters
      </p>

      {/* Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleRegister}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold tracking-wide
        bg-gradient-to-r from-green-500 to-emerald-600
        hover:from-green-600 hover:to-emerald-700
        shadow-lg shadow-green-500/20
        transition-all duration-300 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Register"}
      </motion.button>

      {/* Footer */}
      <p className="text-gray-400 text-sm text-center mt-6">
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