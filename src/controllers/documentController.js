const path = require("path");
const asyncHandler = require("../middleware/asyncHandler");
const { formatResponse, formatError } = require("../utils/helpers");
const documentProcessingService = require("../services/documentProcessingService");
const blobStorageService = require("../services/blobStorageService");
const documentStore = require("../services/documentStore");

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Public
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const { file } = req;
  const documentId = `doc_${Date.now()}`;

  // Determine storage type and file source with enhanced debugging
  console.log("File object received:", {
    originalname: file.originalname,
    filename: file.filename,
    blobUrl: file.blobUrl,
    path: file.path,
    storageType: file.storageType,
    size: file.size,
  });

  const storageType = file.storageType || (file.blobUrl ? "blob" : "local");
  const isBlob = storageType === "blob";

  console.log("Storage determination:", { storageType, isBlob });

  // Enhanced file source determination with production safety checks
  let fileSource;
  let actualStorageType = storageType;

  // Production safety check: if we're in a serverless environment and don't have a blob URL,
  // but blob storage is configured, something went wrong
  if (process.env.VERCEL && blobStorageService.isConfigured()) {
    if (!file.blobUrl) {
      console.error(
        "CRITICAL: In Vercel environment with blob storage configured but no blobUrl",
      );
      res.status(500);
      throw new Error(
        "Storage error: File upload to blob storage failed in serverless environment",
      );
    }
    fileSource = file.blobUrl;
    actualStorageType = "blob";
  } else if (isBlob && file.blobUrl) {
    fileSource = file.blobUrl;
    console.log("Using blob URL as file source:", fileSource);
  } else {
    // For local storage, use the full path that was set in upload middleware
    fileSource =
      file.path || path.join(__dirname, "../../public/uploads", file.filename);
    actualStorageType = "local";
    console.log("Using local file path as file source:", fileSource);
  }

  console.log("Final file source determination:", {
    fileSource,
    actualStorageType,
    isVercel: !!process.env.VERCEL,
    blobConfigured: blobStorageService.isConfigured(),
  });

  // Additional safety check for blob storage
  if (blobStorageService.isConfigured() && !file.blobUrl && !file.path) {
    console.error("Blob storage is configured but file has no blobUrl or path");
    res.status(500);
    throw new Error(
      "Storage configuration error: file not properly stored in blob storage",
    );
  }

  const fileInfo = {
    id: documentId,
    originalName: file.originalname,
    filename: file.filename || file.blobFilename,
    mimetype: file.mimetype,
    size: file.size,
    path:
      actualStorageType === "blob" ? file.blobUrl : `/uploads/${file.filename}`,
    storageType: actualStorageType,
    uploadedAt: new Date().toISOString(),
  };

  // Process document for RAG if it's a supported type
  try {
    console.log("Processing document:", {
      documentId,
      fileSource,
      originalName: file.originalname,
      storageType,
      isBlob,
    });

    const processingResult = await documentProcessingService.processDocument(
      documentId,
      fileSource,
      file.originalname,
      file.mimetype,
      isBlob,
    );

    fileInfo.processed = true;
    fileInfo.processing = processingResult;
  } catch (error) {
    console.warn("Document processing failed:", error.message);
    fileInfo.processed = false;
    fileInfo.processingError = error.message;
  }

  // Store document metadata
  documentStore.addDocument(fileInfo);

  res.status(201).json(formatResponse(fileInfo, "File uploaded successfully"));
});

// @desc    Get all uploaded documents
// @route   GET /api/documents
// @access  Public
const getDocuments = asyncHandler(async (req, res) => {
  try {
    const documents = documentStore.getAllDocuments();
    res.json(formatResponse(documents, "Documents retrieved successfully"));
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
    const document = documentStore.getDocument(id);

    if (!document) {
      res.status(404);
      throw new Error("Document not found");
    }

    res.json(formatResponse(document, "Document retrieved successfully"));
  } catch (error) {
    if (error.message === "Document not found") {
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
    const document = await documentStore.deleteDocumentWithFile(id);

    // Also remove from vector store
    try {
      await documentProcessingService.deleteDocumentFromVectorStore(id);
    } catch (error) {
      console.warn("Failed to delete from vector store:", error.message);
    }

    res.json(
      formatResponse(
        { id, filename: document.filename },
        "Document deleted successfully",
      ),
    );
  } catch (error) {
    if (error.message === "Document not found") {
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
    const document = documentStore.getDocument(id);

    if (!document) {
      res.status(404);
      throw new Error("Document not found");
    }

    if (document.storageType === "blob") {
      // For blob storage, redirect to the blob URL or stream the file
      const fileBuffer = await blobStorageService.downloadFile(document.path);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.originalName}"`,
      );
      res.setHeader("Content-Type", document.mimetype);
      res.setHeader("Content-Length", fileBuffer.length);
      res.send(fileBuffer);
    } else {
      // For local storage, send the file directly
      const filePath = path.join(
        __dirname,
        "../../public/uploads",
        document.filename,
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.originalName}"`,
      );
      res.sendFile(filePath);
    }
  } catch (error) {
    if (error.message === "Document not found") {
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

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    res.status(400);
    throw new Error("Search query is required");
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
        "Search completed successfully",
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
    const vectorStats = await documentProcessingService.getDocumentStats();
    const storageStats = documentStore.getStorageStats();

    const stats = {
      vectorStore: vectorStats,
      storage: storageStats,
      blobStorageConfigured: blobStorageService.isConfigured(),
    };

    res.json(
      formatResponse(stats, "Document statistics retrieved successfully"),
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
