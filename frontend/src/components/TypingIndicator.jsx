import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div
      className="flex items-start gap-3"
      role="status"
      aria-live="polite"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
        AI
      </div>

      {/* Bubble */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1">

        {/* Animated dots */}
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-gray-300 rounded-full"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}