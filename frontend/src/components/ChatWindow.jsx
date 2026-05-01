import { useState, useRef, useEffect, useCallback } from "react";
import api from "../api/index.js"; 
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
    const messageId = Date.now();

    setChat((prev) => [
      ...prev,
      { id: messageId + "-user", role: "user", text: userInput },
      { id: messageId + "-bot", role: "bot", text: "▋", isStreaming: true },
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userInput }),
        signal: controllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No stream received");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        botText += chunk;

        setChat((prev) =>
          prev.map((msg) =>
            msg.id === messageId + "-bot"
              ? { ...msg, text: botText ? botText + "▋" : "▋", isStreaming: true }
              : msg,
          ),
        );
      }

      // final render (use fallback if stream produced nothing)
      const finalText = botText.trim() ? botText : "⚠️ No response";
      setChat((prev) =>
        prev.map((msg) =>
          msg.id === messageId + "-bot"
            ? { ...msg, text: finalText, isStreaming: false }
            : msg,
        ),
      );
    } catch (err) {
      console.error("STREAM ERROR:", err);

      let errorText = "⚠️ Something went wrong";

      if (err.message.includes("401")) {
        errorText = "⚠️ Session expired. Please login again.";
      } else if (err.message.includes("404")) {
        errorText = "⚠️ Streaming API not found";
      }

      setChat((prev) =>
        prev.map((msg) =>
          msg.id === messageId + "-bot"
            ? { ...msg, text: errorText, isError: true, isStreaming: false }
            : msg,
        ),
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
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Empty State */}
          <AnimatePresence>
            {isEmpty && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Ask anything. Start your conversation.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
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

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-white/10 bg-gray-900/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          {/* Textarea */}
          <label htmlFor="chat-textarea" className="sr-only">Message</label>
          <textarea
            id="chat-textarea"
            name="message"
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
            placeholder="Type a message..."
            rows={1}
            className="
            flex-1 resize-none px-4 py-3 rounded-xl
            bg-black/40 border border-gray-700
            text-white text-sm
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            placeholder-gray-500
            max-h-[160px] overflow-y-auto
            disabled:opacity-60
          "
          />

          {/* Buttons */}
          {loading ? (
            <button
              onClick={stopGeneration}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 transition"
            >
              ■
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="
              w-11 h-11 flex items-center justify-center rounded-xl
              bg-gradient-to-r from-blue-500 to-indigo-600
              hover:scale-105 transition
              disabled:opacity-40 disabled:hover:scale-100
            "
            >
              ➤
            </button>
          )}
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-gray-500 mt-2">
          Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
