const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Scrape and extract main content from a given URL.
 * @param {string} url - The URL of the webpage to scrape.
 * @returns {Promise<Object>} Extracted content including title, text, and metadata
 */

async function scrapeWebpage(url) {
  try {
    if (!url || typeof url !== "string") {
      throw new Error("URL must be a non-empty string");
    }

    try {
      new URL(url);
    } catch (e) {
      throw new Error("Invalid URL format");
    }
    console.log(`🌐 Scraping webpage: ${url}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000, // 10 seconds timeout
      maxContentLength: 5 * 1024 * 1024, // 5 MB limit
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted elements (scripts, styles, ads, navigation)
    $("script").remove();
    $("style").remove();
    $("nav").remove();
    $("footer").remove();
    $("header").remove();
    $(".advertisement").remove();
    $(".ads").remove();

    const title =
      $("title").text().trim() ||
      $("h1").first().text().trim() ||
      "No title found";

    let mainContent =
      $("article").text() ||
      $("main").text() ||
      $(".content").text() ||
      $(".post-content").text() ||
      $(".article-content").text() ||
      $("#content").text() ||
      $("body").text();

    mainContent = mainContent.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim();

    const maxLength = 8000;
    if (mainContent.length > maxLength) {
      mainContent =
        mainContent.substring(0, maxLength) + "\n\n[Content truncated]";
    }

    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    console.log(`✅ Successfully scraped content from: ${url}`);

    return {
      url: url,
      title: title,
      description: description,
      content: mainContent,
      content_length: mainContent.length,
      scraped_at: new Date().toISOString(),
    };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        throw new Error(`Page not found (404): ${url}`);
      } else if (status === 403) {
        throw new Error(
          `Access forbidden (403): ${url}. Website may be blocking scrapers`
        );
      } else if (status >= 500) {
        throw new Error(`Server error (${status}): ${url} is having issues`);
      } else {
        throw new Error(`HTTP error (${status}) while scraping ${url}`);
      }
    } else if (error.code === "ENOTFOUND") {
      throw new Error(`Domain not found: ${url}. Check the URL is correct`);
    } else if (error.code === "ETIMEDOUT") {
      throw new Error(
        `Timeout scraping ${url}. Website is too slow or unreachable`
      );
    } else {
      throw error;
    }
  }
}

/**
 * Scrape multiple URLs and return combined results
 * @param {string[]} urls - Array of webpage URLs to scrape
 * @param {number} maxUrls - Maximum number of URLs to scrape (default 5)
 * @returns {Promise<Object[]>} Array of scraped content objects
 */

async function scrapeMultiple(urls, maxUrls = 5) {
  try {
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error("URLs must be a non-empty array of strings");
    }

    const urlsToScrape = urls.slice(0, maxUrls);

    console.log(`🌐 Starting to scrape ${urlsToScrape.length} URLs`);

    const results = await Promise.allSettled(
      urlsToScrape.map((url) => scrapeWebpage(url))
    );

    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(result.value);
      } else {
        failed.push({
          url: urlsToScrape[index],
          error: result.reason.message,
        });
      }
    });

    return {
      total_attempted: urlsToScrape.length,
      successful_count: successful.length,
      failed_count: failed.length,
      successful_scrapes: successful,
      failed_scrapes: failed,
    };
  } catch (error) {
    throw new Error(`Failed to scrape multiple URLs: ${error.message}`);
  }
}

module.exports = { scrapeWebpage, scrapeMultiple };
