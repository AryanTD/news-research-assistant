import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ChevronLeft, ChevronRight, X, Search } from "lucide-react";
import { documentsAPI, API_BASE_URL } from "../services/api";
import DocumentQAPanel from "../components/library/DocumentQAPanel";
import { useTheme } from "../context/ThemeContext";

const PAGE_SIZE = 3000;

function buildPages(text) {
  const pages = [];
  let start = 0;
  while (start < text.length) {
    let end = start + PAGE_SIZE;
    if (end < text.length) {
      while (end > start && !/\s/.test(text[end])) end--;
      if (end === start) end = start + PAGE_SIZE;
    } else {
      end = text.length;
    }
    pages.push(text.slice(start, end).trim());
    start = end;
  }
  return pages;
}

function getPaginationItems(current, total) {
  const delta = 2;
  const range = new Set([0, total - 1]);
  for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.add(i);
  }
  const sorted = [...range].sort((a, b) => a - b);
  const items = [];
  let prev = -1;
  for (const idx of sorted) {
    if (idx - prev > 1) items.push("ellipsis-" + idx);
    items.push(idx);
    prev = idx;
  }
  return items;
}

// Find all match positions across the full text (case-insensitive).
// Returns array of { pageIndex, startInPage, endInPage } for each match.
function findAllMatches(pages, query) {
  if (!query || query.length < 1) return [];
  const lowerQuery = query.toLowerCase();
  const matches = [];

  pages.forEach((pageText, pageIndex) => {
    const lowerPage = pageText.toLowerCase();
    let pos = 0;
    while (true) {
      const idx = lowerPage.indexOf(lowerQuery, pos);
      if (idx === -1) break;
      matches.push({ pageIndex, startInPage: idx, endInPage: idx + query.length });
      pos = idx + 1;
    }
  });

  return matches;
}

// Render page text with search matches highlighted.
// activeMatchIndex is the index within matchesOnThisPage that is the "current" match.
function HighlightedText({ text, query, matchesOnPage, activeMatchIndexOnPage, theme }) {
  if (!query || matchesOnPage.length === 0) {
    return (
      <p style={{ fontSize: "16px", lineHeight: "1.9", color: theme.textBody, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "Georgia, 'Times New Roman', serif", margin: 0 }}>
        {text}
      </p>
    );
  }

  // Build segments: split text by match positions
  const segments = [];
  let cursor = 0;
  matchesOnPage.forEach((m, i) => {
    if (cursor < m.startInPage) {
      segments.push({ type: "text", content: text.slice(cursor, m.startInPage) });
    }
    segments.push({ type: "match", content: text.slice(m.startInPage, m.endInPage), isActive: i === activeMatchIndexOnPage });
    cursor = m.endInPage;
  });
  if (cursor < text.length) segments.push({ type: "text", content: text.slice(cursor) });

  return (
    <p style={{ fontSize: "16px", lineHeight: "1.9", color: theme.textBody, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "Georgia, 'Times New Roman', serif", margin: 0 }}>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.content}</span>
        ) : (
          <mark
            key={i}
            style={{
              backgroundColor: seg.isActive ? theme.accent : "#facc15",
              color: seg.isActive ? "#ffffff" : "#000000",
              borderRadius: "2px",
              padding: "0 1px",
            }}
          >
            {seg.content}
          </mark>
        )
      )}
    </p>
  );
}

