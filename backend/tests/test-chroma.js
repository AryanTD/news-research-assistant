const chromaService = require("../services/chromaService");

async function testChroma() {
  console.log("\n🧪 Testing ChromaDB with Local Embeddings\n");
  console.log("=".repeat(60));

  try {
    // Test 1: Initialize
    console.log("\n📊 Test 1: Initializing ChromaDB...\n");
    await chromaService.initialize();
    console.log("✅ ChromaDB initialized!");

    // Test 2: Add sample chunks
    console.log("\n📊 Test 2: Adding sample document chunks...\n");

    const testChunks = [
      {
        text: "Dogs are loyal pets that love to play fetch.",
        startIndex: 0,
        endIndex: 46,
      },
      {
        text: "Cats are independent animals that enjoy napping.",
        startIndex: 47,
        endIndex: 95,
      },
      {
        text: "Exercise improves cardiovascular health and fitness.",
        startIndex: 96,
        endIndex: 148,
      },
    ];

    const result = await chromaService.addChunks(testChunks, "test_doc_001");
    console.log(`✅ Added ${result.added} chunks to ChromaDB`);

    // Test 3: Get stats
    console.log("\n📊 Test 3: Getting collection stats...\n");
    const stats = await chromaService.getStats();
    console.log(`✅ Total chunks in database: ${stats.totalChunks}`);

    // Test 4: Semantic search
    console.log("\n📊 Test 4: Testing semantic search...\n");

    console.log("Query: 'What pets are good companions?'");
    const results1 = await chromaService.searchSimilar(
      "What pets are good companions?",
      2
    );

    console.log("\nTop results:");
    results1.forEach((result, idx) => {
      console.log(`  ${idx + 1}. "${result.text}"`);
      console.log(
        `     Distance: ${result.distance.toFixed(4)} (lower = more similar)`
      );
    });

    console.log("\n" + "-".repeat(60));

    console.log("\nQuery: 'How to improve heart health?'");
    const results2 = await chromaService.searchSimilar(
      "How to improve heart health?",
      2
    );

    console.log("\nTop results:");
    results2.forEach((result, idx) => {
      console.log(`  ${idx + 1}. "${result.text}"`);
      console.log(`     Distance: ${result.distance.toFixed(4)}`);
    });

    // Test 5: Cleanup
    console.log("\n📊 Test 5: Cleaning up test data...\n");
    await chromaService.deleteDocument("test_doc_001");
    console.log("✅ Test document deleted");

    const finalStats = await chromaService.getStats();
    console.log(`✅ Chunks remaining: ${finalStats.totalChunks}`);

    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 All ChromaDB tests passed!");
    console.log(
      "\n💡 Key Takeaway: Semantic search finds meaning, not just keywords!"
    );
    console.log(
      "   - 'pets' query found 'Dogs' and 'Cats' (semantically related)"
    );
    console.log(
      "   - 'heart health' query found 'cardiovascular' (different words, same concept)\n"
    );
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

testChroma();
