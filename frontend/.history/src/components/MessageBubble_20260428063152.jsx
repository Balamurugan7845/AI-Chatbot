import { useState, useCallback } from "react";

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

function detectType(text) {
  if (!text) return "paragraph";
  if (text.includes("•")) return "list";
  if (text.includes("Title") && text.includes("Definition")) return "structured";
  return "paragraph";
}

function StructuredView({ text }) {
  const lines = text.split("\n");
  const sections = {};
  let current = null;

  lines.forEach((line) => {
    const t = line.trim();
    if (!t) return;
    if (["Title", "Definition", "Key Characteristics", "Core Functions"].includes(t)) {
      current = t;
      sections[current] = [];
      return;
    }
    if (current) sections[current].push(t);
  });

  return (
    <div className="text-sm">
      {sections["Title"] && (
        <div className="font-semibold text-base">{sections["Title"].join(" ")}</div>
      )}

      {sections["Definition"] && (
        <p className="text-sm text-gray-200 mt-1">{sections["Definition"].join(" ")}</p>
      )}

      {sections["Key Characteristics"] && (
        <ul className="list-disc ml-5 mt-2">
          {sections["Key Characteristics"].join("\n").split("\n").map((l,i) => (
            <li key={i}>{l.replace(/^•\s?/, "")}</li>
          ))}
        </ul>
      )}

      {sections["Core Functions"] && (
        <ul className="list-disc ml-5 mt-2">
          {sections["Core Functions"].join("\n").split("\n").map((l,i) => (
            <li key={i}>{l.replace(/^•\s?/, "")}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Bot avatar
function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 mt-0.5">
      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    </div>
  );
}

// User avatar
function UserAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
      <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
  );
}

// Copy button
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      // Strip streaming cursor if present
      await navigator.clipboard.writeText(text.replace(/▋$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [text]);

  return (
    <button
      onClick={copy}
      title={copied ? "Copied!" : "Copy message"}
      className={`
        p-1 rounded transition-all duration-150
        ${copied
          ? "text-green-400"
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        }
      `}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      )}
    </button>
  );
}

export default function MessageBubble({ role, text, timestamp, isError }) {
  const isBot = role === "bot";
  const isStreaming = text?.endsWith("▋");
  const displayText = isStreaming ? text.slice(0, -1) : text;

  return (
    <div className={`flex gap-2 group ${isBot ? "justify-start" : "justify-end"} mb-3`}>

      {/* Bot avatar — left side */}
      {isBot && <BotAvatar />}

      <div className={`flex flex-col gap-1 max-w-[82%] sm:max-w-[70%] ${isBot ? "items-start" : "items-end"}`}>

        {/* Bubble */}
        <div
          className={`
            relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words
            ${isBot
              ? isError
                ? "bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm"
                : "bg-white/8 border border-white/8 text-gray-100 rounded-tl-sm"
              : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-blue-500/20"
            }
          `}
        >
          {(() => {
            if (!displayText) return isStreaming ? "" : <span className="text-gray-500 italic text-xs">Empty message</span>;

            const type = detectType(displayText);

            if (type === "structured") return <StructuredView text={displayText} />;

            if (type === "list") {
              return (
                <ul className="list-disc ml-5 text-sm">
                  {displayText.split("\n").map((l, i) =>
                    l.startsWith("•") ? <li key={i}>{l.slice(1).trim()}</li> : null
                  )}
                </ul>
              );
            }

            return <p className="text-sm">{displayText}</p>;
          })()}

          {/* Streaming cursor */}
          {isStreaming && (
            <span className="inline-block w-0.5 h-3.5 bg-blue-400 ml-0.5 animate-pulse align-middle rounded-full" />
          )}
        </div>

        {/* Footer: timestamp + copy */}
        <div className={`flex items-center gap-1.5 px-1 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
          {timestamp && (
            <span className="text-[10px] text-gray-600 tabular-nums">
              {formatTime(timestamp)}
            </span>
          )}

          {/* Copy button — shown on group hover */}
          {displayText && !isError && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <CopyButton text={displayText} />
            </span>
          )}
        </div>
      </div>

      {/* User avatar — right side */}
      {!isBot && <UserAvatar />}
    </div>
  );
}