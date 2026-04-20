import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Library, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Trending", path: "/news" },
    { icon: Library, label: "Your Library", path: "/library" },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "240px",
        height: "100vh",
        backgroundColor: theme.sidebarBg,
        borderRight: `1px solid ${theme.border}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: theme.accent,
            margin: 0,
          }}
        >
          ResearchHub
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 12px" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "8px",
              textDecoration: "none",
              backgroundColor: isActive ? theme.navActiveBg : "transparent",
              color: isActive ? theme.accent : theme.textSecondary,
              transition: "all 0.2s ease",
            })}
            onMouseEnter={(e) => {
              if (e.currentTarget.getAttribute("aria-current") !== "page") {
                e.currentTarget.style.color = theme.textPrimary;
                e.currentTarget.style.backgroundColor = theme.navHoverBg;
              }
            }}
            onMouseLeave={(e) => {
              if (e.currentTarget.getAttribute("aria-current") !== "page") {
                e.currentTarget.style.color = theme.textSecondary;
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <item.icon size={24} />
            <span style={{ fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Theme toggle + Settings */}
      <div style={{ padding: "12px" }}>
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme.name === "dark" ? "light" : "dark"} mode`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "4px",
            textDecoration: "none",
            color: theme.textSecondary,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.textPrimary;
            e.currentTarget.style.backgroundColor = theme.navHoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.textSecondary;
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {theme.name === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          <span>{theme.name === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <NavLink
          to="/settings"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 16px",
            borderRadius: "8px",
            textDecoration: "none",
            color: theme.textSecondary,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.textPrimary;
            e.currentTarget.style.backgroundColor = theme.navHoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.textSecondary;
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Settings size={24} />
          <span style={{ fontWeight: 500 }}>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
