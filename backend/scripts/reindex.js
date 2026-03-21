/**
 * One-off script: re-index all documents into ChromaDB.
 * Run with: node backend/scripts/reindex.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const documentService = require("../services/documentService");

async function main() {
  // Wait for storage dirs to initialize
  await new Promise((r) => setTimeout(r, 500));

  const documents = await documentService.listDocuments();
  console.log(`Found ${documents.length} documents to re-index.\n`);

  let success = 0;
  let failed = 0;

  for (const doc of documents) {
    process.stdout.write(`Re-indexing ${doc.id} (${doc.filename || doc.url || "unknown"})... `);
    const result = await documentService.reindexDocument(doc.id);
    if (result.success) {
      console.log(`✅ ${result.chunksIndexed} chunks`);
      success++;
    } else {
      console.log(`❌ ${result.error}`);
      failed++;
    }
  }

  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
