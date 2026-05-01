import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/index.js";

export default function Login({ setToken, switchToRegister }) {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs text-center">{error}</p>
        </div>
      )}

      {/* EMAIL */}
      <div className="relative mb-6">
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
          Email
        </span>
      </div>

      {/* PASSWORD */}
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
          Password
        </span>

        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
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
        </span>
      </p>
    </div>
  );
}