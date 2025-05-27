const asyncHandler = require("../middleware/asyncHandler");
const chatService = require("../services/chatService");

// @desc    Get all chat sessions
// @route   GET /api/chat
// @access  Public
const getChatSessions = asyncHandler(async (req, res) => {
  // Placeholder implementation
  res.json({
    message: "Get chat sessions endpoint",
    sessions: [],
  });
});

// @desc    Send message and get AI response
// @route   POST /api/chat
// @access  Public
const sendMessage = asyncHandler(async (req, res) => {
  const { message, sessionId, useRAG = false } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  const response = await chatService.processMessage(message, sessionId, useRAG);

  res.json({
    success: true,
    data: response,
  });
});

// @desc    Send message with RAG (Retrieval-Augmented Generation)
// @route   POST /api/chat/rag
// @access  Public
const sendRAGMessage = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  const response = await chatService.processMessage(message, sessionId, true);

  res.json({
    success: true,
    data: response,
  });
});

// @desc    Get specific chat session
// @route   GET /api/chat/:sessionId
// @access  Public
const getChatSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  // Placeholder implementation
  res.json({
    message: `Get chat session ${sessionId}`,
    sessionId,
    messages: [],
  });
});

// @desc    Delete chat session
// @route   DELETE /api/chat/:sessionId
// @access  Public
const deleteChatSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  // Placeholder implementation
  res.json({
    message: `Chat session ${sessionId} deleted`,
    sessionId,
  });
});

module.exports = {
  getChatSessions,
  sendMessage,
  sendRAGMessage,
  getChatSession,
  deleteChatSession,
};
