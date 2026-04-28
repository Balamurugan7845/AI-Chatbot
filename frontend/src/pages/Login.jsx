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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 w-[350px]"
      >
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Welcome Back
        </h2>

        {/* Username */}
        <div className="relative mb-5">
          <label htmlFor="username" className="absolute left-3 top-3 text-gray-400 text-sm transition-all 
            peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400
            peer-valid:-top-2 peer-valid:text-xs">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={data.username}
            onChange={(e) =>
              setData({ ...data, username: e.target.value })
            }
            className="peer w-full p-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Password */}
        <div className="relative mb-6">
          <label htmlFor="password" className="absolute left-3 top-3 text-gray-400 text-sm transition-all 
            peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400
            peer-valid:-top-2 peer-valid:text-xs">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={data.password}
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
            className="peer w-full p-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-blue-500/30 transition"
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