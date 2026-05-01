import { useState, useRef, useEffect, useCallback } from "react";
<<<<<<< HEAD
import api from "../api/index.js"; 
=======
import { streamMessage } from "../api";
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { motion, AnimatePresence } from "framer-motion";

<<<<<<< HEAD
export default function ChatWindow({ chat, setChat }) {
=======
export default function ChatWindow({ token, chat, setChat }) {
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const controllerRef = useRef(null);
  const textareaRef = useRef(null);

<<<<<<< HEAD
  // Auto-scroll
=======
  // ✅ Auto-scroll
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

<<<<<<< HEAD
  // Auto resize
=======
  // ✅ Auto-resize textarea
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

<<<<<<< HEAD
  // Focus input
=======
  // ✅ Focus input after sending
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
  useEffect(() => {
    textareaRef.current?.focus();
  }, [loading]);

<<<<<<< HEAD
  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    const messageId = Date.now();

    setChat((prev) => [
      ...prev,
      { id: messageId + "-user", role: "user", text: userInput },
      { id: messageId + "-bot", role: "bot", text: "▋", isStreaming: true },
=======
  const sendMessage = useCallback(() => {
    if (!input.trim() || loading) return;

    let botText = "";
    const userInput = input.trim();

    // ✅ Add messages safely
    setChat((prev) => [
      ...prev,
      { role: "user", text: userInput },
      { role: "bot", text: "" },
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
    ]);

    setInput("");
    setLoading(true);

<<<<<<< HEAD
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
=======
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
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e

  const stopGeneration = useCallback(() => {
    controllerRef.current?.abort();
    setLoading(false);
  }, []);

  const isEmpty = chat.length === 0;

  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
<<<<<<< HEAD
          {chat.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              text={msg.text}
              isError={msg.isError}
            />
          ))}
=======
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
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e

          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
<<<<<<< HEAD
      <div className="sticky bottom-0 border-t border-white/10 bg-gray-900/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          {/* Textarea */}
          <label htmlFor="chat-textarea" className="sr-only">Message</label>
          <textarea
            id="chat-textarea"
            name="message"
            ref={textareaRef}
=======
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">

          <textarea
            ref={textareaRef}
            rows={1}
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
<<<<<<< HEAD
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
=======
            placeholder="Message..."
            className="flex-1 px-3 py-2 rounded-xl bg-transparent border border-gray-600 
            text-white focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
          />

          {loading ? (
            <button
              onClick={stopGeneration}
              className="w-10 h-10 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
            >
              ■
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
<<<<<<< HEAD
              className="
              w-11 h-11 flex items-center justify-center rounded-xl
              bg-gradient-to-r from-blue-500 to-indigo-600
              hover:scale-105 transition
              disabled:opacity-40 disabled:hover:scale-100
            "
=======
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
              disabled:opacity-40 hover:scale-105 transition"
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
            >
              ➤
            </button>
          )}
        </div>

<<<<<<< HEAD
        {/* Hint */}
        <p className="text-center text-xs text-gray-500 mt-2">
          Enter to send • Shift + Enter for new line
=======
        <p className="text-center text-xs text-gray-500 mt-2">
          Enter to send · Shift+Enter for new line
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
        </p>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
