const express = require("express");
const router = express.Router();
const { searchNews } = require("../services/newsService");

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

    const articles = await searchNews(query);

    // For now, return a success response
    // We'll integrate with your NewsAPI tool in the next step
    res.status(200).json({
      success: true,
      data: {
        query: query,
        articles: articles.map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source?.name || "Unknown",
          publishedAt: article.publishedAt,
          urlToImage: article.urlToImage,
          author: article.author,
        })),
        total: articles.length,
      },
      message: `Found ${articles.length} article(s) for "${query}"`,
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

// GET /api/news/trending - Get top headlines
router.get("/trending", async (req, res) => {
  try {
    console.log("🔥 Fetching trending news");

    const apiKey = process.env.NEWS_API_KEY;
    const axios = require("axios");

    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        country: "us",
        pageSize: 10,
        apiKey: apiKey,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        articles: response.data.articles.map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source?.name || "Unknown",
          publishedAt: article.publishedAt,
          urlToImage: article.urlToImage,
          author: article.author,
        })),
        total: response.data.articles.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Trending news error:", error);
    res.status(500).json({
      success: false,
      error: { code: "TRENDING_FAILED", message: error.message },
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
