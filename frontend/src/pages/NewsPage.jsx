import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, ExternalLink } from "lucide-react";
import { newsAPI } from "../services/api";
import SearchBar from "../components/common/SearchBar";

const NewsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      searchNews(query);
    }
  }, [query]);

  const searchNews = async (searchQuery) => {
    setLoading(true);
    setError(null);

    try {
      const response = await newsAPI.search(searchQuery);

      if (response.success) {
        setArticles(response.data.articles || []);
      } else {
        setError("Failed to fetch news");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      console.error("News search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#121212" }}>
      {/* Header with Back Button and Search */}
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#121212",
          borderBottom: "1px solid #282828",
          padding: "16px 32px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Back Button */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#242424";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1a1a1a";
            }}
          >
            <ArrowLeft size={20} />
          </Link>

          {/* Search Bar */}
          <SearchBar placeholder={`Search news...`} />
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* Results Header */}
        {query && (
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#ffffff",
                marginBottom: "8px",
              }}
            >
              Results for "{query}"
            </h1>
            {!loading && (
              <p style={{ fontSize: "16px", color: "#b3b3b3" }}>
                Found {articles.length} article
                {articles.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #1a1a1a",
                  borderTop: "4px solid #ef4444",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p style={{ color: "#b3b3b3" }}>Searching news...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: "24px",
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              border: "1px solid #ef4444",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#ef4444", fontSize: "16px" }}>❌ {error}</p>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && !error && articles.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "24px",
            }}
          >
            {articles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && articles.length === 0 && query && (
          <div
            style={{
              textAlign: "center",
              padding: "64px 32px",
            }}
          >
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</p>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ffffff",
                marginBottom: "8px",
              }}
            >
              No articles found
            </h2>
            <p style={{ color: "#b3b3b3" }}>Try a different search term</p>
          </div>
        )}
      </div>

      {/* Add spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Article Card Component
const ArticleCard = ({ article }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #282828",
        transition: "all 0.2s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        borderColor: isHovered ? "#ef4444" : "#282828",
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Placeholder */}
      <div
        style={{
          width: "100%",
          height: "200px",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px",
        }}
      >
        📰
      </div>

      {/* Content */}
      <div style={{ padding: "20px" }}>
        {/* Source & Time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#ef4444",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {article.source || "News Source"}
          </span>
          <span style={{ color: "#6b7280" }}>•</span>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString()
              : "Recent"}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: "12px",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title || "Article Title"}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "14px",
            color: "#b3b3b3",
            lineHeight: "1.6",
            marginBottom: "16px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.description || "Article description will appear here..."}
        </p>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ef4444";
            }}
            onClick={() => {
              if (article.url) {
                window.open(article.url, "_blank");
              }
            }}
          >
            Read Article
            <ExternalLink size={16} />
          </button>

          <button
            style={{
              padding: "10px 16px",
              backgroundColor: "#242424",
              color: "#ffffff",
              border: "1px solid #282828",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2a2a2a";
              e.currentTarget.style.borderColor = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#242424";
              e.currentTarget.style.borderColor = "#282828";
            }}
          >
            <Sparkles size={16} />
            AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
