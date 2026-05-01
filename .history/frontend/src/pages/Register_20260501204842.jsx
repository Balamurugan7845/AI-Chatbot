import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { registerUser } from "../api/index.js";

export default function Register({ switchToLogin }) {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Better validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validationError = useMemo(() => {
    const email = data.email.trim();
    const password = data.password;

    if (!email || !password) return "Please fill all fields";
    if (!emailRegex.test(email)) return "Enter a valid email";
    if (password.length < 6) return "Password must be at least 6 characters";

    return "";
  }, [data]);

  const extractErrorMessage = (err) => {
    if (!err?.response) return "⚠️ Cannot connect to server";

    const d = err.response.data;

    if (Array.isArray(d?.detail)) return d.detail[0]?.msg;
    if (typeof d?.detail === "string") return d.detail;
    if (typeof d?.message === "string") return d.message;

    return "Registration failed";
  };

  const handleRegister = async () => {
    if (loading || validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerUser({
        email: data.email.trim(),
        password: data.password,
      });

      setSuccess("Account created successfully!");

      setTimeout(() => {
        switchToLogin();
      }, 1000);

    } catch (err) {
      console.error("REGISTER ERROR:", err);

      const msg = extractErrorMessage(err).toLowerCase();

      // ✅ Handle duplicate cleanly
      if (msg.includes("already") || msg.includes("exists")) {
        setError("⚠️ Account already exists. Redirecting to login...");
        setTimeout(() => switchToLogin(), 1200);
        return;
      }

      // ✅ Network fallback
      if (!err.response) {
        setError("⚠️ Backend not reachable (check server)");
        return;
      }

      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRegister();
    }
  };

  const isDisabled = loading || !!validationError;

  return (
    <div>
      <h2 className="text-3xl font-semibold text-white text-center mb-2">
        Create Account
      </h2>

      <p className="text-gray-400 text-sm text-center mb-6">
        Start your journey with us
      </p>

      {/* Success */}
      {success && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-green-400 text-xs text-center">{success}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs text-center">{error}</p>
        </div>
      )}

      {/* EMAIL */}
      <div className="relative mb-6">
        <label htmlFor="register-email" className="sr-only">Email</label>
        <input
          id="register-email"
          name="email"
          type="email"
          value={data.email}
          onChange={(e) =>
            setData({ ...data, email: e.target.value })
          }
          onKeyDown={onKeyDown}
          placeholder=" "
          className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border border-white/10 text-white
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
        />
        <span className="absolute left-4 top-2 text-xs text-gray-400
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-green-400">
          Email
        </span>
      </div>

      {/* PASSWORD */}
      <div className="relative mb-3">
        <label htmlFor="register-password" className="sr-only">Password</label>
        <input
          id="register-password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={data.password}
          onChange={(e) =>
            setData({ ...data, password: e.target.value })
          }
          onKeyDown={onKeyDown}
          placeholder=" "
          className="peer w-full px-4 pt-5 pb-2 pr-12 rounded-xl bg-white/5 border border-white/10 text-white
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition"
        />
        <span className="absolute left-4 top-2 text-xs text-gray-400
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-green-400">
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

      <p className="text-xs text-gray-500 mb-6">
        Use at least 6 characters
      </p>

      {/* Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleRegister}
        disabled={isDisabled}
        className="w-full py-3 rounded-xl font-semibold
        bg-gradient-to-r from-green-500 to-emerald-600
        hover:from-green-600 hover:to-emerald-700
        shadow-lg shadow-green-500/20
        disabled:opacity-50"
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