const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const pdfParse = require("pdf-parse");

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
    return buffer.toSString("utf-8");
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
      JSON.stringify(documentData, null, 2)
    );

    const chunksData = chunks.map((chunk, index) => ({
      documentId,
      chunkIndex: index,
      ...chunk,
    }));

    await fs.writeFile(
      path.join(this.chunksDir, `${documentId}_chunks.json`),
      JSON.stringify(chunksData, null, 2)
    );
    return {
      documentId,
      chunkCount: chunks.length,
      textLength: text.length,
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
          "utf-8"
        );
        const fileChunks = JSON.parse(fileContent);
        chunks.push(...fileChunks);
      }

      // Simple keyword search (we'll improve this with vector search later)
      const queryLower = query.toLowerCase();
      const results = chunks.filter((chunk) =>
        chunk.text.toLowerCase().includes(queryLower)
      );

      return results.slice(0, 5); // Return top 5 matches
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
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
          "utf-8"
        );
        documents.push(JSON.parse(content));
      }

      return documents;
    } catch (error) {
      throw new Error(`Failed to list documents: ${error.message}`);
    }
  }
}

module.exports = new DocumentService();
