const express = require("express");
const router = express.Router();
const documentService = require("../services/documentService");

// POST /api/search - Semantic search across all documents
router.post("/", async (req, res) => {
  try {
    const { query, nResults, documentId } = req.body;

    // Validate query
    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_QUERY",
          message: "Search query is required",
        },
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`🔍 Searching for: "${query}"`);
    if (documentId) {
      console.log(`📄 Limited to document: ${documentId}`);
    }

    // Perform semantic search
    const searchResults = await documentService.semanticSearch(
      query,
      nResults || 5, // Default to 5 results
      documentId || null, // Optional: search specific document
    );

    // Send success response
    res.status(200).json({
      success: true,
      data: {
        query: query,
        method: searchResults.method,
        results: searchResults.results,
        total: searchResults.total,
        fallbackReason: searchResults.fallbackReason || null,
      },
      message: `Found ${searchResults.total} result(s) using ${searchResults.method} search`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Search error:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "SEARCH_FAILED",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
