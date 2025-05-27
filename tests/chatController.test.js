const request = require('supertest');
const app = require('../src/app');

// Mock the chatService to avoid making actual OpenAI API calls during testing
jest.mock('../src/services/chatService', () => ({
  processMessage: jest.fn().mockResolvedValue({
    sessionId: 'test_session_123',
    userMessage: 'Hello',
    aiResponse: 'Hello! How can I help you?',
    timestamp: '2024-05-27T12:00:00.000Z',
  }),
}));

describe('Chat Controller', () => {
  describe('POST /api/chat', () => {
    it('should process a message successfully', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('userMessage', 'Hello');
      expect(response.body.data).toHaveProperty('aiResponse');
    });

    it('should return 400 when message is missing', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Message is required');
    });

    it('should return 400 when message is empty', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Message is required');
    });
  });

  describe('GET /api/chat', () => {
    it('should return chat sessions', async () => {
      const response = await request(app).get('/api/chat').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('sessions');
    });
  });

  describe('GET /api/chat/:sessionId', () => {
    it('should return specific chat session', async () => {
      const sessionId = 'test_session_123';
      const response = await request(app)
        .get(`/api/chat/${sessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('sessionId', sessionId);
      expect(response.body).toHaveProperty('messages');
    });
  });

  describe('DELETE /api/chat/:sessionId', () => {
    it('should delete chat session', async () => {
      const sessionId = 'test_session_123';
      const response = await request(app)
        .delete(`/api/chat/${sessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('sessionId', sessionId);
      expect(response.body.message).toContain('deleted');
    });
  });
});

