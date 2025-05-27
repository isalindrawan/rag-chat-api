const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('langchain/schema');
const config = require('../config/config');
const documentProcessingService = require('./documentProcessingService');

class ChatService {
  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
      maxTokens: config.openai.maxTokens,
    });
  }

  async processMessage(message, sessionId = null, useRAG = false) {
    try {
      let systemContent =
        'You are a helpful AI assistant. Provide accurate and helpful responses to user questions.';
      let contextInfo = '';

      // If RAG is enabled, search for relevant documents
      if (useRAG) {
        try {
          const relevantDocs =
            await documentProcessingService.searchSimilarDocuments(message, {
              k: 3,
              threshold: 0.6,
            });

          if (relevantDocs.length > 0) {
            const context = relevantDocs
              .map((doc, index) => `Context ${index + 1}:\n${doc.content}`)
              .join('\n\n');

            systemContent = `You are a helpful AI assistant with access to relevant documents. Use the following context to provide accurate and helpful responses. If the context doesn't contain relevant information for the user's question, you can still provide general assistance.

Context:
${context}

Please answer the user's question based on the provided context when relevant, but also use your general knowledge when appropriate.`;

            contextInfo = `Used ${relevantDocs.length} document context(s)`;
          }
        } catch (ragError) {
          console.warn(
            'RAG search failed, falling back to normal chat:',
            ragError.message,
          );
        }
      }

      // System message with optional context
      const systemMessage = new SystemMessage(systemContent);

      // User's message
      const humanMessage = new HumanMessage(message);

      // Generate response using LangChain
      const response = await this.llm.call([systemMessage, humanMessage]);

      const result = {
        sessionId: sessionId || this.generateSessionId(),
        userMessage: message,
        aiResponse: response.content,
        timestamp: new Date().toISOString(),
        ragEnabled: useRAG,
      };

      if (contextInfo) {
        result.contextInfo = contextInfo;
      }

      return result;
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

