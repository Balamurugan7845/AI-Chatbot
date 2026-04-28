import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Login({ setToken, switchToRegister }) {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleLogin = async () => {
    setError("");

    if (!data.username || !data.password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, data);

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <h2 className="text-3xl font-semibold text-white text-center mb-2">
        Welcome Back
      </h2>

      <p className="text-gray-400 text-sm text-center mb-6">
        Login to continue
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
      <div className="relative mb-6">
        <input
          type={showPassword ? "text" : "password"}
          value={data.password}
          onChange={(e) =>
            setData({ ...data, password: e.target.value })
          }
          placeholder=" "
          className="peer w-full px-4 pt-5 pb-2 pr-12 rounded-xl bg-white/5 border border-white/10 text-white
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
        />

        <label className="absolute left-4 top-2 text-xs text-gray-400 transition-all
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-gray-500
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
          Password
        </label>

        {/* Show/Hide Password */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-400 hover:text-white text-sm"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold tracking-wide
        bg-gradient-to-r from-blue-500 to-indigo-600
        hover:from-blue-600 hover:to-indigo-700
        shadow-lg shadow-blue-500/20
        transition-all duration-300 disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </motion.button>

      {/* Footer */}
      <p className="text-gray-400 text-sm text-center mt-6">
        Don’t have an account?{" "}
        <span
          onClick={switchToRegister}
          className="text-blue-400 cursor-pointer hover:underline"
        >
          Sign up
        </span>
      </p>
    </div>
  );
}