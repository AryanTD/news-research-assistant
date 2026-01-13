const { askClaude } = require("./claudeService");

async function test() {
  // Test 1: Simple math (shouldn't use tools)
  console.log("=== TEST 1: Simple Math ===");
  const response1 = await askClaude("What is 5+5?");
  console.log("Claude says:", response1);

  // Test 2: Ask about news (SHOULD trigger tool use!)
  console.log("\n=== TEST 2: News Query ===");
  const response2 = await askClaude("What is the latest news about AI?");
  console.log("Claude says:", response2);
}

test();
