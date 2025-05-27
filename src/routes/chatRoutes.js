const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// GET /api/chat - Get chat sessions (placeholder)
router.get('/', chatController.getChatSessions);

// POST /api/chat - Send message and get response
router.post('/', chatController.sendMessage);

// POST /api/chat/rag - Send message with RAG (Retrieval-Augmented Generation)
router.post('/rag', chatController.sendRAGMessage);

// GET /api/chat/:sessionId - Get specific chat session (placeholder)
router.get('/:sessionId', chatController.getChatSession);

// DELETE /api/chat/:sessionId - Delete chat session (placeholder)
router.delete('/:sessionId', chatController.deleteChatSession);

module.exports = router;

