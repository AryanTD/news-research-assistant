const { ChromaClient } = require("chromadb");
const embeddingService = require("./embeddingServiceLocal"); // Use local embeddings

class ChromaService {
  constructor() {
    this.client = new ChromaClient({
      host: "localhost", // ← Just the hostname
      port: 8000,
    });
    this.collectionName = "document_chunks";
    this.collection = null;
    this.initialized = false;
  }

  /**
   * Initialize ChromaDB collection
   * Collections are like tables in SQL - they store related data
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Custom embedding function that does nothing
      // (we provide embeddings ourselves)
      const customEmbeddingFunction = {
        generate: async (texts) => {
          // Return empty arrays - we'll provide embeddings manually
          return [];
        },
      };

      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: {
          description: "Document chunks with LOCAL embeddings (384 dimensions)",
          "hnsw:space": "cosine", // Use cosine similarity for search
        },
        embeddingFunction: customEmbeddingFunction, // ← Changed from undefined
      });
      this.initialized = true;
      console.log("✓ ChromaDB collection initialized");
    } catch (error) {
      console.error("✗ Failed to initialize ChromaDB collection:", error);
      throw error;
    }
  }

  /**
   * Add chunks to ChromaDB with embeddings
   * @param {Array} chunks - Array of chunk objects
   * @param {string} documentId - ID of parent document
   */
  async addChunks(chunks, documentId) {
    await this.initialize();

    // Extract texts from chunks
    const texts = chunks.map((chunk) => chunk.text);

    // Generate embeddings using LOCAL model (384 dimensions)
    const embeddings = await embeddingService.generateEmbeddings(texts);

    // Create unique IDs for each chunk
    const ids = chunks.map((chunk, idx) => `${documentId}_chunk_${idx}`);

    // Create metadata for each chunk
    const metadatas = chunks.map((chunk, idx) => ({
      documentId,
      chunkIndex: idx,
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex,
      textLength: chunk.text.length,
    }));

    // Add to ChromaDB
    await this.collection.add({
      ids: ids,
      embeddings: embeddings,
      metadatas: metadatas,
      documents: texts,
    });

    return { added: chunks.length };
  }

  /**
   * Search for similar chunks using semantic search
   * @param {string} query - Search query
   * @param {number} nResults - Number of results to return
   * @param {string} documentId - Optional: filter by document
   */
  async searchSimilar(query, nResults = 5, documentId = null) {
    await this.initialize();

    // Generate embedding for the query using LOCAL model
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Build search parameters
    const searchParams = {
      queryEmbeddings: [queryEmbedding],
      nResults: nResults,
    };

    // Add document filter if specified
    if (documentId) {
      searchParams.where = { documentId: documentId };
    }

    // Search ChromaDB
    const results = await this.collection.query(searchParams);

    return this.formatResults(results);
  }

  /**
   * Format ChromaDB query results into clean objects
   */
  formatResults(results) {
    if (!results.ids || results.ids[0].length === 0) {
      return [];
    }

    const formattedResults = [];
    const count = results.ids[0].length;

    for (let i = 0; i < count; i++) {
      formattedResults.push({
        id: results.ids[0][i],
        text: results.documents[0][i],
        metadata: results.metadatas[0][i],
        distance: results.distances[0][i], // Lower = more similar
      });
    }

    return formattedResults;
  }

  /**
   * Delete all chunks for a document
   */
  async deleteDocument(documentId) {
    await this.initialize();

    await this.collection.delete({
      where: { documentId: documentId },
    });

    return { deleted: true };
  }

  /**
   * Get collection statistics
   */
  async getStats() {
    await this.initialize();

    const count = await this.collection.count();
    return { totalChunks: count };
  }
}

module.exports = new ChromaService();
