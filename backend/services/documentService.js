const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const chromaService = require("./chromaService");

class DocumentService {
  constructor() {
    this.storageDir = path.join(__dirname, "../storage/documents");
    this.chunksDir = path.join(__dirname, "../storage/chunks");
    this.initStorage();
  }

  async initStorage() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      await fs.mkdir(this.chunksDir, { recursive: true });
      console.log("✓ Storage directories initialized");
    } catch (error) {
      console.error("✗ FATAL: Could not create storage directories:", error);
      throw error; // Fail fast - don't continue if storage isn't working
    }
  }

  async downloadDocument(url) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NewsResearchBot/1.0)",
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  async extractPdfText(buffer) {
    try {
      const data = await pdfParse(buffer);
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info,
      };
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
  
  async extractTextFromBuffer(buffer) {
    return buffer.toString("utf-8");
  }

  /**
   * Process a locally uploaded document file
   * @param {string} filePath - Path to the uploaded file on disk
   * @returns {Object} Processing result with document metadata
   */

  async processDocument(filePath) {
    try {
      // Read the file from disk
      const buffer = await fs.readFile(filePath);

      // Determine file type from path
      const ext = path.extname(filePath).toLowerCase();
      let fileType = ext === ".pdf" ? "pdf" : "txt"; // ← Changed const to let

      let text;
      let metadata = {
        fileType: fileType, // ← Use the variable
        originalPath: filePath,
        filename: path.basename(filePath),
      };

      // Extract text based on file type
      if (fileType === "pdf") {
        const pdfData = await this.extractPdfText(buffer);
        text = pdfData.text;
        metadata.pages = pdfData.pages;
        metadata.pdfInfo = pdfData.info;
      } else {
        text = await this.extractTextFromBuffer(buffer);
      }

      // Create chunks
      const chunks = this.chunkText(text);

      // Generate document ID
      const timestamp = Date.now();
      const documentId = `doc_${timestamp}`;

      // Save document metadata
      const documentData = {
        id: documentId,
        filePath: filePath,
        filename: path.basename(filePath),
        timestamp: new Date(timestamp).toISOString(),
        textLength: text.length,
        chunkCount: chunks.length,
        ...metadata,
      };

      await fs.writeFile(
        path.join(this.storageDir, `${documentId}.json`),
        JSON.stringify(documentData, null, 2),
      );

      // Save chunks to disk
      const chunksData = chunks.map((chunk, index) => ({
        documentId,
        chunkIndex: index,
        ...chunk,
      }));

      await fs.writeFile(
        path.join(this.chunksDir, `${documentId}_chunks.json`),
        JSON.stringify(chunksData, null, 2),
      );

      // Index in ChromaDB
      let vectorStored = false;
      let vectorError = null;

      try {
        console.log(`📊 Indexing ${chunks.length} chunks in ChromaDB...`);
        await chromaService.addChunks(chunks, documentId);
        vectorStored = true;
        console.log("✅ Chunks indexed successfully in ChromaDB");
      } catch (error) {
        vectorError = error.message;
        console.error("❌ Failed to index chunks in ChromaDB:", vectorError);
      }

      return {
        id: documentId,
        chunks: chunksData,
        metadata: documentData,
        vectorStored,
        vectorError,
      };
    } catch (error) {
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  getFileType(url, buffer) {
    // First 5 bytes tell us the true file type
    if (buffer.length >= 5) {
      const header = buffer.toString("utf-8", 0, 5);

      // PDF files ALWAYS start with "%PDF-"
      if (header.startsWith("%PDF-")) {
        return "pdf";
      }
    }

    // Fallback to URL extension
    if (url.toLowerCase().endsWith(".pdf")) return "pdf";

    // Default to text
    return "txt";
  }

  chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      const end = start + chunkSize;
      const chunk = text.slice(start, end);

      chunks.push({
        text: chunk,
        startIndex: start,
        endIndex: Math.min(end, text.length),
      });

      start += chunkSize - overlap;
    }

    return chunks;
  }

  async saveDocument(url, text, metadata = {}) {
    const timestamp = Date.now();
    const documentId = `doc_${timestamp}`;

    const chunks = this.chunkText(text);
    const documentData = {
      id: documentId,
      url: url,
      timestamp: new Date(timestamp).toISOString(),
      textLength: text.length,
      chunkCount: chunks.length,
      ...metadata,
    };

    await fs.writeFile(
      path.join(this.storageDir, `${documentId}.json`),
      JSON.stringify(documentData, null, 2),
    );

    const chunksData = chunks.map((chunk, index) => ({
      documentId,
      chunkIndex: index,
      ...chunk,
    }));

    await fs.writeFile(
      path.join(this.chunksDir, `${documentId}_chunks.json`),
      JSON.stringify(chunksData, null, 2),
    );

    //================
    // NEW: Vector Storage in ChromaDB
    //================

    let vectorStored = false;
    let vectorError = null;

    try {
      console.log("Indexing chunks for semantic search...");

      await chromaService.addChunks(chunks, documentId);

      vectorStored = true;
      console.log("✓ Chunks indexed successfully in ChromaDB");
    } catch (error) {
      vectorError = error.message;
      console.error("✗ Failed to index chunks in ChromaDB:", vectorError);
    }
    return {
      documentId,
      chunkCount: chunks.length,
      textLength: text.length,
      vectorStored,
      vectorError,
    };
  }

  async readDocument(url) {
    try {
      // Download the document
      const buffer = await this.downloadDocument(url);

      // Determine file type
      const fileType = this.getFileType(url, buffer);

      let text;
      let metadata = { fileType };

      // Extract text based on file type
      if (fileType === "pdf") {
        const pdfData = await this.extractPdfText(buffer);
        text = pdfData.text;
        metadata.pages = pdfData.pages;
        metadata.pdfInfo = pdfData.info;
      } else {
        text = await this.extractTextFromBuffer(buffer);
      }

      // Save document and chunks
      const result = await this.saveDocument(url, text, metadata);

      return {
        success: true,
        ...result,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Search chunks for relevant content (simple keyword search for now)
  async searchChunks(query, documentId = null) {
    try {
      const chunks = [];

      // Read all chunk files
      const files = await fs.readdir(this.chunksDir);

      for (const file of files) {
        if (!file.endsWith("_chunks.json")) continue;

        // If documentId specified, only search that document
        if (documentId && !file.startsWith(documentId)) continue;

        const fileContent = await fs.readFile(
          path.join(this.chunksDir, file),
          "utf-8",
        );
        const fileChunks = JSON.parse(fileContent);
        chunks.push(...fileChunks);
      }

      // Split query into meaningful keywords (ignore short stop words like "what", "the", "a")
      const keywords = query
        .toLowerCase()
        .replace(/[?.,!;:]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3);

      // Fall back to full-phrase match if no meaningful keywords extracted
      if (keywords.length === 0) {
        return chunks.filter((c) => c.text.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
      }

      // Score each chunk by how many keywords it contains, return top matches
      const scored = chunks
        .map((chunk) => {
          const text = chunk.text.toLowerCase();
          const matchCount = keywords.filter((kw) => text.includes(kw)).length;
          return { chunk, matchCount };
        })
        .filter(({ matchCount }) => matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount);

      return scored.slice(0, 5).map(({ chunk }) => chunk);
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Reassemble the full document text from stored chunks.
   * Chunks overlap by 200 chars — we skip the overlap when joining so
   * the returned text matches the original document faithfully.
   */
  async getDocumentContent(documentId) {
    // Load metadata
    const metaPath = path.join(this.storageDir, `${documentId}.json`);
    let metadata;
    try {
      const raw = await fs.readFile(metaPath, "utf-8");
      metadata = JSON.parse(raw);
    } catch {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Load and sort chunks
    const chunksPath = path.join(this.chunksDir, `${documentId}_chunks.json`);
    const chunksRaw = await fs.readFile(chunksPath, "utf-8");
    const chunks = JSON.parse(chunksRaw).sort((a, b) => a.chunkIndex - b.chunkIndex);

    // Reconstruct full text by skipping overlapping portions
    let fullText = chunks[0].text;
    let currentEnd = chunks[0].endIndex;
    for (let i = 1; i < chunks.length; i++) {
      const chunk = chunks[i];
      const overlapLen = currentEnd - chunk.startIndex;
      if (overlapLen > 0 && overlapLen < chunk.text.length) {
        fullText += chunk.text.slice(overlapLen);
      } else if (overlapLen <= 0) {
        fullText += chunk.text;
      }
      currentEnd = chunk.endIndex;
    }

    return {
      id: metadata.id,
      filename: metadata.filename,
      fileType: metadata.fileType,
      chunkCount: metadata.chunkCount,
      textLength: metadata.textLength,
      timestamp: metadata.timestamp,
      pages: metadata.pages || null,
      text: fullText,
    };
  }

  // List all documents
  async listDocuments() {
    try {
      const files = await fs.readdir(this.storageDir);
      const documents = [];

      for (const file of files) {
        if (!file.endsWith(".json")) continue;

        const content = await fs.readFile(
          path.join(this.storageDir, file),
          "utf-8",
        );
        documents.push(JSON.parse(content));
      }

      return documents;
    } catch (error) {
      throw new Error(`Failed to list documents: ${error.message}`);
    }
  }
  /**
   * Re-index an existing document in ChromaDB
   * Useful if vector storage failed during initial processing
   */
  async reindexDocument(documentId) {
    try {
      // Load chunks from file system
      const chunksPath = path.join(this.chunksDir, `${documentId}_chunks.json`);
      const chunksContent = await fs.readFile(chunksPath, "utf-8");
      const chunks = JSON.parse(chunksContent);

      // Delete old vectors if they exist
      try {
        await chromaService.deleteDocument(documentId);
        console.log(`🗑️  Cleared old vectors for ${documentId}`);
      } catch (error) {
        // No old vectors to delete, that's fine
      }

      // Add chunks to ChromaDB
      console.log(`📊 Re-indexing ${chunks.length} chunks...`);
      await chromaService.addChunks(chunks, documentId);
      console.log(`✅ Re-indexing complete`);

      return {
        success: true,
        documentId,
        chunksIndexed: chunks.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
  /**
   * Semantic search across documents using vector similarity
   * Falls back to keyword search if ChromaDB is unavailable
   */
  async semanticSearch(query, nResults = 5, documentId = null) {
    try {
      // Cap nResults to avoid ChromaDB throwing when filter matches fewer items than requested
      let safeNResults = nResults;
      if (documentId) {
        const chunksPath = path.join(this.chunksDir, `${documentId}_chunks.json`);
        try {
          const raw = await fs.readFile(chunksPath, "utf-8");
          const chunks = JSON.parse(raw);
          safeNResults = Math.min(nResults, chunks.length);
        } catch {
          // If we can't read the file, proceed with the original nResults
        }
      }

      // Try semantic search with ChromaDB
      const results = await chromaService.searchSimilar(
        query,
        safeNResults,
        documentId,
      );

      return {
        method: "semantic",
        results,
        total: results.length,
      };
    } catch (error) {
      console.warn(
        `⚠️  Semantic search failed, falling back to keyword search: ${error.message}`,
      );

      // Fallback to keyword search
      const keywordResults = await this.searchChunks(query, documentId);

      return {
        method: "keyword_fallback",
        results: keywordResults,
        total: keywordResults.length,
        fallbackReason: error.message,
      };
    }
  }
}

module.exports = new DocumentService();
