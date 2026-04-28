import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Login({ setToken, switchToRegister }) {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleLogin = async () => {
    if (!data.username || !data.password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, data);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
    // Only navigate when login succeeded (token set)
    const token = localStorage.getItem("token");
    if (token) navigate("/chat");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]">

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-[360px] p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
  >
    <h2 className="text-2xl font-semibold text-white text-center mb-6">
      Welcome Back
    </h2>

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
      <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all 
        peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm
        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400
        peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs">
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
      <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all 
        peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm
        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400
        peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs">
        Password
      </label>
    </div>

    {/* Button */}
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={handleLogin}
      disabled={loading}
      className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-blue-500/40 transition"
    >
      {loading ? "Logging in..." : "Login"}
    </motion.button>

    {/* Footer */}
    <p className="text-gray-400 text-sm text-center mt-5">
      Don’t have an account?{" "}
      <span
        onClick={switchToRegister}
        className="text-blue-400 cursor-pointer hover:underline"
      >
        Sign up
      </span>
    </p>
  </motion.div>
</div>
  );
}