import { useState, useRef, useEffect, useCallback } from "react";
import api from "../api/index.ja"; // ✅ use central API
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWindow({ chat, setChat }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const controllerRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Auto resize
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  // Focus input
  useEffect(() => {
    textareaRef.current?.focus();
  }, [loading]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    const messageId = Date.now(); // ✅ unique id

    setChat((prev) => [
      ...prev,
      { id: messageId + "-user", role: "user", text: userInput },
      { id: messageId + "-bot", role: "bot", text: "" },
    ]);

    setInput("");
    setLoading(true);

    let botText = "";

    try {
      const token = localStorage.getItem("token");

      controllerRef.current = new AbortController();

      const res = await fetch(`${api.defaults.baseURL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // still uses token
        },
        body: JSON.stringify({ message: userInput }),
        signal: controllerRef.current.signal,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        botText += chunk;

        setChat((prev) =>
          prev.map((msg) =>
            msg.id === messageId + "-bot"
              ? { ...msg, text: botText + "▋" }
              : msg
          )
        );
      }

      // Final update
      setChat((prev) =>
        prev.map((msg) =>
          msg.id === messageId + "-bot"
            ? { ...msg, text: botText }
            : msg
        )
      );
    } catch (err) {
      console.error("STREAM ERROR:", err);

      setChat((prev) =>
        prev.map((msg) =>
          msg.id === messageId + "-bot"
            ? {
                ...msg,
                text: "⚠️ Something went wrong.",
                isError: true,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }, [input, loading, setChat]);

  const stopGeneration = useCallback(() => {
    controllerRef.current?.abort();
    setLoading(false);
  }, []);

  const isEmpty = chat.length === 0;

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <div className="max-w-3xl mx-auto space-y-4">

          <AnimatePresence>
            {isEmpty && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-[40vh] gap-3"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                  AI
                </div>
                <p className="text-gray-400 text-sm">
                  Start a conversation
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {chat.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              text={msg.text}
              isError={msg.isError}
            />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">

          <textarea
            ref={textareaRef}
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Message..."
            className="flex-1 p-2 rounded bg-black/40 text-white"
          />

          {loading ? (
            <button onClick={stopGeneration} className="bg-red-500 px-3 py-2 rounded">
              ■
            </button>
          ) : (
            <button
              onClick={sendMessage}
              className="bg-blue-500 px-3 py-2 rounded"
            >
              ➤
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
