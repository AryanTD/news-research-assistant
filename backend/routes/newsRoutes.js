const express = require("express");
const router = express.Router();
const { searchNews, extractKeywords } = require("../services/newsService");

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

    // Extract keywords via Claude — falls back to raw query if extraction fails
    let extractedKeywords = query;
    try {
      extractedKeywords = await extractKeywords(query);
      console.log(`🔑 Keywords extracted: "${extractedKeywords}" (from: "${query}")`);
    } catch (extractError) {
      console.warn(`⚠️ Keyword extraction failed, using raw query: ${extractError.message}`);
    }

    const articles = await searchNews(extractedKeywords);

    res.status(200).json({
      success: true,
      data: {
        query: query,
        keywords: extractedKeywords,
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
      message: `Found ${articles.length} article(s) for "${extractedKeywords}"`,
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
