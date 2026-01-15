require("dotenv").config();
const { askClaude } = require("../services/claudeService");

async function testClaudeWithWebSearch() {
  try {
    console.log("=== Test 1: Simple Web Search ===\n");

    const conversation1 = [
      {
        role: "user",
        content:
          "Search the web for 'best practices for Node.js in 2024' and summarize what you find.",
      },
    ];

    const response1 = await askClaude(conversation1);
    console.log("\n🤖 Claude's Response:");
    console.log(response1);
    console.log("\n" + "=".repeat(60) + "\n");

    console.log("=== Test 2: Search + Scrape Workflow ===\n");

    const conversation2 = [
      {
        role: "user",
        content:
          "Find a tutorial about React hooks and give me a detailed summary of what it covers.",
      },
    ];

    const response2 = await askClaude(conversation2);
    console.log("\n🤖 Claude's Response:");
    console.log(response2);
    console.log("\n" + "=".repeat(60) + "\n");

    console.log("=== Test 3: Direct URL Scraping ===\n");

    const conversation3 = [
      {
        role: "user",
        content:
          "Can you read this webpage and summarize it for me: https://en.wikipedia.org/wiki/Artificial_intelligence",
      },
    ];

    const response3 = await askClaude(conversation3);
    console.log("\n🤖 Claude's Response:");
    console.log(response3);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  }
}

testClaudeWithWebSearch();
