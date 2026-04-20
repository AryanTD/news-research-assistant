import React from "react";
import { X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Reusable slide-out panel that appears from the right side of the screen.
// Props:
//   isOpen   — whether the panel is visible
//   onClose  — called when the user closes the panel (X button or backdrop click)
//   title    — text shown in the panel header
//   children — content rendered inside the panel body
//   width    — panel width (default 480px)
const SlidePanel = ({ isOpen, onClose, title, children, width = "480px" }) => {
  const { theme } = useTheme();

  return (
    <>
      {/* Backdrop — clicking it closes the panel */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: width,
          backgroundColor: theme.cardBg,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: `1px solid ${theme.border}`,
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: theme.textPrimary,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "calc(100% - 40px)",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.textSecondary,
              display: "flex",
              alignItems: "center",
              padding: "4px",
              borderRadius: "4px",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.textSecondary)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content area — scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default SlidePanel;
