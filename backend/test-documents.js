const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { askClaude } = require("./services/claudeService");

async function testDocuments() {
  console.log("\n=== Testing Document Tools ===\n");

  // Test 1: Read a short text file
  console.log("📖 Test 1: Reading Alice in Wonderland (text file)...\n");
  const response1 = await askClaude([
    {
      role: "user",
      content:
        "Please read this document: https://www.gutenberg.org/files/11/11-0.txt",
    },
  ]);
  console.log("Claude's response:", response1);
  console.log("\n" + "=".repeat(80) + "\n");

  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 2: List documents
  console.log("📋 Test 2: Listing documents...\n");
  const response2 = await askClaude([
    {
      role: "user",
      content: "What documents do I have?",
    },
  ]);
  console.log("Claude's response:", response2);
  console.log("\n" + "=".repeat(80) + "\n");

  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 3: Search documents
  console.log("🔍 Test 3: Searching for 'Alice'...\n");
  const response3 = await askClaude([
    {
      role: "user",
      content: "Search my documents for 'Alice'",
    },
  ]);
  console.log("Claude's response:", response3);
  console.log("\n" + "=".repeat(80) + "\n");

  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 4: Ask a question
  console.log("❓ Test 4: Asking about document content...\n");
  const response4 = await askClaude([
    {
      role: "user",
      content: "What happens when Alice falls down the rabbit hole?",
    },
  ]);
  console.log("Claude's response:", response4);
  console.log("\n" + "=".repeat(80) + "\n");
}

testDocuments().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
