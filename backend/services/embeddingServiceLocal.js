const { pipeline } = require("@xenova/transformers");

class EmbeddingServiceLocal {
  constructor() {
    this.model = null;
    this.modelName = "Xenova/all-MiniLM-L6-v2"; // Small, fast, free model
    this.initialized = false;
  }

  /**
   * Initialize the model (downloads ~90MB first time, then caches)
   */
  async initialize() {
    if (this.initialized) return;

    console.log("📥 Loading local embedding model...");
    console.log("   (First time: ~90MB download, then cached forever)");

    this.model = await pipeline("feature-extraction", this.modelName);

    this.initialized = true;
    console.log("✅ Local embedding model ready!");
  }

  /**
   * Generate embedding for a single text
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector (384 dimensions)
   */
  async generateEmbedding(text) {
    await this.initialize();

    try {
      const output = await this.model(text, {
        pooling: "mean", // Average all token embeddings
        normalize: true, // Normalize to unit length (better for cosine similarity)
      });

      return Array.from(output.data);
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts (processes one at a time)
   * @param {string[]} texts - Array of texts to embed
   * @returns {Promise<number[][]>} - Array of embedding vectors
   */
  async generateEmbeddings(texts) {
    await this.initialize();

    try {
      const embeddings = [];

      for (const text of texts) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      }

      return embeddings;
    } catch (error) {
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * (Useful for understanding how similar two texts are)
   * @param {number[]} vecA - First embedding vector
   * @param {number[]} vecB - Second embedding vector
   * @returns {number} - Similarity score (0-1, higher = more similar)
   */
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }
}

module.exports = new EmbeddingServiceLocal();
