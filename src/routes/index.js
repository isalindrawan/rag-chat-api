const express = require("express");
const chatRoutes = require("./chatRoutes");
const documentRoutes = require("./documentRoutes");

const router = express.Router();

// API version and welcome message
router.get("/", (req, res) => {
  res.json({
    message: "RAG Chat API v1.0.0",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      chat: "/api/chat",
      chatRAG: "/api/chat/rag",
      documents: "/api/documents",
      upload: "/api/documents/upload",
      search: "/api/documents/search",
      stats: "/api/documents/stats",
    },
  });
});

// Route modules
router.use("/chat", chatRoutes);
router.use("/documents", documentRoutes);

module.exports = router;
