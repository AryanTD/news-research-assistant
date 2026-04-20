import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, ExternalLink, LayoutGrid, List } from "lucide-react";
import { newsAPI } from "../services/api";
import SearchBar from "../components/common/SearchBar";
import { useTheme } from "../context/ThemeContext";

const NewsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const { theme } = useTheme();

  const [articles, setArticles] = useState([]);
  const [keywords, setKeywords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  useEffect(() => {
    if (query) {
      searchNews(query);
    } else {
      fetchTrending();
    }
  }, [query]);

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsAPI.trending();
      if (response.success) {
        setArticles(response.data.articles || []);
      } else {
        setError("Failed to fetch trending news");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const searchNews = async (searchQuery) => {
    setLoading(true);
    setError(null);

    try {
      const response = await newsAPI.search(searchQuery);

      if (response.success) {
        setArticles(response.data.articles || []);
        setKeywords(response.data.keywords || null);
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
    <div style={{ minHeight: "100vh", backgroundColor: theme.mainBg }}>
      {/* Header with Back Button and Search */}
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: theme.mainBg,
          borderBottom: `1px solid ${theme.border}`,
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
              backgroundColor: theme.cardBg,
              color: theme.textPrimary,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.cardBgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.cardBg;
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
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: theme.textPrimary,
                marginBottom: "8px",
              }}
            >
              {query
                ? `Results for "${keywords && keywords !== query ? keywords : query}"`
                : "Trending Now"}
            </h1>
            {keywords && keywords !== query && (
              <p style={{ fontSize: "13px", color: theme.textMuted, marginBottom: "4px" }}>
                from: "{query}"
              </p>
            )}
            {!loading && (
              <p style={{ fontSize: "16px", color: theme.textSecondary }}>
                {query
                  ? `Found ${articles.length} article${articles.length !== 1 ? "s" : ""}`
                  : "Top headlines right now"}
              </p>
            )}
          </div>

          {/* View Toggle */}
          {!loading && articles.length > 0 && (
            <div style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: viewMode === "grid" ? theme.accent : theme.textMuted,
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Grid view"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: viewMode === "list" ? theme.accent : theme.textMuted,
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
                title="List view"
              >
                <List size={20} />
              </button>
            </div>
          )}
        </div>

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
                  border: `4px solid ${theme.cardBg}`,
                  borderTop: `4px solid ${theme.accent}`,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p style={{ color: theme.textSecondary }}>Searching news...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: "24px",
              backgroundColor: theme.cardBg,
              borderRadius: "12px",
              border: `1px solid ${theme.accent}`,
              textAlign: "center",
            }}
          >
            <p style={{ color: theme.accent, fontSize: "16px" }}>❌ {error}</p>
          </div>
        )}

        {/* Articles Grid / List */}
        {!loading && !error && articles.length > 0 && (
          viewMode === "grid" ? (
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
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {articles.map((article, index) => (
                <ArticleRow key={index} article={article} />
              ))}
            </div>
          )
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
                color: theme.textPrimary,
                marginBottom: "8px",
              }}
            >
              No articles found
            </h2>
            <p style={{ color: theme.textSecondary }}>Try a different search term</p>
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
  const { theme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid ${isHovered ? theme.accent : theme.border}`,
        transition: "all 0.2s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content */}
      <div style={{ padding: "16px" }}>
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
              color: theme.accent,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {article.source || "News Source"}
          </span>
          <span style={{ color: theme.textMuted }}>•</span>
          <span style={{ fontSize: "12px", color: theme.textMuted }}>
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
            color: theme.textPrimary,
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
            color: theme.textSecondary,
            lineHeight: "1.6",
            marginBottom: "16px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
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
              backgroundColor: theme.accent,
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
              e.currentTarget.style.backgroundColor = theme.accentHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent;
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
              backgroundColor: theme.buttonSecondaryBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
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
              e.currentTarget.style.backgroundColor = theme.buttonSecondaryBgHover;
              e.currentTarget.style.borderColor = theme.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.buttonSecondaryBg;
              e.currentTarget.style.borderColor = theme.border;
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

// Article Row Component (list view)
const ArticleRow = ({ article }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px 16px",
        backgroundColor: isHovered ? theme.cardBg : "transparent",
        border: "1px solid",
        borderColor: isHovered ? theme.border : "transparent",
        borderRadius: "8px",
        transition: "all 0.15s ease",
        cursor: "default",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Source */}
      <div
        style={{
          width: "120px",
          flexShrink: 0,
          fontSize: "11px",
          color: theme.accent,
          fontWeight: 600,
          textTransform: "uppercase",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {article.source || "News"}
      </div>

      {/* Title */}
      <div
        style={{
          flex: 1,
          fontSize: "14px",
          fontWeight: "bold",
          color: theme.textPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {article.title || "Untitled"}
      </div>

      {/* Date */}
      <div
        style={{
          width: "90px",
          flexShrink: 0,
          fontSize: "12px",
          color: theme.textMuted,
          textAlign: "right",
        }}
      >
        {article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString()
          : "Recent"}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          title="Read Article"
          onClick={() => article.url && window.open(article.url, "_blank")}
          style={{
            padding: "6px",
            backgroundColor: theme.accent,
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.accentHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.accent; }}
        >
          <ExternalLink size={14} />
        </button>
        <button
          title="AI Summary"
          style={{
            padding: "6px",
            backgroundColor: theme.buttonSecondaryBg,
            color: theme.textSecondary,
            border: `1px solid ${theme.border}`,
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; }}
        >
          <Sparkles size={14} />
        </button>
      </div>
    </div>
  );
};

export default NewsPage;
