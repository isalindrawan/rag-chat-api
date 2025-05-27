const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const config = require('../config/config');

class DocumentProcessingService {
  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openai.apiKey,
    });
    this.vectorStore = null;
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  async initializeVectorStore() {
    if (!this.vectorStore) {
      this.vectorStore = new MemoryVectorStore(this.embeddings);
    }
    return this.vectorStore;
  }

  async extractTextFromFile(filePath, mimetype) {
    try {
      const buffer = await fs.readFile(filePath);

      switch (mimetype) {
        case 'application/pdf':
          return await this.extractTextFromPDF(buffer);
        case 'text/plain':
        case 'text/markdown':
          return buffer.toString('utf-8');
        case 'application/json':
          return JSON.stringify(JSON.parse(buffer.toString('utf-8')), null, 2);
        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }
  }

  async extractTextFromPDF(buffer) {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async processDocument(documentId, filePath, originalName, mimetype) {
    try {
      // Extract text from document
      const text = await this.extractTextFromFile(filePath, mimetype);

      if (!text || text.trim().length === 0) {
        throw new Error('Document contains no extractable text');
      }

      // Split text into chunks
      const chunks = await this.textSplitter.splitText(text);

      // Create metadata for each chunk
      const documents = chunks.map((chunk, index) => ({
        pageContent: chunk,
        metadata: {
          documentId,
          originalName,
          chunkIndex: index,
          totalChunks: chunks.length,
          processedAt: new Date().toISOString(),
        },
      }));

      // Initialize vector store if not already done
      await this.initializeVectorStore();

      // Add documents to vector store
      await this.vectorStore.addDocuments(documents);

      return {
        documentId,
        chunksCreated: chunks.length,
        totalCharacters: text.length,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  async searchSimilarDocuments(query, options = {}) {
    try {
      const { k = 5, threshold = 0.7 } = options;

      if (!this.vectorStore) {
        await this.initializeVectorStore();
      }

      // Perform similarity search
      const results = await this.vectorStore.similaritySearchWithScore(
        query,
        k,
      );

      // Filter by threshold if specified
      const filteredResults = results
        .filter(([, score]) => score >= threshold)
        .map(([document, score]) => ({
          content: document.pageContent,
          metadata: document.metadata,
          similarity: score,
        }));

      return filteredResults;
    } catch (error) {
      console.error('Error searching similar documents:', error);
      throw new Error(`Failed to search documents: ${error.message}`);
    }
  }

  async getDocumentStats() {
    try {
      if (!this.vectorStore) {
        return {
          totalDocuments: 0,
          totalChunks: 0,
        };
      }

      // Get all documents from vector store
      const allDocs = await this.vectorStore.similaritySearch('', 1000);

      // Count unique documents
      const uniqueDocuments = new Set(
        allDocs.map((doc) => doc.metadata.documentId),
      );

      return {
        totalDocuments: uniqueDocuments.size,
        totalChunks: allDocs.length,
      };
    } catch (error) {
      console.error('Error getting document stats:', error);
      return {
        totalDocuments: 0,
        totalChunks: 0,
      };
    }
  }

  async deleteDocumentFromVectorStore(documentId) {
    try {
      if (!this.vectorStore) {
        return { deletedChunks: 0 };
      }

      // Note: MemoryVectorStore doesn't have a built-in delete method
      // In a production environment, you'd use a persistent vector store with delete capabilities
      // For now, we'll return a placeholder response
      console.log(
        `Would delete all chunks for document ${documentId} from vector store`,
      );

      return { deletedChunks: 0 };
    } catch (error) {
      console.error('Error deleting document from vector store:', error);
      throw new Error(
        `Failed to delete document from vector store: ${error.message}`,
      );
    }
  }
}

module.exports = new DocumentProcessingService();

