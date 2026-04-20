import React from "react";
import Sidebar from "./Sidebar";
import { useTheme } from "../../context/ThemeContext";

const MainLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.sidebarBg,
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - offset by sidebar width */}
      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          backgroundColor: theme.mainBg,
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
