import React from "react";
import SearchBar from "../components/common/SearchBar";

const HomePage = () => {
  const suggestions = [
    "Tesla earnings",
    "AI breakthroughs",
    "Climate summit",
    "Manchester United",
    "Bitcoin price",
  ];

  return (
    <div
      style={{
        padding: "64px 32px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Hero Heading */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          What are you researching today?
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#b3b3b3",
            marginBottom: "40px",
          }}
        >
          Search for news, upload documents, and get AI-powered insights.
        </p>

        {/* SearchBar Component */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          <SearchBar placeholder="Search news, ask AI questions..." />
        </div>

        {/* Suggestions */}
        <div style={{ marginTop: "24px" }}>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              marginBottom: "12px",
            }}
          >
            Try searching:
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  // Navigate to news with this query
                  window.location.href = `/news?q=${encodeURIComponent(suggestion)}`;
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1a1a1a",
                  color: "#b3b3b3",
                  border: "1px solid #282828",
                  borderRadius: "16px",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#242424";
                  e.currentTarget.style.borderColor = "#ef4444";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                  e.currentTarget.style.borderColor = "#282828";
                  e.currentTarget.style.color = "#b3b3b3";
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions (Optional) */}
      <div
        style={{
          marginTop: "64px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {/* News Card */}
        <div
          style={{
            padding: "32px",
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            border: "1px solid #282828",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#ef4444";
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#282828";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onClick={() => (window.location.href = "/news")}
        >
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>📰</div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "8px",
            }}
          >
            Browse News
          </h3>
          <p style={{ fontSize: "14px", color: "#b3b3b3" }}>
            Search and read the latest news with AI-powered summaries and
            fact-checking.
          </p>
        </div>

        {/* Library Card */}
        <div
          style={{
            padding: "32px",
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            border: "1px solid #282828",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#ef4444";
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#282828";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onClick={() => (window.location.href = "/library")}
        >
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>📁</div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "8px",
            }}
          >
            Your Library
          </h3>
          <p style={{ fontSize: "14px", color: "#b3b3b3" }}>
            Upload and chat with your documents using AI semantic search.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
