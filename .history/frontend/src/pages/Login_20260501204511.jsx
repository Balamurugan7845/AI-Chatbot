<<<<<<< HEAD
import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/index.js";

export default function Login({ setToken, switchToRegister }) {
=======
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Register({ switchToLogin }) {
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

<<<<<<< HEAD
  const navigate = useNavigate();

  // ---------------- VALIDATION ---------------- //

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validationError = useMemo(() => {
    const email = data.email.trim();
    const password = data.password;

    if (!email || !password) return "Please fill all fields";
    if (!emailRegex.test(email)) return "Enter a valid email";

    return "";
  }, [data]);

  // ---------------- ERROR PARSER ---------------- //

  const extractErrorMessage = (err) => {
    if (!err?.response) return "⚠️ Cannot connect to server";

    const status = err.response.status;
    const d = err.response.data;

    const raw =
      typeof d?.detail === "string"
        ? d.detail
        : Array.isArray(d?.detail)
        ? d.detail[0]?.msg
        : d?.message;

    const msg = (raw || "").toLowerCase();

    // ✅ Specific invalid credential handling
    if (
      status === 401 ||
      msg.includes("incorrect") ||
      msg.includes("invalid") ||
      msg.includes("credentials")
    ) {
      return "⚠️ Invalid email or password";
    }

    return raw || "Login failed";
  };

  // ---------------- LOGIN ---------------- //

  const handleLogin = useCallback(async () => {
    if (loading || validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: data.email.trim(),
        password: data.password,
      });

      const accessToken = res.data?.access_token;
      const refreshToken = res.data?.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error("Token not received");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      setToken(accessToken);

      navigate("/chat", { replace: true });

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [data, loading, validationError, navigate, setToken]);

  // ---------------- ENTER KEY ---------------- //

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleLogin();
    }
  };

  // ---------------- CLEAR ERROR ON TYPE ---------------- //

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const isDisabled = loading || !!validationError;

  // Clear error on mount (when switching tabs)
  useEffect(() => {
    setError("");
  }, []);

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
=======
  const API_URL =
    import.meta.env.VITE_API_URL_LINK || "https://ai-chatbot-backend-l11v.onrender.com";


  const handleRegister = async () => {
    setError("");

    if (!data.email || !data.password) {
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

      // success → go to login
      setTimeout(() => switchToLogin(), 600);
    } catch (err) {
      let msg = "Registration failed";

      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          msg = err.response.data.detail[0].msg; // get validation message
        } else {
          msg = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }

      if (typeof msg === "string" && msg.toLowerCase().includes("already")) {
        setError("Account already exists. Redirecting...");
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
      <h2 className="text-3xl font-semibold text-white text-center mb-2">
        Create Account
      </h2>

      <p className="text-gray-400 text-sm text-center mb-6">
        Start your journey with us
      </p>

>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs text-center">{error}</p>
        </div>
      )}

      {/* EMAIL */}
      <div className="relative mb-6">
<<<<<<< HEAD
        <input
          type="email"
          value={data.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onKeyDown={onKeyDown}
          placeholder=" "
          autoComplete="email"
          className={`peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border text-white
          ${
            error ? "border-red-500" : "border-white/10"
          }
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition`}
        />
        <span className="absolute left-4 top-2 text-xs text-gray-400
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
=======
        <label htmlFor="email" className="sr-only">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={data.email}
          onChange={(e) =>
            setData({ ...data, email: e.target.value })
          }
          placeholder=" "
          className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border border-white/10 text-white
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
        />

        <span className="absolute left-4 top-2 text-xs text-gray-400 transition-all
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-gray-500
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-green-400">
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
          Email
        </span>
      </div>

      {/* PASSWORD */}
<<<<<<< HEAD
      <div className="relative mb-6">
        <input
          type={showPassword ? "text" : "password"}
          value={data.password}
          onChange={(e) => handleChange("password", e.target.value)}
          onKeyDown={onKeyDown}
          placeholder=" "
          autoComplete="current-password"
          className={`peer w-full px-4 pt-5 pb-2 pr-12 rounded-xl bg-white/5 border text-white
          ${
            error ? "border-red-500" : "border-white/10"
          }
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition`}
        />
        <span className="absolute left-4 top-2 text-xs text-gray-400
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400">
=======
      <div className="relative mb-3">
        <label htmlFor="password" className="sr-only">
          Password
        </label>

        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={data.password}
          onChange={(e) =>
            setData({ ...data, password: e.target.value })
          }
          placeholder=" "
          className="peer w-full px-4 pt-5 pb-2 pr-12 rounded-xl bg-white/5 border border-white/10 text-white
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
        />

        <span className="absolute left-4 top-2 text-xs text-gray-400 transition-all
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-gray-500
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-green-400">
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
          Password
        </span>

        <button
          type="button"
<<<<<<< HEAD
          onClick={() => setShowPassword((s) => !s)}
=======
          onClick={() => setShowPassword(!showPassword)}
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
          className="absolute right-3 top-3 text-gray-400 hover:text-white text-sm"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

<<<<<<< HEAD
      {/* Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleLogin}
        disabled={isDisabled}
        className="w-full py-3 rounded-xl font-semibold
        bg-gradient-to-r from-blue-500 to-indigo-600
        hover:from-blue-600 hover:to-indigo-700
        shadow-lg shadow-blue-500/20
        disabled:opacity-50"
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
=======
      <p className="text-xs text-gray-500 mb-6">
        Use at least 6 characters
      </p>

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

      <p className="text-gray-400 text-sm text-center mt-6">
        Already have an account?{" "}
        <span
          onClick={switchToLogin}
          className="text-green-400 cursor-pointer hover:underline"
        >
          Login
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
        </span>
      </p>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
