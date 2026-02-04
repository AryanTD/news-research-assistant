const express = require("express");
const router = express.Router();

// POST /api/news/search - Search for news articles
router.post("/search", async (req, res) => {
  try {
    const { query, pageSize } = req.body;

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

    console.log(`📰 Searching news for: "${query}"`);

    // For now, return a success response
    // We'll integrate with your NewsAPI tool in the next step
    res.status(200).json({
      success: true,
      data: {
        query: query,
        articles: [
          // Placeholder - we'll fill this with real NewsAPI data
          {
            title: "Sample Article",
            description: "This will be replaced with real news",
            url: "https://example.com",
            source: "Example Source",
            publishedAt: new Date().toISOString(),
          },
        ],
        total: 1,
      },
      message: `Found articles for "${query}"`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ News search error:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "NEWS_SEARCH_FAILED",
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
