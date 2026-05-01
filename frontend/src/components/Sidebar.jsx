import { MessageSquarePlus, LogOut, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/index.js";

const STORAGE_KEY = "chat_sessions";

export default function Sidebar({ setCurrentChat, closeSidebar }) {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      setChats(saved);
    } catch {
      setChats([]);
    }
  }, []);

  const saveChats = (updated) => {
    setChats(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newChat, ...chats];
    saveChats(updated);

    setActiveId(newChat.id);
    setCurrentChat(newChat.messages);
    closeSidebar?.();
  };

  const handleSelectChat = (chat) => {
    setActiveId(chat.id);
    setCurrentChat(chat.messages);
    closeSidebar?.();
  };

  // ✅ FIXED LOGOUT
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // ✅ correct endpoint
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.clear();
      closeSidebar?.();
      navigate("/auth");
    }
  };

  return (
    <div className="w-full h-full flex flex-col text-white">
      <div className="px-4 py-5 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
          <Sparkles size={13} />
        </div>
        <span className="text-sm font-semibold">AI Chat</span>
      </div>

      <div className="px-3 pt-4 pb-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 py-2.5 rounded-xl text-sm"
        >
          <MessageSquarePlus size={15} />
          New Chat
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {chats.length === 0 ? (
          <p className="text-xs text-gray-500 px-2">No chats yet</p>
        ) : (
          chats.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectChat(c)}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activeId === c.id
                  ? "bg-blue-500/20"
                  : "hover:bg-white/5 text-gray-300"
              }`}
            >
              <p className="text-sm truncate">{c.title}</p>
            </button>
          ))
        )}
      </div>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-red-400"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );
}