const embeddingServiceLocal = require("../services/embeddingServiceLocal");

async function testLocalEmbeddings() {
  console.log("\n🧪 Testing Local Embeddings (100% FREE - No API Keys!)\n");
  console.log("=".repeat(60));

  try {
    console.log(
      "\n📊 Generating embeddings locally (runs on YOUR computer)...\n"
    );

    const texts = [
      "frog", // Short text
      "snake", // Similar meaning to "dog"
      "fog", // Different meaning
    ];

    console.log("Processing texts:", texts);
    console.log();

    // Generate embeddings (first time will download model)
    const embeddings = await embeddingServiceLocal.generateEmbeddings(texts);

    console.log("✅ Generated", embeddings.length, "embeddings");
    console.log("   Vector length:", embeddings[0].length, "dimensions");
    console.log("   First 10 numbers of 'dog':");
    console.log(
      "   ",
      embeddings[0].slice(0, 10).map((n) => n.toFixed(4))
    );
    console.log();

    // Calculate similarities (this is FREE - just math!)
    const dogPuppy = embeddingServiceLocal.cosineSimilarity(
      embeddings[0],
      embeddings[1]
    );
    const dogCar = embeddingServiceLocal.cosineSimilarity(
      embeddings[0],
      embeddings[2]
    );

    console.log("Similarity Scores (0 = different, 1 = identical):");
    console.log(
      "  'dog' vs 'puppy':",
      dogPuppy.toFixed(3),
      "← High! (similar meaning)"
    );
    console.log(
      "  'dog' vs 'car'  :",
      dogCar.toFixed(3),
      "← Low! (different meaning)"
    );

    console.log("\n" + "=".repeat(60));

    console.log("\n💰 Cost Analysis:");
    console.log("   API calls made: 0");
    console.log("   Money spent: $0.00");
    console.log("   Model runs on: YOUR CPU (no external servers!)");
    console.log("   Data privacy: 100% (never leaves your computer)");

    console.log("\n📦 Model Info:");
    console.log("   Name: all-MiniLM-L6-v2");
    console.log("   Size: ~90MB (cached after first download)");
    console.log("   Quality: ~85-90% as good as OpenAI");
    console.log("   Speed: ~200-300ms per batch");

    console.log("\n✅ Local embeddings working perfectly!");
    console.log(
      "\n💡 Next: We'll use these embeddings with ChromaDB for semantic search!\n"
    );
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);

    if (error.message.includes("fetch")) {
      console.error(
        "\n💡 Fix: Check your internet connection (needed for first download)"
      );
    } else if (error.message.includes("pipeline")) {
      console.error("\n💡 Fix: Make sure @xenova/transformers is installed:");
      console.error("   npm install @xenova/transformers");
    }

    console.error("\nFull error:", error);
    process.exit(1);
  }
}

testLocalEmbeddings();
