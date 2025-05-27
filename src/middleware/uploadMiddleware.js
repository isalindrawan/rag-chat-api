const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const blobStorageService = require("../services/blobStorageService");

// Configure multer to use memory storage for Vercel Blob integration
const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "application/json",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, TXT, MD, DOC, DOCX, CSV, and JSON files are allowed.",
      ),
      false,
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files per request
  },
  fileFilter: fileFilter,
});

// Create specific upload middleware functions
const uploadSingle = upload.single("document");
const uploadMultiple = upload.array("documents", 5);

// Middleware to upload file to Vercel Blob Storage after multer processing
const uploadToBlob = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // Check if blob storage is configured
    if (!blobStorageService.isConfigured()) {
      console.warn("Blob storage not configured, using local storage fallback");

      // Save file locally for development
      const timestamp = Date.now();
      const extension = path.extname(req.file.originalname);
      const baseName = path.basename(req.file.originalname, extension);
      const filename = `${timestamp}-${baseName}${extension}`;
      const uploadDir = path.join(__dirname, "../../public/uploads");
      const filePath = path.join(uploadDir, filename);

      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // Write file to disk
      await fs.writeFile(filePath, req.file.buffer);

      // Update req.file with local file info
      req.file.filename = filename;
      req.file.path = filePath;

      console.log(`File saved locally: ${filePath}`);
      return next();
    }

    // Upload file buffer to Vercel Blob
    const blobResult = await blobStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    // Add blob information to req.file for downstream processing
    req.file.blobUrl = blobResult.url;
    req.file.blobFilename = blobResult.filename;
    req.file.filename = blobResult.filename; // For compatibility with existing code
    req.file.path = blobResult.url; // Use blob URL as path
    req.file.size = blobResult.size;

    console.log(`File uploaded to blob storage: ${blobResult.url}`);
    next();
  } catch (error) {
    console.error("Error uploading to blob storage:", error);
    return res.status(500).json({
      error: "Failed to upload file to storage",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Error handling middleware for upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large. Maximum size is 10MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files. Maximum is 5 files.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error:
          "Unexpected file field. Use 'document' for single file or 'documents' for multiple.",
      });
    }
  }

  if (error.message) {
    return res.status(400).json({
      error: error.message,
    });
  }

  next(error);
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadToBlob,
  handleUploadError,
  blobStorageService,
};
