import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api";
import { motion } from "framer-motion";

<<<<<<< HEAD
export default function Chat() {
=======
export default function Chat({ token }) {
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

<<<<<<< HEAD
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

=======
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
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 text-white font-semibold text-lg">
=======
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">

      {/* Header */}
      <div className="p-4 border-b border-white/10 text-white font-semibold text-lg">
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
        AI Assistant
      </div>

      {/* Chat Area */}
<<<<<<< HEAD
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
=======
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
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
