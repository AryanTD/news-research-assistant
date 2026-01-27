const OpenAI = require("openai");

class EmbeddingService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = "text-embedding-3-small";
  }

  /**
   * Generate embedding for a single text
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector (1536 dimensions)
   */

  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts
   * @param {string[]} texts - Array of texts to embed
   * @returns {Promise<number[][]>} - Array of embedding vectors
   */

  async generateEmbeddings(texts) {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: texts,
      });
      return response.data.map((item) => item.embedding);
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

module.exports = new EmbeddingService();
