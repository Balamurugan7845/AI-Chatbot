import { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatLayout() {
  const [chat, setChat] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white overflow-hidden"
    >
      {/* 🔝 Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-gray-950 border-b border-white/10">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu />
        </button>
        <span className="text-sm font-semibold">AI Chat</span>
      </div>

      {/* 🌑 Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 📚 Sidebar */}
      <div
        className={`
          fixed md:static z-40
          h-full w-64
          bg-gray-950/95 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar
          setCurrentChat={setChat}
          closeSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* 💬 Chat Area */}
      <div className="flex-1 flex flex-col pt-14 md:pt-0 min-h-0">
        <ChatWindow token={token} chat={chat} setChat={setChat} />
      </div>
    </motion.div>
  );
}