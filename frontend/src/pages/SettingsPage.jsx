import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Info, Cpu, Globe, FileText } from "lucide-react";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  const sectionStyle = {
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: theme.textMuted,
    marginBottom: "16px",
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: `1px solid ${theme.border}`,
  };

  const lastRowStyle = {
    ...rowStyle,
    borderBottom: "none",
  };

  const techItems = [
    { icon: <Cpu size={16} />, label: "AI Model", value: "Claude Sonnet (claude-sonnet-4-20250514)" },
    { icon: <Globe size={16} />, label: "News Source", value: "NewsAPI.org" },
    { icon: <FileText size={16} />, label: "Document Search", value: "ChromaDB + all-MiniLM-L6-v2 embeddings" },
  ];

  return (
    <div
      style={{
        padding: "48px 32px",
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: theme.textPrimary,
          marginBottom: "8px",
        }}
      >
        Settings
      </h1>
      <p style={{ fontSize: "15px", color: theme.textSecondary, marginBottom: "40px" }}>
        Manage your preferences and learn about this app.
      </p>

      {/* Appearance */}
      <div style={sectionStyle}>
        <p style={labelStyle}>Appearance</p>
        <div style={lastRowStyle}>
          <div>
            <p style={{ fontSize: "15px", fontWeight: "500", color: theme.textPrimary, marginBottom: "4px" }}>
              Theme
            </p>
            <p style={{ fontSize: "13px", color: theme.textSecondary }}>
              Currently using <strong style={{ color: theme.accent }}>{theme.name}</strong> mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: theme.inputBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.accent;
              e.currentTarget.style.backgroundColor = theme.accentBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.backgroundColor = theme.inputBg;
            }}
          >
            {theme.name === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            Switch to {theme.name === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {/* About */}
      <div style={sectionStyle}>
        <p style={labelStyle}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Info size={12} /> About
          </span>
        </p>
        <div style={rowStyle}>
          <span style={{ fontSize: "14px", color: theme.textSecondary }}>App</span>
          <span style={{ fontSize: "14px", color: theme.textPrimary, fontWeight: "500" }}>
            News Research Assistant
          </span>
        </div>
        <div style={rowStyle}>
          <span style={{ fontSize: "14px", color: theme.textSecondary }}>Version</span>
          <span style={{ fontSize: "14px", color: theme.textPrimary, fontWeight: "500" }}>1.0.0</span>
        </div>
        <div style={rowStyle}>
          <span style={{ fontSize: "14px", color: theme.textSecondary }}>Backend</span>
          <span style={{ fontSize: "14px", color: theme.textPrimary, fontWeight: "500" }}>
            Node.js / Express (port 3000)
          </span>
        </div>
        <div style={lastRowStyle}>
          <span style={{ fontSize: "14px", color: theme.textSecondary }}>Frontend</span>
          <span style={{ fontSize: "14px", color: theme.textPrimary, fontWeight: "500" }}>
            React (port 3001)
          </span>
        </div>
      </div>

      {/* Tech Stack */}
      <div style={sectionStyle}>
        <p style={labelStyle}>Tech Stack</p>
        {techItems.map((item, i) => (
          <div key={i} style={i === techItems.length - 1 ? lastRowStyle : rowStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: theme.textSecondary }}>
              {item.icon}
              <span style={{ fontSize: "14px" }}>{item.label}</span>
            </div>
            <span
              style={{
                fontSize: "13px",
                color: theme.textPrimary,
                fontWeight: "500",
                maxWidth: "320px",
                textAlign: "right",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
