export const streamMessage = async (
  token,
  message,
  { onStart, onChunk, onEnd, onError }
) => {
  const controller = new AbortController();

  try {
    onStart?.();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chat-stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Streaming not supported");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // If server sends SSE (text/event-stream) we'll parse by lines,
    // otherwise handle raw streaming by emitting decoded chunks immediately.
    const contentType = response.headers.get("content-type") || "";
    const isSSE = contentType.includes("text/event-stream");

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });

      if (!isSSE) {
        // raw streaming: emit immediately
        onChunk?.(chunkText);
        continue;
      }

      // SSE parsing: accumulate until newlines
      buffer += chunkText;
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;

        if (line.startsWith("data:")) {
          const data = line.replace("data:", "").trim();

          if (data === "[DONE]") {
            onEnd?.();
            return controller;
          }

          try {
            const parsed = JSON.parse(data);
            onChunk?.(parsed.token || parsed.text || "");
          } catch {
            onChunk?.(data);
          }
        } else {
          onChunk?.(line);
        }
      }
    }

    onEnd?.();
    return controller;

  } catch (err) {
    if (err.name !== "AbortError") {
      onError?.(err.message);
    }
    return controller;
  }
};