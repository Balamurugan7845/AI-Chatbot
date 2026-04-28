import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Login({ setToken, switchToRegister }) {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      navigate("/chat"); // ✅ correct place
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white text-center mb-6">
        Welcome Back
      </h2>

      {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
      )}

      {/* Username */}
      <div className="relative mb-5">
        <input
          type="text"
          value={data.username}
          onChange={(e) =>
            setData({ ...data, username: e.target.value })
          }
          placeholder=" "
          className="peer w-full p-3 rounded-lg bg-transparent border border-gray-600 text-white focus:outline-none focus:border-blue-500"
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
          type="password"
          value={data.password}
          onChange={(e) =>
            setData({ ...data, password: e.target.value })
          }
          placeholder=" "
          className="peer w-full p-3 rounded-lg bg-transparent border border-gray-600 text-white focus:outline-none focus:border-blue-500"
        />
        <label className="absolute left-4 top-2 text-xs text-gray-400 transition-all
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
        peer-placeholder-shown:text-gray-500
        peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
          Password
        </label>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
      >
        {loading ? "Logging in..." : "Login"}
      </motion.button>

      <p className="text-gray-400 text-sm text-center mt-5">
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