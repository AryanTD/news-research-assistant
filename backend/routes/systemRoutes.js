const express = require("express");
const router = express.Router();

// GET /api/health - Health check endpoint
router.get("/health", async (req, res) => {
  try {
    // Calculate uptime in seconds
    const uptimeSeconds = process.uptime();

    // Format uptime nicely
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        service: "News Research Assistant API",
        uptime: {
          seconds: Math.floor(uptimeSeconds),
          formatted: `${hours}h ${minutes}m ${seconds}s`,
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
      message: "Service is healthy and running",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Health check failed",
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/stats - System statistics (optional bonus!)
router.get("/stats", async (req, res) => {
  try {
    const documentService = require("../services/documentService");

    // Get all documents
    const documents = await documentService.listDocuments();

    // Calculate statistics
    const totalDocuments = documents.length;
    const totalChunks = documents.reduce(
      (sum, doc) => sum + (doc.chunkCount || 0),
      0,
    );
    const totalTextLength = documents.reduce(
      (sum, doc) => sum + (doc.textLength || 0),
      0,
    );

    // Group by file type
    const byType = documents.reduce((acc, doc) => {
      const type = doc.fileType || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        documents: {
          total: totalDocuments,
          byType: byType,
        },
        chunks: {
          total: totalChunks,
          average:
            totalDocuments > 0 ? Math.round(totalChunks / totalDocuments) : 0,
        },
        text: {
          totalCharacters: totalTextLength,
          averagePerDocument:
            totalDocuments > 0
              ? Math.round(totalTextLength / totalDocuments)
              : 0,
        },
      },
      message: "Statistics retrieved successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Stats error:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "STATS_FAILED",
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
