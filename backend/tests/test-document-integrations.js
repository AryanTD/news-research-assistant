const documentService = require("../services/documentService");

async function testDocumentIntegration() {
  console.log("\n🧪 Testing Document + ChromaDB Integration\n");
  console.log("=".repeat(60));

  try {
    // Test 1: Process a document
    console.log("\n📊 Test 1: Processing document with auto-indexing...\n");

    const testUrl = "https://www.gutenberg.org/cache/epub/1342/pg1342.txt";

    const result = await documentService.readDocument(testUrl);

    if (result.success) {
      console.log(`✅ Document processed: ${result.documentId}`);
      console.log(`   Chunks: ${result.chunkCount}`);
      console.log(`   Text length: ${result.textLength}`);
      console.log(
        `   Vector indexed: ${result.vectorStored ? "✅ Yes" : "❌ No"}`,
      );

      if (result.vectorError) {
        console.log(`   Error: ${result.vectorError}`);
      }
    } else {
      console.log(`❌ Processing failed: ${result.error}`);
      return;
    }

    // Test 2: Semantic search with multiple queries
    console.log(
      "\n📊 Test 2: Testing semantic search with various queries...\n",
    );

    const queries = [
      "Mr. Darcy character",
      "marriage and romance",
      "Elizabeth Bennet",
      "pride and prejudice themes",
    ];

    for (const query of queries) {
      console.log(`Query: "${query}"`);
      const searchResult = await documentService.semanticSearch(query, 3);

      console.log(`  Method: ${searchResult.method}`);
      console.log(`  Results: ${searchResult.total}\n`);

      searchResult.results.forEach((result, idx) => {
        const preview = result.text
          .substring(0, 120)
          .replace(/\n/g, " ")
          .trim();
        console.log(`    ${idx + 1}. "${preview}..."`);
        if (result.distance !== undefined) {
          console.log(`       Distance: ${result.distance.toFixed(4)}`);
        }
        if (result.metadata) {
          console.log(`       Chunk: ${result.metadata.chunkIndex}`);
        }
      });
      console.log();
    }

    // Test 3: Compare with keyword search
    console.log("\n📊 Test 3: Comparing semantic vs keyword search...\n");

    const testQuery = "Darcy";

    console.log(`Query: "${testQuery}"\n`);

    const semanticResults = await documentService.semanticSearch(testQuery, 3);
    const keywordResults = await documentService.searchChunks(testQuery);

    console.log(`Semantic search found: ${semanticResults.total} results`);
    console.log(`Keyword search found: ${keywordResults.length} results`);

    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 Integration test complete!\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error);
  }
}

testDocumentIntegration();
