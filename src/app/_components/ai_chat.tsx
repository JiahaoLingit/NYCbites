"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are a friendly food and restaurant assistant for "Out & About NYC" — a restaurant recommendation app for New York City.

Your job is to help users:
- Discover restaurants based on their cravings, budget, cuisine, and dining style
- Navigate the app (e.g. how to set preferences, how to use the map)
- Answer questions about neighborhoods, cuisines, and dining experiences in NYC
- Give quick, practical suggestions

Keep responses short and conversational — 2-4 sentences max unless the user asks for a list. Use a warm, helpful tone. You can use food emojis occasionally. Do not make up specific restaurant names unless the user explicitly asks for recommendations, in which case you can suggest well-known NYC spots.`;

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! 🍽️ I'm your food assistant. Tell me what you're craving and I'll help you find the perfect spot in NYC!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text ?? "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 1000,
          width: "54px", height: "54px", borderRadius: "50%",
          background: open ? "#9a3412" : "#ea580c",
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(234,88,12,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px",
          transition: "background 0.2s, transform 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        aria-label="Open food assistant"
      >
        {open ? "✕" : "🍽️"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: "90px", right: "24px", zIndex: 999,
          width: "340px", maxHeight: "480px",
          background: "white", borderRadius: "18px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          border: "0.5px solid #e5e7eb",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp 0.2s ease",
        }}>

          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "#ea580c",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>🍽️</div>
            <div>
              <div style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>Food Assistant</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>Powered by Claude AI</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "14px 12px",
            display: "flex", flexDirection: "column", gap: "10px",
            scrollbarWidth: "thin",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "9px 13px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "#ea580c" : "#f3f4f6",
                  color: msg.role === "user" ? "white" : "#111827",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                  background: "#f3f4f6", display: "flex", gap: "4px", alignItems: "center",
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "#9ca3af",
                      display: "inline-block",
                      animation: `bounce 1s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px",
            borderTop: "0.5px solid #f3f4f6",
            display: "flex", gap: "8px", alignItems: "center",
            background: "white",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="What are you craving?"
              style={{
                flex: 1, padding: "9px 13px",
                borderRadius: "20px",
                border: "0.5px solid #e5e7eb",
                fontSize: "13px", outline: "none",
                background: "#f9fafb",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: input.trim() && !loading ? "#ea580c" : "#e5e7eb",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "15px", transition: "background 0.15s",
                flexShrink: 0,
              }}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
