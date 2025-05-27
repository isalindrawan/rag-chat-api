const path = require('path');
const fs = require('fs').promises;
const asyncHandler = require('../middleware/asyncHandler');
const { formatResponse, formatError } = require('../utils/helpers');
const documentProcessingService = require('../services/documentProcessingService');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Public
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const { file } = req;
  const documentId = file.filename.split('.')[0];
  const filePath = path.join(__dirname, '../../public/uploads', file.filename);

  const fileInfo = {
    id: documentId,
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    path: `/uploads/${file.filename}`,
    uploadedAt: new Date().toISOString(),
  };

  // Process document for RAG if it's a supported type
  try {
    const processingResult = await documentProcessingService.processDocument(
      documentId,
      filePath,
      file.originalname,
      file.mimetype,
    );

    fileInfo.processed = true;
    fileInfo.processing = processingResult;
  } catch (error) {
    console.warn('Document processing failed:', error.message);
    fileInfo.processed = false;
    fileInfo.processingError = error.message;
  }

  res.status(201).json(formatResponse(fileInfo, 'File uploaded successfully'));
});

// @desc    Get all uploaded documents
// @route   GET /api/documents
// @access  Public
const getDocuments = asyncHandler(async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    const files = await fs.readdir(uploadsDir);

    const documents = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);

        return {
          id: filename.split('.')[0],
          filename,
          originalName: filename, // In a real app, you'd store this in a database
          path: `/uploads/${filename}`,
          size: stats.size,
          uploadedAt: stats.birthtime.toISOString(),
        };
      }),
    );

    res.json(formatResponse(documents, 'Documents retrieved successfully'));
  } catch (error) {
    res.status(500).json(formatError(error));
  }
});

// @desc    Get specific document info
// @route   GET /api/documents/:id
// @access  Public
const getDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    const files = await fs.readdir(uploadsDir);

    // Find file that starts with the provided ID
    const file = files.find((filename) => filename.startsWith(id));

    if (!file) {
      res.status(404);
      throw new Error('Document not found');
    }

    const filePath = path.join(uploadsDir, file);
    const stats = await fs.stat(filePath);

    const documentInfo = {
      id,
      filename: file,
      originalName: file,
      path: `/uploads/${file}`,
      size: stats.size,
      uploadedAt: stats.birthtime.toISOString(),
    };

    res.json(formatResponse(documentInfo, 'Document retrieved successfully'));
  } catch (error) {
    if (error.message === 'Document not found') {
      res.status(404).json(formatError(error, 404));
    } else {
      res.status(500).json(formatError(error));
    }
  }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Public
const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    const files = await fs.readdir(uploadsDir);

    // Find file that starts with the provided ID
    const file = files.find((filename) => filename.startsWith(id));

    if (!file) {
      res.status(404);
      throw new Error('Document not found');
    }

    const filePath = path.join(uploadsDir, file);
    await fs.unlink(filePath);

    res.json(
      formatResponse({ id, filename: file }, 'Document deleted successfully'),
    );
  } catch (error) {
    if (error.message === 'Document not found') {
      res.status(404).json(formatError(error, 404));
    } else {
      res.status(500).json(formatError(error));
    }
  }
});

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Public
const downloadDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    const files = await fs.readdir(uploadsDir);

    // Find file that starts with the provided ID
    const file = files.find((filename) => filename.startsWith(id));

    if (!file) {
      res.status(404);
      throw new Error('Document not found');
    }

    const filePath = path.join(uploadsDir, file);

    // Set proper headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
    res.sendFile(filePath);
  } catch (error) {
    if (error.message === 'Document not found') {
      res.status(404).json(formatError(error, 404));
    } else {
      res.status(500).json(formatError(error));
    }
  }
});

// @desc    Search documents using RAG
// @route   POST /api/documents/search
// @access  Public
const searchDocuments = asyncHandler(async (req, res) => {
  const { query, k = 5, threshold = 0.7 } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    res.status(400);
    throw new Error('Search query is required');
  }

  try {
    const results = await documentProcessingService.searchSimilarDocuments(
      query.trim(),
      { k: parseInt(k, 10), threshold: parseFloat(threshold) },
    );

    res.json(
      formatResponse(
        {
          query: query.trim(),
          results,
          total: results.length,
        },
        'Search completed successfully',
      ),
    );
  } catch (error) {
    res.status(500).json(formatError(error));
  }
});

// @desc    Get document processing statistics
// @route   GET /api/documents/stats
// @access  Public
const getDocumentStats = asyncHandler(async (req, res) => {
  try {
    const stats = await documentProcessingService.getDocumentStats();
    res.json(
      formatResponse(stats, 'Document statistics retrieved successfully'),
    );
  } catch (error) {
    res.status(500).json(formatError(error));
  }
});

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  downloadDocument,
  searchDocuments,
  getDocumentStats,
};

