const express = require('express');
const chatRoutes = require('./chatRoutes');

const router = express.Router();

// API version and welcome message
router.get('/', (req, res) => {
  res.json({
    message: 'RAG Chat API v1.0.0',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
    },
  });
});

// Route modules
router.use('/chat', chatRoutes);

module.exports = router;

