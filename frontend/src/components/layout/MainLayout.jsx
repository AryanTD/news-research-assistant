import React from "react";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#000000",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - offset by sidebar width */}
      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          backgroundColor: "#121212",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
