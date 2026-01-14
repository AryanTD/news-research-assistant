const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { askClaude } = require("./services/claudeService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:3000"
  );
  next();
});

app.use(express.static(path.join(__dirname, "../frontend")));

const conversations = new Map();

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionID = "default" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    let conversationHistory = conversations.get(sessionID) || [];

    console.log(`📨 Received: "${message}"`);

    conversationHistory.push({ role: "user", content: message });

    const response = await askClaude(conversationHistory);

    conversationHistory.push({ role: "assistant", content: response });

    conversations.set(sessionID, conversationHistory);

    console.log(`🤖 Responded: "${response}"`);

    res.json({ response, sessionID });
  } catch (error) {
    console.error("❌ Error in /api/chat:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/reset", (req, res) => {
  const { sessionID = "default" } = req.body;
  conversations.delete(sessionID);
  console.log(`🗑️ Cleared conversation history for session: ${sessionID}`);
  res.json({ message: "Conversation history cleared", sessionID });
});

app.get("/api/history/:sessionID", (req, res) => {
  const sessionID = req.params.sessionID || "default";
  const history = conversations.get(sessionID) || [];
  res.json({ sessionID, messageCount: history.length, history });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/chat`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 History: http://localhost:${PORT}/api/history\n`);
});
