require("dotenv").config();
const { searchWeb } = require("../services/search");
const { scrapeWebpage } = require("../services/scraper");

async function testSearchAndScrape() {
  try {
    console.log("=== Testing Web Search ===\n");

    // Test search
    const searchResults = await searchWeb("Python programming tutorial", 3);
    console.log("Search Results:");
    console.log(JSON.stringify(searchResults, null, 2));

    console.log("\n=== Testing Web Scraper ===\n");

    // Test with the Reddit result (usually allows scraping)
    if (searchResults.results.length > 1) {
      const redditUrl = searchResults.results[1].url; // Try second result
      console.log(`Attempting to scrape: ${redditUrl}\n`);

      const scrapedContent = await scrapeWebpage(redditUrl);

      console.log("✅ Scrape Successful!");
      console.log(`Title: ${scrapedContent.title}`);
      console.log(
        `Content length: ${scrapedContent.content_length} characters`
      );
      console.log(
        `Content preview:\n${scrapedContent.content.substring(0, 300)}...\n`
      );
    }

    // Also test with a known scraper-friendly site
    console.log("=== Testing with Wikipedia ===\n");
    const wikiContent = await scrapeWebpage(
      "https://en.wikipedia.org/wiki/Artificial_intelligence"
    );
    console.log("✅ Wikipedia Scrape Successful!");
    console.log(`Title: ${wikiContent.title}`);
    console.log(`Content length: ${wikiContent.content_length} characters`);
    console.log(
      `Content preview:\n${wikiContent.content.substring(0, 300)}...\n`
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testSearchAndScrape();
