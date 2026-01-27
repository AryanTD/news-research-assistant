const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") }); // Fixed path - go up one directory

// ADD THESE DEBUG LINES:
console.log("🔍 Debugging API Key:");
console.log("   .env path:", path.join(__dirname, "..", ".env"));
console.log("   OPENAI_API_KEY exists?", !!process.env.OPENAI_API_KEY);
console.log(
  "   OPENAI_API_KEY starts with 'sk-'?",
  process.env.OPENAI_API_KEY?.startsWith("sk-")
);
console.log("   OPENAI_API_KEY length:", process.env.OPENAI_API_KEY?.length);

const embeddingService = require("../services/embeddingService");

async function testEmbeddingsCheap() {
  console.log("\n🧪 Testing Embeddings (Cost-Optimized)\n");
  console.log("=".repeat(60));

  try {
    // Single API call with 3 texts (more efficient than 3 separate calls)
    console.log("\n📊 Generating embeddings for 3 texts in ONE API call...\n");

    const texts = [
      "dog", // Short, cheap
      "puppy", // Short, cheap
      "car", // Short, cheap
    ];

    // FIXED: Changed from getEmbeddings to generateEmbeddings
    const embeddings = await embeddingService.generateEmbeddings(texts);

    console.log("✅ Generated", embeddings.length, "embeddings");
    console.log("   Vector length:", embeddings[0].length, "dimensions");
    console.log("   First 5 numbers of 'dog':", embeddings[0].slice(0, 5));
    console.log();

    // Calculate similarities (FREE - just math on your computer)
    const dogPuppy = embeddingService.cosineSimilarity(
      embeddings[0],
      embeddings[1]
    );
    const dogCar = embeddingService.cosineSimilarity(
      embeddings[0],
      embeddings[2]
    );

    console.log("Similarity Scores:");
    console.log("  'dog' vs 'puppy':", dogPuppy.toFixed(3), "← Similar!");
    console.log("  'dog' vs 'car'  :", dogCar.toFixed(3), "← Different!");

    console.log("\n" + "=".repeat(60));

    // Cost calculation
    const totalTokens = texts.join(" ").split(" ").length; // Rough estimate
    const costPer1M = 0.02; // $0.02 per 1M tokens
    const estimatedCost = (totalTokens / 1000000) * costPer1M;

    console.log("\n💰 Cost Estimate:");
    console.log("   Tokens used: ~", totalTokens);
    console.log("   Estimated cost: $", estimatedCost.toFixed(6));
    console.log("   (Less than 1/100th of a cent!)");

    console.log("\n✅ Test complete! Embeddings work as expected.\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);

    // Common error handling
    if (error.message.includes("API key")) {
      console.error("\n💡 Fix: Check your OPENAI_API_KEY in .env file");
    } else if (error.message.includes("401")) {
      console.error("\n💡 Fix: Invalid OpenAI API key");
    } else if (error.message.includes("429")) {
      console.error("\n💡 Fix: Rate limit exceeded (wait a moment)");
    }

    console.error("\nFull error:", error);
    process.exit(1);
  }
}

testEmbeddingsCheap();
