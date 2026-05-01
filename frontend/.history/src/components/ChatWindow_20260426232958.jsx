import { useState, useRef, useEffect, useCallback } from "react";
import { streamMessage } from "../api";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWindow({ token, chat, setChat }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const controllerRef = useRef(null);
  const textareaRef = useRef(null);

  // ✅ Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // ✅ Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  // ✅ Focus input after sending
  useEffect(() => {
    textareaRef.current?.focus();
  }, [loading]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || loading) return;

    let botText = "";
    const userInput = input.trim();

    // ✅ Add messages safely
    setChat((prev) => [
      ...prev,
      { role: "user", text: userInput },
      { role: "bot", text: "" },
    ]);

    setInput("");
    setLoading(true);

    try {
      // ✅ DO NOT use await here
      controllerRef.current = streamMessage(token, userInput, {
        onChunk: (chunk) => {
          botText += chunk;

          setChat((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: botText + "▋",
            };
            return updated;
          });
        },

        onEnd: () => {
          setLoading(false);

          setChat((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: botText,
            };
            return updated;
          });
        },

        onError: (err) => {
          console.error("STREAM ERROR:", err);

          setLoading(false);

          setChat((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text:
                err?.message?.includes("429")
                  ? "⚠️ Rate limit reached. Try again later."
                  : "⚠️ Something went wrong. Try again.",
              isError: true,
            };
            return updated;
          });
        },
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [input, loading, token, setChat]);

  const stopGeneration = useCallback(() => {
    controllerRef.current?.abort();
    setLoading(false);
  }, []);

  const isEmpty = chat.length === 0;

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 min-h-0">

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-3 py-6 min-h-0">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Empty state */}
          <AnimatePresence>
            {isEmpty && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[40vh] gap-3 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold">AI</span>
                </div>
                <p className="text-white/50 text-sm">
                  Send a message to get started
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <AnimatePresence initial={false}>
            {chat.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MessageBubble
                  role={msg.role}
                  text={msg.text}
                  isError={msg.isError}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">

          <textarea
            ref={textareaRef}
            rows={1}
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
            className="flex-1 px-3 py-2 rounded-xl bg-transparent border border-gray-600 
            text-white focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
          />

          {loading ? (
            <button
              onClick={stopGeneration}
              className="w-10 h-10 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
            >
              ■
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
              disabled:opacity-40 hover:scale-105 transition"
            >
              ➤
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}