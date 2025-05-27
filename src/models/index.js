// Placeholder for future models
// This directory will contain data models/schemas for:
// - Chat sessions
// - Messages
// - User profiles
// - Documents (for RAG)

class ChatSession {
  constructor(id, userId = null, createdAt = new Date()) {
    this.id = id;
    this.userId = userId;
    this.messages = [];
    this.createdAt = createdAt;
    this.updatedAt = createdAt;
  }

  addMessage(message) {
    this.messages.push(message);
    this.updatedAt = new Date();
  }
}

module.exports = {
  ChatSession,
};

