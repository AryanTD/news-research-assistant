require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const { searchNews } = require("./newsService");
const { calculate } = require("./calculatorService");
const { getWeather } = require("./weatherService");
const { searchWikipedia } = require("./wikipediaService");
const { searchWeb } = require("./search");
const { scrapeWebpage } = require("./scraper");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const tools = [
  {
    name: "searchNews",
    description:
      "Search for recent news articles about a specific topic or query. Use this when the user asks about current events, recent news, or anything happening now.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query or topic to look for in news articles.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "calculate",
    description:
      "Perform basic arithmetic calculations. Use this tool when the user asks for mathematical computations.",
    input_schema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description:
            "The mathematical expression to evaluate. Examples: '15% of 87.50', '25 * 4 + 10', '32 fahrenheit to celsius', 'sqrt(144)'",
        },
      },
      required: ["expression"],
    },
  },
  {
    name: "getWeather",
    description:
      "Get the current weather for a specific location. Use this tool when the user asks about weather conditions in a city or region.",
    input_schema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description:
            "The name of the city or location to get the weather for.",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "searchWikipedia",
    description:
      "Search for information on Wikipedia about a specific topic. Use this tool when the user asks for general knowledge or information about a subject.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query or topic to look for in Wikipedia.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "searchWeb",
    description:
      "Search the entire web for current information on any topic. Returns a list of relevant web pages with titles, URLs, and descriptions. Use this when the user needs general web information, tutorials, documentation, how-to guides, product reviews, or any topic not covered by specialized tools (news, weather, Wikipedia). This provides broader coverage than news-only search and is ideal for finding recent developments, technical information, or comprehensive research.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query. Be specific and use keywords (e.g., 'React hooks tutorial', 'best laptop 2024', 'how to bake sourdough bread')",
        },
        count: {
          type: "number",
          description:
            "Number of search results to return (1-20). Default is 5. Use higher numbers (8-10) for research tasks that need comprehensive coverage.",
          default: 5,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "scrapeWebpage",
    description:
      "Extract the full text content from a specific webpage URL. Use this AFTER searchWeb to get detailed content from interesting pages, or when the user provides a URL directly. This retrieves the actual content of articles, tutorials, documentation, or blog posts so you can provide detailed summaries or answer specific questions about the page content. Note: Some websites (like social media, banking sites, or sites with strong anti-scraping measures) may block this tool.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description:
            "The complete URL of the webpage to scrape (must start with http:// or https://). Example: 'https://example.com/article'",
        },
      },
      required: ["url"],
    },
  },
];
async function askClaude(conversationHistory) {
  console.log("Asking Claude:", conversationHistory.length, "messages");

  let messages = [...conversationHistory];
  let continueLoop = true;
  let loopCount = 0;
  const maxLoops = 5;

  while (continueLoop && loopCount < maxLoops) {
    loopCount++;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      tools: tools,
      messages: messages,
    });

    console.log(`Response ${loopCount} stop_reason:`, response.stop_reason);

    if (response.stop_reason === "tool_use") {
      console.log("Claude is calling a tool");

      const toolUses = response.content.filter(
        (block) => block.type === "tool_use"
      );

      const toolResults = [];

      for (const toolUse of toolUses) {
        console.log("Tool requested:", toolUse.name);
        console.log("Tool input:", toolUse.input);

        let toolResult;

        if (toolUse.name === "searchNews") {
          console.log("📰 Fetching news...\n");
          const newsResults = await searchNews(toolUse.input.query);
          console.log(`✅ Found ${newsResults.length} articles\n`);
          toolResult = JSON.stringify(newsResults);
        } else if (toolUse.name === "calculate") {
          console.log("🧮 Calculating expression...\n");
          const calculation = await calculate(toolUse.input.expression);
          console.log(`✅ Calculation result: ${calculation}\n`);
          toolResult = JSON.stringify(calculation);
        } else if (toolUse.name === "getWeather") {
          console.log("🌤️ Fetching weather...\n");
          const weather = await getWeather(toolUse.input.location);
          console.log(`✅ Weather fetched: ${JSON.stringify(weather)}\n`);
          toolResult = JSON.stringify(weather);
        } else if (toolUse.name === "searchWikipedia") {
          console.log("📚 Searching Wikipedia...\n");
          const wikiResult = await searchWikipedia(toolUse.input.query);
          console.log(`✅ Wikipedia result: ${JSON.stringify(wikiResult)}\n`);
          toolResult = JSON.stringify(wikiResult);
        } else if (toolUse.name === "searchWeb") {
          console.log("🔍 Searching the web...\n");
          const count = toolUse.input.count || 5;
          const searchResults = await searchWeb(toolUse.input.query, count);
          console.log(`✅ Found ${searchResults.totalResults} results\n`);
          toolResult = JSON.stringify(searchResults);
        } else if (toolUse.name === "scrapeWebpage") {
          console.log("📄 Scraping webpage...\n");
          try {
            const scrapedContent = await scrapeWebpage(toolUse.input.url);
            console.log(
              `✅ Scraped ${scrapedContent.content_length} characters\n`
            );
            toolResult = JSON.stringify(scrapedContent);
          } catch (error) {
            console.log(`❌ Scraping failed: ${error.message}\n`);
            toolResult = JSON.stringify({
              error: true,
              message: error.message,
              url: toolUse.input.url,
            });
          }
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: toolResult,
        });
      }

      messages.push({
        role: `assistant`,
        content: response.content,
      });

      messages.push({
        role: "user",
        content: toolResults,
      });

      console.log("🗨️ Sending tool results back to Claude...\n");
    } else if (response.stop_reason === "end_turn") {
      console.log("Claude has finished the conversation.\n");
      const textContent = response.content.find(
        (block) => block.type === "text"
      );
      return textContent ? textContent.text : "I couldn't generate a response.";
    } else {
      console.log("⚠️ Unexpected stop_reason:", response.stop_reason);
      continueLoop = false;
      const textContent = response.content.find(
        (block) => block.type === "text"
      );
      return textContent ? textContent.text : "I couldn't generate a response.";
    }
  }
  if (loopCount >= maxLoops) {
    console.log("⚠️ Reached maximum tool call loops");
    return "I've used multiple tools but need to stop here. Please try rephrasing your question.";
  }
}

module.exports = { askClaude };