// ── TXT pager ──────────────────────────────────────────────────────────────
const TxtReader = ({ text }) => {
  const { theme } = useTheme();
  const [pages]                       = useState(() => buildPages(text));
  const [currentPage, setCurrentPage] = useState(0);
  const [fading, setFading]           = useState(false);

  // Search state
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allMatches, setAllMatches]   = useState([]); // all matches across full doc
  const [matchIndex, setMatchIndex]   = useState(0);  // index into allMatches
  const searchInputRef                = useRef(null);

  const totalPages = pages.length;

  const goToPage = useCallback((idx) => {
    if (idx < 0 || idx >= totalPages) return;
    setFading(true);
    setTimeout(() => { setCurrentPage(idx); setFading(false); }, 150);
  }, [totalPages]);

  // Recompute matches whenever query changes
  useEffect(() => {
    const matches = findAllMatches(pages, searchQuery);
    setAllMatches(matches);
    setMatchIndex(0);
    // Jump to the page of the first match
    if (matches.length > 0) goToPage(matches[0].pageIndex);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open search bar
  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  // Close search bar and clear
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setAllMatches([]);
    setMatchIndex(0);
  }, []);

  // Navigate to next/prev match
  const goToMatch = useCallback((dir) => {
    if (allMatches.length === 0) return;
    const next = (matchIndex + dir + allMatches.length) % allMatches.length;
    setMatchIndex(next);
    goToPage(allMatches[next].pageIndex);
  }, [allMatches, matchIndex, goToPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      // Ctrl/Cmd+F → open search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        openSearch();
        return;
      }
      // Escape → close search
      if (e.key === "Escape" && searchOpen) { closeSearch(); return; }
      // Enter / Shift+Enter → next/prev match when search is open
      if (e.key === "Enter" && searchOpen) { goToMatch(e.shiftKey ? -1 : 1); return; }
      // Arrow page navigation (only when search is closed)
      if (!searchOpen) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "ArrowRight") goToPage(currentPage + 1);
        if (e.key === "ArrowLeft")  goToPage(currentPage - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, searchOpen, goToPage, openSearch, closeSearch, goToMatch]);

  // Matches on the current page
  const matchesOnCurrentPage = allMatches.filter(m => m.pageIndex === currentPage);
  // Which of those is the active (accent) one?
  const activeMatch = allMatches[matchIndex];
  const activeMatchIndexOnPage = activeMatch?.pageIndex === currentPage
    ? matchesOnCurrentPage.indexOf(matchesOnCurrentPage.find(
        m => m.startInPage === activeMatch.startInPage
      ))
    : -1;

  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1;
  const paginationItems = getPaginationItems(currentPage, totalPages);

  const navBtn = (disabled) => ({
    padding: "6px 14px", borderRadius: "6px",
    border: "1px solid " + (disabled ? theme.navBorderDisabled : theme.border),
    backgroundColor: "transparent",
    color: disabled ? theme.navTextDisabled : theme.textSecondary,
    fontSize: "14px", cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", gap: "4px",
    transition: "all 0.15s ease",
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* Search bar — floats below header, top-right */}
      {searchOpen && (
        <div style={{
          position: "absolute", top: "16px", right: "32px", zIndex: 100,
          display: "flex", alignItems: "center", gap: "6px",
          backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`,
          borderRadius: "10px", padding: "8px 12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          <Search size={14} color={theme.textMuted} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document…"
            style={{
              width: "220px", backgroundColor: "transparent", border: "none",
              color: theme.textPrimary, fontSize: "14px", outline: "none",
            }}
          />
          {/* Match counter */}
          {searchQuery && (
            <span style={{ fontSize: "12px", color: theme.textMuted, whiteSpace: "nowrap" }}>
              {allMatches.length === 0
                ? "No results"
                : `${matchIndex + 1} / ${allMatches.length}`}
            </span>
          )}
          {/* Prev match */}
          <button
            onClick={() => goToMatch(-1)}
            disabled={allMatches.length === 0}
            title="Previous match (Shift+Enter)"
            style={{ background: "none", border: "none", cursor: allMatches.length > 0 ? "pointer" : "not-allowed", color: allMatches.length > 0 ? theme.textSecondary : theme.navTextDisabled, padding: "2px", display: "flex" }}
            onMouseEnter={(e) => { if (allMatches.length > 0) e.currentTarget.style.color = theme.textPrimary; }}
            onMouseLeave={(e) => { if (allMatches.length > 0) e.currentTarget.style.color = theme.textSecondary; }}
          >
            <ChevronLeft size={16} />
          </button>
          {/* Next match */}
          <button
            onClick={() => goToMatch(1)}
            disabled={allMatches.length === 0}
            title="Next match (Enter)"
            style={{ background: "none", border: "none", cursor: allMatches.length > 0 ? "pointer" : "not-allowed", color: allMatches.length > 0 ? theme.textSecondary : theme.navTextDisabled, padding: "2px", display: "flex" }}
            onMouseEnter={(e) => { if (allMatches.length > 0) e.currentTarget.style.color = theme.textPrimary; }}
            onMouseLeave={(e) => { if (allMatches.length > 0) e.currentTarget.style.color = theme.textSecondary; }}
          >
            <ChevronRight size={16} />
          </button>
          {/* Close */}
          <button
            onClick={closeSearch}
            title="Close (Esc)"
            style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, padding: "2px", display: "flex" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Scrollable page card */}
      <div style={{ flex: 1, overflowY: "auto", padding: "40px 32px 24px" }}>
        <div style={{
          maxWidth: "720px", margin: "0 auto",
          backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`,
          borderRadius: "12px", padding: "48px 56px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)", minHeight: "400px",
          opacity: fading ? 0 : 1, transition: "opacity 0.15s ease",
        }}>
          <HighlightedText
            text={pages[currentPage]}
            query={searchQuery}
            matchesOnPage={matchesOnCurrentPage}
            activeMatchIndexOnPage={activeMatchIndexOnPage}
            theme={theme}
          />
        </div>
      </div>

      {/* Sticky bottom pagination bar */}
      <div style={{
        flexShrink: 0, borderTop: `1px solid ${theme.border}`,
        backgroundColor: theme.mainBg, padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "6px", flexWrap: "wrap",
      }}>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={!canPrev}
          style={navBtn(!canPrev)}
          onMouseEnter={(e) => { if (canPrev) { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.textPrimary; } }}
          onMouseLeave={(e) => { if (canPrev) { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; } }}
        >
          <ChevronLeft size={14} /> Prev
        </button>

        {paginationItems.map((item) =>
          typeof item === "string" ? (
            <span key={item} style={{ color: theme.textMuted, fontSize: "14px", padding: "0 2px" }}>…</span>
          ) : (
            <button
              key={item}
              onClick={() => goToPage(item)}
              style={{
                minWidth: "34px", height: "34px", padding: "0 6px", borderRadius: "6px",
                border: `1px solid ${item === currentPage ? theme.accent : theme.border}`,
                backgroundColor: item === currentPage ? theme.accentBg : "transparent",
                color: item === currentPage ? theme.accent : theme.textSecondary,
                fontSize: "14px", fontWeight: item === currentPage ? 600 : 400,
                cursor: item === currentPage ? "default" : "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { if (item !== currentPage) { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.textPrimary; } }}
              onMouseLeave={(e) => { if (item !== currentPage) { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; } }}
            >
              {item + 1}
            </button>
          )
        )}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={!canNext}
          style={navBtn(!canNext)}
          onMouseEnter={(e) => { if (canNext) { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.textPrimary; } }}
          onMouseLeave={(e) => { if (canNext) { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; } }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

// ── Main page ───────────────────────────────────────────────────────────────
const DocumentReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [document, setDocument] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [qaOpen, setQaOpen]     = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await documentsAPI.getContent(id);
        if (response.success) {
          setDocument(response.data);
        } else {
          setError(response.error || "Failed to load document");
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: `4px solid ${theme.cardBg}`, borderTop: `4px solid ${theme.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: theme.textSecondary, fontSize: "14px" }}>Loading document...</p>
          <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px", maxWidth: "680px", margin: "0 auto" }}>
        <button onClick={() => navigate("/library")} style={{ display: "flex", alignItems: "center", gap: "8px", color: theme.textSecondary, background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0, marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back to Library
        </button>
        <div style={{ padding: "24px", backgroundColor: theme.cardBg, borderRadius: "12px", border: `1px solid ${theme.accent}` }}>
          <p style={{ color: theme.accent, margin: 0 }}>Failed to load document: {error}</p>
        </div>
      </div>
    );
  }

  const isPDF   = document.fileType === "pdf";
  const fileUrl = `${API_BASE_URL}/documents/${id}/file`;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

        {/* ── Header ── */}
        <div style={{ padding: "24px 32px 0", flexShrink: 0 }}>
          <div style={{ maxWidth: isPDF ? "none" : "820px", margin: "0 auto 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>

            <div style={{ flex: 1, minWidth: 0 }}>
              <button
                onClick={() => navigate("/library")}
                style={{ display: "flex", alignItems: "center", gap: "6px", color: theme.textSecondary, background: "none", border: "none", cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "12px", transition: "color 0.15s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = theme.textSecondary)}
              >
                <ArrowLeft size={14} /> Back to Library
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: theme.accent, fontWeight: 600, textTransform: "uppercase", backgroundColor: theme.accentBg, padding: "3px 8px", borderRadius: "4px", flexShrink: 0 }}>
                  {document.fileType?.toUpperCase() || "DOC"}
                </span>
                <h1 style={{ fontSize: "20px", fontWeight: "bold", color: theme.textPrimary, margin: 0, wordBreak: "break-word" }}>
                  {document.filename}
                </h1>
              </div>

              <p style={{ fontSize: "13px", color: theme.textMuted, marginTop: "6px" }}>
                {document.chunkCount} chunks
                {document.pages ? ` · ${document.pages} pages` : ""}
                {document.timestamp && ` · ${new Date(document.timestamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`}
              </p>
            </div>

            <button
              onClick={() => setQaOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", backgroundColor: theme.accent, color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", flexShrink: 0, transition: "background-color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.accentHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.accent)}
            >
              <Sparkles size={14} /> Ask AI
            </button>
          </div>

          <div style={{ maxWidth: isPDF ? "none" : "820px", margin: "0 auto", borderTop: `1px solid ${theme.border}` }} />
        </div>

        {/* ── Body ── */}
        {isPDF
          ? <embed src={fileUrl} type="application/pdf" style={{ flex: 1, width: "100%", border: "none" }} />
          : <TxtReader text={document.text} />
        }
      </div>

      {qaOpen && <DocumentQAPanel document={document} onClose={() => setQaOpen(false)} />}
    </>
  );
};

export default DocumentReaderPage;
