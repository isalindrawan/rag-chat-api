const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Determine upload directory based on environment
const getUploadDir = () => {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    // Use Vercel's tmp directory for serverless environment
    return "/tmp/uploads";
  }
  // Use local public/uploads for development
  return path.join(process.cwd(), "public", "uploads");
};

// Ensure upload directory exists
const ensureUploadDir = (uploadDir) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadDir();
    ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

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
  handleUploadError,
  getUploadDir,
  ensureUploadDir,
};
