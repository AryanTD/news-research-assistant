const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const axios = require("axios");

async function searchNews(query) {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        apiKey: apiKey,
        pageSize: 3,
        language: "en",
        sortby: "publishedAt",
      },
    });

    return response.data.articles;
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      throw new Error(
        "Cannot connect to news service. Check your internet connection."
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

module.exports = { searchNews };
