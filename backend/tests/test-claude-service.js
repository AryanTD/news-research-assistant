const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { askClaude } = require("../services/claudeService");

async function test() {
  console.log("\n🧪 Running Claude Service Tests...\n");

  // Test 1: Simple question (no tools)
  console.log("=== TEST 1: Simple Math ===");
  const response1 = await askClaude([
    { role: "user", content: "What is 5+5?" },
  ]);
  console.log("✅ Claude says:", response1);
  console.log("\n" + "=".repeat(80) + "\n");

  // Wait a moment between tests
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: News (should use searchNews tool)
  console.log("=== TEST 2: News Query ===");
  const response2 = await askClaude([
    { role: "user", content: "What's the latest news about AI?" },
  ]);
  console.log("✅ Claude says:", response2);
  console.log("\n" + "=".repeat(80) + "\n");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 3: Calculator (should use calculate tool)
  console.log("=== TEST 3: Calculator ===");
  const response3 = await askClaude([
    { role: "user", content: "What is 15% of 87.50?" },
  ]);
  console.log("✅ Claude says:", response3);
  console.log("\n" + "=".repeat(80) + "\n");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 4: Weather (should use getWeather tool)
  console.log("=== TEST 4: Weather ===");
  const response4 = await askClaude([
    { role: "user", content: "What's the weather in New York?" },
  ]);
  console.log("✅ Claude says:", response4);
  console.log("\n" + "=".repeat(80) + "\n");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 5: Web search (should use searchWeb tool)
  console.log("=== TEST 5: Web Search ===");
  const response5 = await askClaude([
    { role: "user", content: "Search the web for React hooks tutorial" },
  ]);
  console.log("✅ Claude says:", response5);
  console.log("\n" + "=".repeat(80) + "\n");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 6: Document reading (should use readDocument tool)
  console.log("=== TEST 6: Read Document ===");
  const response6 = await askClaude([
    {
      role: "user",
      content:
        "Read this document: https://www.gutenberg.org/files/11/11-0.txt",
    },
  ]);
  console.log("✅ Claude says:", response6);
  console.log("\n" + "=".repeat(80) + "\n");

  console.log("🎉 All tests completed!\n");
}

test().catch((error) => {
  console.error("\n❌ Test failed:", error.message);
  console.error("\nFull error:", error);
  process.exit(1);
});
