import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ placeholder = "Search news, ask AI questions..." }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (query.trim()) {
      // Navigate to news results page with query
      navigate(`/news?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "800px" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Search Icon */}
        <Search
          size={24}
          style={{
            position: "absolute",
            left: "20px",
            color: "#6b7280",
            pointerEvents: "none",
          }}
        />

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: "56px",
            paddingLeft: "60px",
            paddingRight: "20px",
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#242424",
            border: "2px solid transparent",
            borderRadius: "28px",
            outline: "none",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = "#2a2a2a";
            e.target.style.borderColor = "#ef4444";
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = "#242424";
            e.target.style.borderColor = "transparent";
          }}
        />

        {/* Submit happens on Enter or we can add a button */}
        {query && (
          <button
            type="submit"
            style={{
              position: "absolute",
              right: "8px",
              width: "40px",
              height: "40px",
              backgroundColor: "#ef4444",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#dc2626";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ef4444";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Search size={20} color="#ffffff" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
