const {
  generateId,
  validateMessage,
  sanitizeInput,
  formatResponse,
  formatError,
} = require('../src/utils/helpers');

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  describe('validateMessage', () => {
    it('should return true for valid messages', () => {
      expect(validateMessage('Hello world')).toBe(true);
      expect(validateMessage('A valid message')).toBe(true);
    });

    it('should return false for invalid messages', () => {
      expect(validateMessage('')).toBe(false);
      expect(validateMessage('   ')).toBe(false);
      expect(validateMessage(null)).toBe(false);
      expect(validateMessage(undefined)).toBe(false);
      expect(validateMessage(123)).toBe(false);
    });

    it('should return false for messages that are too long', () => {
      const longMessage = 'a'.repeat(10001);
      expect(validateMessage(longMessage)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace from strings', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
      expect(sanitizeInput('test')).toBe('test');
    });

    it('should return empty string for non-string inputs', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
    });
  });

  describe('formatResponse', () => {
    it('should format successful responses correctly', () => {
      const data = { test: 'data' };
      const response = formatResponse(data, 'Custom message');

      expect(response.success).toBe(true);
      expect(response.message).toBe('Custom message');
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
    });

    it('should use default message when not provided', () => {
      const response = formatResponse({ test: 'data' });
      expect(response.message).toBe('Success');
    });
  });

  describe('formatError', () => {
    it('should format error responses correctly', () => {
      const error = new Error('Test error');
      const response = formatError(error, 400);

      expect(response.success).toBe(false);
      expect(response.error.message).toBe('Test error');
      expect(response.error.statusCode).toBe(400);
      expect(response.timestamp).toBeDefined();
    });

    it('should use default status code when not provided', () => {
      const error = new Error('Test error');
      const response = formatError(error);
      expect(response.error.statusCode).toBe(500);
    });
  });
});

