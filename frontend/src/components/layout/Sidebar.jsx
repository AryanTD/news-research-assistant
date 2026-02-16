import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Library, Settings } from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "News Search", path: "/news" },
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
        backgroundColor: "#000000",
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
            color: "#ef4444",
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
              backgroundColor: isActive ? "#242424" : "transparent",
              color: isActive ? "#ef4444" : "#b3b3b3",
              transition: "all 0.2s ease",
            })}
            onMouseEnter={(e) => {
              if (e.currentTarget.getAttribute("aria-current") !== "page") {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.backgroundColor = "#1a1a1a";
              }
            }}
            onMouseLeave={(e) => {
              if (e.currentTarget.getAttribute("aria-current") !== "page") {
                e.currentTarget.style.color = "#b3b3b3";
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <item.icon size={24} />
            <span style={{ fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div style={{ padding: "12px" }}>
        <NavLink
          to="/settings"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 16px",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#b3b3b3",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.backgroundColor = "#1a1a1a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#b3b3b3";
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
