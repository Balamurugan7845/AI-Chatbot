import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api";
import { motion } from "framer-motion";

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

const send = async () => {
  if (!msg.trim() || loading) return;

  const userText = msg.trim();
  const messageId = Date.now();

  // Add user + placeholder bot instantly
  setChat((prev) => [
    ...prev,
    { id: messageId + "-user", role: "user", text: userText },
    { id: messageId + "-bot", role: "bot", text: "▋" }, // 🔥 fix
  ]);

  setMsg("");
  setLoading(true);

  try {
    const res = await sendMessage(userText);

    const reply = res.data?.response || "⚠️ Empty response";

    // Update ONLY last bot message
    setChat((prev) =>
      prev.map((msg) =>
        msg.id === messageId + "-bot"
          ? { ...msg, text: reply }
          : msg
      )
    );
  } catch (err) {
    console.error("CHAT ERROR:", err);

    setChat((prev) =>
      prev.map((msg) =>
        msg.id === messageId + "-bot"
          ? { ...msg, text: "⚠️ Error getting response" }
          : msg
      )
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 text-white font-semibold text-lg">
        AI Assistant
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Empty State */}
          {chat.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[45vh] text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                AI
              </div>
              <p className="text-gray-400 text-sm">
                Start a conversation with your assistant
              </p>
            </div>
          )}

          {/* Messages */}
          {chat.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                c.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md
              ${
                c.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-sm"
                  : "bg-white/10 text-gray-200 backdrop-blur-lg border border-white/10 rounded-tl-sm"
              }`}
              >
                {c.text}
              </div>
            </motion.div>
          ))}

          {/* Typing */}
          {loading && (
            <div className="text-gray-400 text-sm animate-pulse">
              AI is typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-white/10 bg-gray-900/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          {/* Textarea */}
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="
            flex-1 resize-none px-4 py-3 rounded-xl
            bg-black/40 border border-gray-700
            text-white text-sm
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            placeholder-gray-500
            max-h-[140px] overflow-y-auto
          "
          />

          {/* Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={send}
            disabled={!msg.trim() || loading}
            className="
            h-11 px-5 rounded-xl font-medium
            bg-gradient-to-r from-blue-500 to-indigo-600 text-white
            shadow-lg
            disabled:opacity-40 disabled:hover:scale-100
          "
          >
            Send
          </motion.button>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-gray-500 mt-2">
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
