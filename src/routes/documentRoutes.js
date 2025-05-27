const express = require('express');
const documentController = require('../controllers/documentController');
const {
  uploadSingle,
  handleUploadError,
} = require('../middleware/uploadMiddleware');

const router = express.Router();

// POST /api/documents/upload - Upload a document
router.post(
  '/upload',
  uploadSingle,
  handleUploadError,
  documentController.uploadDocument,
);

// POST /api/documents/search - Search documents using RAG
router.post('/search', documentController.searchDocuments);

// GET /api/documents/stats - Get document processing statistics
router.get('/stats', documentController.getDocumentStats);

// GET /api/documents - Get all uploaded documents
router.get('/', documentController.getDocuments);

// GET /api/documents/:id - Get specific document info
router.get('/:id', documentController.getDocument);

// GET /api/documents/:id/download - Download a document
router.get('/:id/download', documentController.downloadDocument);

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;

