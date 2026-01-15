const axios = require("axios");
const { index } = require("mathjs");

/**
 * Search the web using Brave Search API.
 * @param {string} query - The search query.
 * @param {number} count- The number of search results to return (default 5, max 20)
 * @returns {Promise<Object>} - Search results with titles, URLs, and descriptions
 */

async function searchWeb(query, count = 5) {
  try {
    if (!process.env.BRAVE_API_KEY) {
      throw new Error(
        "Brave Search API key is not set in environment variables."
      );
    }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      throw new Error("Invalid or empty search query.");
    }

    const resultCount = Math.min(Math.max(count, 1), 20); // Ensure count is between 1 and 20

    console.log(`🔍 Searching web for: "${query}" (${resultCount} results)`);

    const response = await axios.get(
      "https://api.search.brave.com/res/v1/web/search",
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": process.env.BRAVE_API_KEY,
        },
        params: {
          q: query,
          count: resultCount,
        },
      }
    );

    const results = response.data.web?.results || [];

    const formattedResults = results.map((result, index) => ({
      position: index + 1,
      title: result.title,
      url: result.url,
      description: result.description || "No description available",
      age: result.age || null,
    }));

    console.log(
      `✅ Retrieved ${formattedResults.length} results from Brave Search.`
    );

    return {
      query: query,
      totalResults: formattedResults.length,
      results: formattedResults,
    };
  } catch (error) {
    if (error.response) {
      // API returned an error response
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;

      if (status === 401) {
        throw new Error(
          "Invalid Brave API key. Please check your BRAVE_API_KEY in .env file"
        );
      } else if (status === 429) {
        throw new Error("Brave API rate limit exceeded. Try again later");
      } else {
        throw new Error(`Brave API error (${status}): ${message}`);
      }
    } else if (error.request) {
      // Request made but no response received
      throw new Error(
        "No response from Brave API. Check your internet connection"
      );
    } else {
      // Other errors (validation, etc.)
      throw error;
    }
  }
}

module.exports = {
  searchWeb,
};
