```javascript
import { useState, useCallback } from "react";

/* ---------------- UTIL ---------------- */

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function detectType(text = "") {
  if (!text) return "paragraph";
  if (text.includes("•")) return "list";
  if (text.includes("Title") && text.includes("Definition"))
    return "structured";
  return "paragraph";
}

/* ---------------- STRUCTURED VIEW ---------------- */

function StructuredView({ text = "" }) {
  const lines = text.split("\n");
  const sections = {};
  let current = null;

  lines.forEach((line) => {
    const t = line.trim();
    if (!t) return;

    if (
      ["Title", "Definition", "Key Characteristics", "Core Functions"].includes(
        t
      )
    ) {
      current = t;
      sections[current] = [];
      return;
    }

    if (current) sections[current].push(t);
  });

  return (
    <div className="text-sm">
      {sections["Title"] && (
        <div className="font-semibold text-base">
          {sections["Title"].join(" ")}
        </div>
      )}

      {sections["Definition"] && (
        <p className="text-gray-200 mt-1">
          {sections["Definition"].join(" ")}
        </p>
      )}

      {["Key Characteristics", "Core Functions"].map(
        (key) =>
          sections[key] && (
            <ul key={key} className="list-disc ml-5 mt-2">
              {sections[key].map((l, i) => (
                <li key={i}>{l.replace(/^•\s?/, "")}</li>
              ))}
            </ul>
          )
      )}
    </div>
  );
}

/* ---------------- AVATARS ---------------- */

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md shrink-0 mt-0.5">
      <span className="text-white text-xs font-bold">AI</span>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-gray-300 text-xs">U</span>
    </div>
  );
}

/* ---------------- COPY BUTTON ---------------- */

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text.replace(/▋$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [text]);

  return (
    <button
      onClick={copy}
      title={copied ? "Copied!" : "Copy"}
      className={`p-1 rounded transition ${
        copied
          ? "text-green-400"
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
      }`}
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function MessageBubble({
  role,
  text = "",
  timestamp,
  isError,
}) {
  const isBot = role === "bot";
  const isStreaming = text.endsWith("▋");
  const displayText = isStreaming ? text.slice(0, -1) : text;

  const type = detectType(displayText);

  return (
    <div
      className={`flex gap-2 group ${
        isBot ? "justify-start" : "justify-end"
      } mb-3`}
    >
      {/* Bot Avatar */}
      {isBot && <BotAvatar />}

      <div
        className={`flex flex-col gap-1 max-w-[82%] sm:max-w-[70%] ${
          isBot ? "items-start" : "items-end"
        }`}
      >
        {/* Message Bubble */}
        <div
          className={`
            px-3.5 py-2.5 rounded-2xl text-sm break-words leading-relaxed
            ${
              isBot
                ? isError
                  ? "bg-red-500/10 border border-red-500/20 text-red-300"
                  : "bg-white/10 border border-white/10 text-gray-100"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
            }
          `}
        >
          {!displayText && !isStreaming ? (
            <span className="text-gray-500 italic text-xs">
              Empty message
            </span>
          ) : type === "structured" ? (
            <StructuredView text={displayText} />
          ) : type === "list" ? (
            <ul className="list-disc ml-5">
              {displayText
                .split("\n")
                .filter((l) => l.startsWith("•"))
                .map((l, i) => (
                  <li key={i}>{l.replace(/^•\s?/, "")}</li>
                ))}
            </ul>
          ) : (
            <p>{displayText}</p>
          )}

          {/* Streaming Cursor */}
          {isStreaming && (
            <span className="inline-block w-[2px] h-4 bg-blue-400 ml-1 animate-pulse rounded" />
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center gap-1 text-[10px] text-gray-500 ${
            isBot ? "" : "flex-row-reverse"
          }`}
        >
          {timestamp && <span>{formatTime(timestamp)}</span>}

          {displayText && !isError && (
            <span className="opacity-0 group-hover:opacity-100 transition">
              <CopyButton text={displayText} />
            </span>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {!isBot && <UserAvatar />}
    </div>
  );
}
