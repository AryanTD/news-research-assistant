const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const axios = require("axios");
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Matches phrases like "give me", "news about", etc. that signal a natural language query
const FILLER_PATTERNS =
  /\b(give me|show me|tell me|find me|search for|what is|what are|news about|articles about|i want|latest|recent)\b/i;

async function extractKeywords(userInput) {
  const trimmed = userInput.trim();
  const wordCount = trimmed.split(/\s+/).length;

  // If it's already short and has no filler words, skip Claude — save API cost
  if (wordCount <= 3 && !FILLER_PATTERNS.test(trimmed)) {
    return trimmed;
  }

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 30,
    messages: [
      {
        role: "user",
        content: `Extract the core search keywords from this query. Return ONLY the keywords, nothing else.\n\nQuery: "${trimmed}"`,
      },
    ],
  });

  return response.content[0].text.trim();
}

async function searchNews(query) {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        apiKey: apiKey,
        pageSize: 6,
        language: "en",
        sortby: "relevency",
        searchIn: "title,description",
      },
    });

    return response.data.articles;
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      throw new Error(
        "Cannot connect to news service. Check your internet connection.",
      );
    } else if (error.response?.status === 429) {
      throw new Error("News API rate limit reached. Please try again later.");
    } else if (error.response?.status === 401) {
      throw new Error("News API key is invalid. Check your .env file.");
    } else {
      throw new Error(`Failed to fetch news: ${error.message}`);
    }
  }
}

module.exports = { searchNews, extractKeywords };
