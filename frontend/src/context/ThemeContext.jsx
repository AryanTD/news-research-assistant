import React, { createContext, useContext, useState, useEffect } from "react";

// ── Theme definitions ────────────────────────────────────────────────────────
// Each token is a named color used across the app.
// Dark = black + red  |  Light = white + dark blue

const darkTheme = {
  name: "dark",
  // Accent (primary interactive color)
  accent: "#ef4444",
  accentHover: "#dc2626",
  accentBg: "rgba(239, 68, 68, 0.1)",
  // Backgrounds
  sidebarBg: "#000000",
  mainBg: "#121212",
  cardBg: "#1a1a1a",
  cardBgHover: "#242424",
  inputBg: "#242424",
  inputBgFocus: "#2a2a2a",
  deepInputBg: "#121212",
  gradientFrom: "#1a1a1a",
  gradientTo: "#2a2a2a",
  // Borders
  border: "#282828",
  // Text
  textPrimary: "#ffffff",
  textSecondary: "#b3b3b3",
  textMuted: "#6b7280",
  textBody: "#c9c9c9",
  // Navigation
  navActiveBg: "#242424",
  navHoverBg: "#1a1a1a",
  // Buttons
  buttonSecondaryBg: "#242424",
  buttonSecondaryBgHover: "#2f2f2f",
  disabledBg: "#3a3a3a",
  // Pagination disabled
  navBorderDisabled: "#1e1e1e",
  navTextDisabled: "#3a3a3a",
};

const lightTheme = {
  name: "light",
  // Accent (primary interactive color)
  accent: "#1e3a8a",
  accentHover: "#1e40af",
  accentBg: "rgba(30, 58, 138, 0.1)",
  // Backgrounds
  sidebarBg: "#f8fafc",
  mainBg: "#ffffff",
  cardBg: "#f1f5f9",
  cardBgHover: "#e2e8f0",
  inputBg: "#e2e8f0",
  inputBgFocus: "#dbeafe",
  deepInputBg: "#f8fafc",
  gradientFrom: "#f1f5f9",
  gradientTo: "#e2e8f0",
  // Borders
  border: "#cbd5e1",
  // Text
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  textBody: "#334155",
  // Navigation
  navActiveBg: "#e2e8f0",
  navHoverBg: "#f1f5f9",
  // Buttons
  buttonSecondaryBg: "#e2e8f0",
  buttonSecondaryBgHover: "#dbeafe",
  disabledBg: "#94a3b8",
  // Pagination disabled
  navBorderDisabled: "#e2e8f0",
  navTextDisabled: "#94a3b8",
};

// ── Context setup ────────────────────────────────────────────────────────────

const ThemeContext = createContext(null);

// ThemeProvider wraps the whole app and makes the theme available everywhere.
// It also persists the user's choice in localStorage so it survives page refreshes.
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("rh-theme");
    return saved === "light" ? lightTheme : darkTheme;
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev.name === "dark" ? lightTheme : darkTheme;
      localStorage.setItem("rh-theme", next.name);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme() is the hook every component calls to get the current theme colors.
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
