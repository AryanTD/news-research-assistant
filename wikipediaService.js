require("dotenv").config();
const axios = require("axios");

async function searchWikipedia(query) {
  try {
    // Use Wikipedia REST API directly
    const response = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          "User-Agent": "NewsResearchAssistant/1.0",
        },
      }
    );

    return {
      title: response.data.title,
      description: response.data.description || "No description available",
      extract: response.data.extract,
      url: response.data.content_urls.desktop.page,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`No Wikipedia article found for "${query}"`);
    }
    throw new Error(`Failed to fetch Wikipedia: ${error.message}`);
  }
}

module.exports = { searchWikipedia };
