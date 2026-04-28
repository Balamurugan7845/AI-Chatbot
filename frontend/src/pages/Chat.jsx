import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api";
import { motion } from "framer-motion";

export default function Chat({ token }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const send = async () => {
    if (!msg.trim()) return;

    const userMsg = { role: "user", text: msg };
    setChat((prev) => [...prev, userMsg]);
    setMsg("");
    setLoading(true);

    try {
      const res = await sendMessage(token, msg);

      const botMsg = { role: "bot", text: res.data.response };

      setChat((prev) => [...prev, botMsg]);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error getting response" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">

      {/* Header */}
      <div className="p-4 border-b border-white/10 text-white font-semibold text-lg">
        AI Assistant
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              c.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl text-sm shadow-lg
              ${
                c.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "bg-white/10 text-gray-200 backdrop-blur-lg border border-white/10"
              }`}
            >
              {c.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="text-gray-400 text-sm">AI is typing...</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 backdrop-blur-xl bg-white/5 flex gap-2">
        <input
          id="page-chat-input"
          name="chat"
          aria-label="Chat message"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message..."
          className="flex-1 p-3 rounded-lg bg-transparent border border-gray-600 text-white focus:outline-none focus:border-blue-500"
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={send}
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
        >
          Send
        </motion.button>
      </div>
    </div>
  );
}