const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const documentService = require("../services/documentService");
const { answerWithContext } = require("../services/claudeService");

// POST /api/documents/upload
router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_FILE",
          message: "No file uploaded",
        },
        timestamp: new Date().toISOString(),
      });
    }

    console.log("📄 File uploaded:", req.file.originalname);
    console.log("📍 Saved to:", req.file.path);

    // Process the document (split into chunks, index in ChromaDB)
    const result = await documentService.processDocument(req.file.path);

    // Send success response
    res.status(201).json({
      success: true,
      data: {
        document: {
          id: result.id,
          filename: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
          type: req.file.mimetype,
          uploadedAt: new Date().toISOString(),
        },
        processing: {
          chunksCreated: result.chunks.length,
          indexed: true,
        },
      },
      message: `Document "${req.file.originalname}" uploaded and processed successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Upload error:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "UPLOAD_FAILED",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/documents - List all uploaded documents
router.get("/", async (req, res) => {
  try {
    console.log("📚 Fetching all documents...");

    // Get all documents from documentService
    const documents = await documentService.listDocuments();

    // Send success response
    res.status(200).json({
      success: true,
      data: {
        documents: documents,
        total: documents.length,
      },
      message: `Found ${documents.length} document(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ List documents error:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "LIST_FAILED",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/documents/:id/file — serve the original uploaded file (PDF or TXT)
router.get("/:id/file", async (req, res) => {
  const documentId = req.params.id;
  try {
    const metaPath = require("path").join(__dirname, "../storage/documents", `${documentId}.json`);
    const raw = await require("fs").promises.readFile(metaPath, "utf-8");
    const meta = JSON.parse(raw);

    if (!meta.filePath) {
      return res.status(404).json({ success: false, error: "File path not recorded for this document" });
    }

    res.sendFile(meta.filePath, (err) => {
      if (err) res.status(404).json({ success: false, error: "File not found on disk" });
    });
  } catch {
    res.status(404).json({ success: false, error: "Document not found" });
  }
});

// GET /api/documents/:id/content — return reassembled full text for the reader page
router.get("/:id/content", async (req, res) => {
  const documentId = req.params.id;
  try {
    const content = await documentService.getDocumentContent(documentId);
    res.json({ success: true, data: content });
  } catch (error) {
    const notFound = error.message.includes("not found");
    res.status(notFound ? 404 : 500).json({ success: false, error: error.message });
  }
});

// POST /api/documents/:id/qa — RAG Q&A for a specific document
router.post("/:id/qa", async (req, res) => {
  const { question, history = [] } = req.body;
  const documentId = req.params.id;

  if (!question) {
    return res.status(400).json({ success: false, error: "question is required" });
  }

  console.log(`📥 Q&A: doc=${documentId}, question="${question}"`);

  try {
    // 1. Retrieve relevant chunks (semantic search or keyword fallback)
    const searchResult = await documentService.semanticSearch(question, 5, documentId);
    console.log(`🔍 Search method=${searchResult.method}, chunks=${searchResult.results.length}`);
    if (searchResult.fallbackReason) console.log(`⚠️  Fallback: ${searchResult.fallbackReason}`);

    // 2. Answer via Claude with retrieved context
    const answer = await answerWithContext(question, searchResult.results, history);

    res.json({
      success: true,
      data: {
        answer,
        sources: searchResult.results.map((r) => ({
          text: r.text,
          chunkIndex: r.metadata?.chunkIndex,
        })),
        method: searchResult.method,
      },
    });
  } catch (error) {
    console.error("❌ Document Q&A error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
