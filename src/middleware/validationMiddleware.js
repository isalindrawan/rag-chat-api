const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: errors.array(),
    });
  }
  next();
};

// Chat message validation
const validateChatMessage = [
  body('message')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters')
    .trim(),
  body('sessionId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Session ID must be between 1 and 100 characters')
    .isAlphanumeric()
    .withMessage('Session ID must contain only alphanumeric characters'),
  body('useRAG')
    .optional()
    .isBoolean()
    .withMessage('useRAG must be a boolean value'),
  handleValidationErrors,
];

// Document search validation
const validateDocumentSearch = [
  body('query')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Query must be between 1 and 1000 characters')
    .trim(),
  body('k')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('k must be an integer between 1 and 20'),
  body('threshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('threshold must be a float between 0 and 1'),
  handleValidationErrors,
];

// Document ID validation
const validateDocumentId = [
  param('id')
    .isLength({ min: 1, max: 100 })
    .withMessage('Document ID must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Document ID contains invalid characters'),
  handleValidationErrors,
];

// Session ID validation
const validateSessionId = [
  param('sessionId')
    .isLength({ min: 1, max: 100 })
    .withMessage('Session ID must be between 1 and 100 characters')
    .isAlphanumeric()
    .withMessage('Session ID must contain only alphanumeric characters'),
  handleValidationErrors,
];

module.exports = {
  validateChatMessage,
  validateDocumentSearch,
  validateDocumentId,
  validateSessionId,
  handleValidationErrors,
};
