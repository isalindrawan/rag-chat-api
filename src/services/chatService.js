const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('langchain/schema');
const config = require('../config/config');

class ChatService {
  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
      maxTokens: config.openai.maxTokens,
    });
  }

  async processMessage(message, sessionId = null) {
    try {
      // System message to define the AI's behavior
      const systemMessage = new SystemMessage(
        'You are a helpful AI assistant. Provide accurate and helpful responses to user questions.',
      );

      // User's message
      const humanMessage = new HumanMessage(message);

      // Generate response using LangChain
      const response = await this.llm.call([systemMessage, humanMessage]);

      return {
        sessionId: sessionId || this.generateSessionId(),
        userMessage: message,
        aiResponse: response.content,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Placeholder for RAG implementation
  async processRAGMessage(message) {
    // TODO: Implement RAG (Retrieval-Augmented Generation) logic
    // This would involve:
    // 1. Document embedding and storage
    // 2. Similarity search for relevant documents
    // 3. Context injection into the prompt
    // 4. Response generation with retrieved context

    return this.processMessage(message);
  }
}

module.exports = new ChatService();

