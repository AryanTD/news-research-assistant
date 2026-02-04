const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const documentService = require("../services/documentService");

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

module.exports = router;
