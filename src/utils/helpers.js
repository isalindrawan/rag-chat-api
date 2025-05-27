// Utility functions for the application

const generateId = () =>
  `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return false;
  }

  if (message.trim().length === 0) {
    return false;
  }

  if (message.length > 10000) {
    // Max message length
    return false;
  }

  return true;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  return input.trim();
};

const formatResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
});

const formatError = (error, statusCode = 500) => ({
  success: false,
  error: {
    message: error.message || 'Internal server error',
    statusCode,
  },
  timestamp: new Date().toISOString(),
});

module.exports = {
  generateId,
  validateMessage,
  sanitizeInput,
  formatResponse,
  formatError,
};

