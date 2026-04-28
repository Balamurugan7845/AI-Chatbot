import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Register({ switchToLogin }) {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleRegister = async () => {
    if (!data.username || !data.password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/register`, data);
      alert("User created! Now login.");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
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
          Create Account
        </h2>

        {/* Username */}
        <div className="relative mb-5">
          <input
            id="username"
            name="username"
            type="text"
            value={data.username}
            onChange={(e) =>
              setData({ ...data, username: e.target.value })
            }
            autoComplete="username"
            className="peer w-full p-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
          />
          <label htmlFor="username" className="absolute left-3 top-3 text-gray-400 text-sm transition-all 
            peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-400
            peer-valid:-top-2 peer-valid:text-xs">
            Username
          </label>
        </div>

        {/* Password */}
        <div className="relative mb-3">
          <input
            id="password"
            name="password"
            type="password"
            value={data.password}
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
            autoComplete="new-password"
            className="peer w-full p-3 bg-transparent border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
          />
          <label htmlFor="password" className="absolute left-3 top-3 text-gray-400 text-sm transition-all 
            peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-400
            peer-valid:-top-2 peer-valid:text-xs">
            Password
          </label>
        </div>

        {/* Password Hint */}
        <p className="text-xs text-gray-500 mb-5">
          Use at least 6 characters with a mix of letters & numbers
        </p>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-green-500/30 transition"
        >
          {loading ? "Creating..." : "Register"}
        </motion.button>

        {/* Footer */}
        <p className="text-gray-400 text-sm text-center mt-5">
          Already have an account?{" "}
          <span
            onClick={switchToLogin}
            className="text-green-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}