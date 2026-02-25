import React, { useState, useEffect } from "react";
import { documentsAPI } from "../services/api";

const LibraryPage = () => {
  // STATE: What data does this page need to track?
  const [documents, setDocuments] = useState([]); // Array of documents
  const [loading, setLoading] = useState(true); // Are we loading?
  const [error, setError] = useState(null); // Any errors?

  const [uploading, setUploading] = useState(false); // Is file uploading?
  const [uploadProgress, setUploadProgress] = useState(0); // Upload percentage
  const [dragActive, setDragActive] = useState(false); // Is user dragging file over zone?

  // EFFECT: Run this when page loads (fetch documents)
  useEffect(() => {
    fetchDocuments();
  }, []); // Empty array = run once when page loads

  // FUNCTION: Fetch documents from backend
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await documentsAPI.list(); // Call GET /api/documents

      if (response.success) {
        setDocuments(response.data.documents);
      } else {
        setError("Failed to load documents");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  // FUNCTION: Upload a file
  const handleFileUpload = async (file) => {
    // Validate file type
    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF and TXT files are supported");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert("File too large. Maximum size is 10MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log("📤 Uploading file:", file.name);

      // Call backend API
      const response = await documentsAPI.upload(file);

      if (response.success) {
        console.log("✅ Upload successful!");
        setUploadProgress(100);

        // Show success message
        alert(
          `"${file.name}" uploaded successfully! ${response.data.processing.chunksCreated} chunks created.`,
        );

        // Refresh document list
        await fetchDocuments();
      } else {
        throw new Error(response.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // FUNCTION: Handle file input change (when user clicks to browse)
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // FUNCTION: Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // FUNCTION: Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  // FUNCTION: Delete a document
  const handleDelete = async (documentId) => {
    console.log("Delete clicked for:", documentId);
    // We'll implement this fully later
    alert("Delete functionality coming soon!");
  };

  // RENDER: What should the user see?
  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: "8px",
          }}
        >
          Your Library
        </h1>
        <p style={{ fontSize: "16px", color: "#b3b3b3" }}>
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Upload Zone - We'll add this next */}
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          padding: "48px",
          backgroundColor: dragActive ? "#242424" : "#1a1a1a",
          borderRadius: "12px",
          border: dragActive ? "2px dashed #ef4444" : "2px dashed #282828",
          textAlign: "center",
          marginBottom: "32px",
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
        onClick={() => document.getElementById("file-input").click()}
      >
        {/* Hidden file input */}
        <input
          id="file-input"
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />

        {uploading ? (
          // Uploading state
          <>
            <div
              style={{
                width: "64px",
                height: "64px",
                border: "4px solid #1a1a1a",
                borderTop: "4px solid #ef4444",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p
              style={{
                fontSize: "18px",
                color: "#ffffff",
                marginBottom: "8px",
              }}
            >
              Uploading...
            </p>
            <p style={{ fontSize: "14px", color: "#b3b3b3" }}>
              Processing document and creating chunks
            </p>
          </>
        ) : (
          // Default state
          <>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>
              {dragActive ? "📂" : "📁"}
            </p>
            <p
              style={{
                fontSize: "18px",
                color: "#ffffff",
                marginBottom: "8px",
              }}
            >
              {dragActive ? "Drop file here" : "Upload Document"}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#b3b3b3",
                marginBottom: "16px",
              }}
            >
              Drag & drop PDF or TXT files here, or click to browse
            </p>
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "#ef4444",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ef4444";
              }}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("file-input").click();
              }}
            >
              Choose File
            </button>
            <p
              style={{ fontSize: "12px", color: "#6b7280", marginTop: "12px" }}
            >
              Maximum file size: 10MB
            </p>
          </>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "64px" }}>
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
          <p style={{ color: "#b3b3b3" }}>Loading your documents...</p>
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
          <p style={{ color: "#ef4444" }}>❌ {error}</p>
        </div>
      )}

      {/* Documents Grid */}
      {!loading && !error && documents.length > 0 && (
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "24px",
            }}
          >
            Your Documents
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={() => handleDelete(doc.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Documents */}
      {!loading && !error && documents.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>📚</p>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "8px",
            }}
          >
            No documents yet
          </h2>
          <p style={{ color: "#b3b3b3" }}>
            Upload your first document to get started
          </p>
        </div>
      )}

      {/* Spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Document Card Component
const DocumentCard = ({ document, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Helper: Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Helper: Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  // Get file type
  const fileType = document.fileType || "unknown";
  const isPDF = fileType === "pdf";
  const filename = document.filename || document.id;

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
      {/* File Icon Header */}
      <div
        style={{
          padding: "32px",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #282828",
        }}
      >
        <div style={{ fontSize: "64px" }}>{isPDF ? "📄" : "📝"}</div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px" }}>
        {/* File Type Badge */}
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              fontSize: "11px",
              color: "#ef4444",
              fontWeight: 600,
              textTransform: "uppercase",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {fileType.toUpperCase()}
          </span>
        </div>

        {/* Filename */}
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: "12px",
            wordBreak: "break-word",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {filename}
        </h3>

        {/* Metadata */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#b3b3b3",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>📊</span>
            <span>{document.chunkCount || 0} chunks</span>
          </div>

          {document.pages && (
            <div
              style={{
                fontSize: "13px",
                color: "#b3b3b3",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>📖</span>
              <span>{document.pages} pages</span>
            </div>
          )}

          {document.textLength && (
            <div
              style={{
                fontSize: "13px",
                color: "#b3b3b3",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>💾</span>
              <span>{formatFileSize(document.textLength)}</span>
            </div>
          )}

          <div
            style={{
              fontSize: "13px",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🕐</span>
            <span>{formatDate(document.timestamp)}</span>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "8px",
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
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ef4444";
            }}
          >
            View
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete "${filename}"?`)) {
                onDelete();
              }
            }}
            style={{
              padding: "10px 16px",
              backgroundColor: "#242424",
              color: "#ffffff",
              border: "1px solid #282828",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#dc2626";
              e.currentTarget.style.borderColor = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#242424";
              e.currentTarget.style.borderColor = "#282828";
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
