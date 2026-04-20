import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import SlidePanel from "../common/SlidePanel";
import { documentsAPI } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

// Chat panel for asking questions about a specific document (RAG).
// Props:
//   document — the document object (must have .id and .filename)
//   onClose  — called when the panel should close
const DocumentQAPanel = ({ document, onClose }) => {
  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", content: string }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const { theme } = useTheme();

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    // Optimistically add user message
    const updatedMessages = [...messages, { role: "user", content: question }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Pass the conversation history so Claude has context for follow-ups
      const response = await documentsAPI.ask(document.id, question, messages);

      if (response.success) {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: response.data.answer },
        ]);
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (err) {
      console.error("Q&A error:", err);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <SlidePanel isOpen={true} onClose={onClose} title={document.filename || document.id}>
      {/* Message area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.length === 0 && (
          <p
            style={{
              color: theme.textMuted,
              fontSize: "14px",
              textAlign: "center",
              margin: "auto 0",
            }}
          >
            Ask a question about this document
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "14px",
                lineHeight: "1.5",
                backgroundColor: msg.role === "user" ? theme.accent : theme.buttonSecondaryBg,
                color: msg.role === "user" ? "#ffffff" : theme.textSecondary,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator — shows while waiting for AI response */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                backgroundColor: theme.buttonSecondaryBg,
                color: theme.textSecondary,
                fontSize: "14px",
              }}
            >
              <span style={{ letterSpacing: "2px" }}>...</span>
            </div>
          </div>
        )}

        {/* Invisible element used to scroll to the bottom */}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — fixed to the bottom of the panel */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 14px",
            backgroundColor: theme.deepInputBg,
            border: `1px solid ${theme.border}`,
            borderRadius: "8px",
            color: theme.textPrimary,
            fontSize: "14px",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent)}
          onBlur={(e) => (e.currentTarget.style.borderColor = theme.border)}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 14px",
            backgroundColor: loading || !input.trim() ? theme.disabledBg : theme.accent,
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading && input.trim()) e.currentTarget.style.backgroundColor = theme.accentHover;
          }}
          onMouseLeave={(e) => {
            if (!loading && input.trim()) e.currentTarget.style.backgroundColor = theme.accent;
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </SlidePanel>
  );
};

export default DocumentQAPanel;
