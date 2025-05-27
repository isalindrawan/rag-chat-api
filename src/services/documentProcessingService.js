const fs = require("fs").promises;
const pdf = require("pdf-parse");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { PGVectorStore } = require("@langchain/community/vectorstores/pgvector");
const config = require("../config/config");
const blobStorageService = require("./blobStorageService");
const databaseService = require("./databaseService");

class DocumentProcessingService {
  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.embeddingModel || "text-embedding-3-large",
    });
    this.vectorStore = null;
    this.usingMemoryFallback = false;
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  async initializeVectorStore() {
    if (this.vectorStore) {
      return this.vectorStore;
    }

    try {
      // Try to initialize database connection first
      await databaseService.initialize();

      if (databaseService.isReady) {
        // Use PGVectorStore if database is available
        this.vectorStore = await PGVectorStore.initialize(this.embeddings, {
          postgresConnectionOptions: config.database.url
            ? {
                connectionString: config.database.url,
                ssl: config.database.ssl
                  ? { rejectUnauthorized: false }
                  : false,
              }
            : {
                host: config.database.host,
                port: config.database.port,
                user: config.database.user,
                password: config.database.password,
                database: config.database.name,
                ssl: config.database.ssl
                  ? { rejectUnauthorized: false }
                  : false,
              },
          tableName: config.database.vectorStore.tableName,
          collectionName: config.database.vectorStore.collectionName,
          collectionTableName: `${config.database.vectorStore.tableName}_collections`,
        });
        this.usingMemoryFallback = false;
        console.log("✅ Using PostgreSQL vector store (pgvector)");
      } else {
        throw new Error("Database not ready");
      }
    } catch (error) {
      console.log("⚠️  Failed to initialize pgvector store:", error.message);
      console.log("🔄 Falling back to memory vector store");

      // Fallback to memory vector store
      this.vectorStore = new MemoryVectorStore(this.embeddings);
      this.usingMemoryFallback = true;

      if (config.database.vectorStore.useMemoryFallback) {
        console.log("⚠️  Using memory fallback - Neon DB connection failed");
        console.log("💡 Check your DATABASE_URL in .env file");
      } else {
        throw error;
      }
    }

    return this.vectorStore;
  }

  async extractTextFromFile(fileSource, mimetype, isBlob = false) {
    try {
      console.log("Extracting text from file:", {
        fileSource,
        mimetype,
        isBlob,
      });

      let buffer;

      if (isBlob) {
        // Download file from blob storage
        console.log("Downloading from blob storage:", fileSource);
        buffer = await blobStorageService.downloadFile(fileSource);
      } else {
        // Read from local file system (for development)
        console.log("Reading from local file system:", fileSource);
        buffer = await fs.readFile(fileSource);
      }

      switch (mimetype) {
        case "application/pdf":
          return await this.extractTextFromPDF(buffer);
        case "text/plain":
        case "text/markdown":
          return buffer.toString("utf-8");
        case "application/json":
          return JSON.stringify(JSON.parse(buffer.toString("utf-8")), null, 2);
        case "text/csv":
          return buffer.toString("utf-8");
        case "application/msword":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          // For now, treat as plain text. Consider adding docx parsing library
          return buffer.toString("utf-8");
        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      console.error("Error extracting text from file:", error);
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

  async processDocument(
    documentId,
    fileSource,
    originalName,
    mimetype,
    isBlob = false,
  ) {
    try {
      // Extract text from document (handles both blob URLs and local file paths)
      const text = await this.extractTextFromFile(fileSource, mimetype, isBlob);

      if (!text || text.trim().length === 0) {
        throw new Error("Document contains no extractable text");
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

      // Add documents to vector store - LangChain will auto-generate IDs
      await this.vectorStore.addDocuments(documents);

      return {
        documentId,
        chunksCreated: chunks.length,
        totalCharacters: text.length,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error processing document:", error);
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
      console.error("Error searching similar documents:", error);
      throw new Error(`Failed to search documents: ${error.message}`);
    }
  }

  async getDocumentStats() {
    try {
      if (!this.vectorStore) {
        return {
          totalDocuments: 0,
          totalChunks: 0,
          usingMemoryFallback: this.usingMemoryFallback,
          vectorStoreType: this.usingMemoryFallback ? "Memory" : "PostgreSQL",
        };
      }

      if (this.usingMemoryFallback) {
        // For memory vector store, get all documents
        const allDocs = await this.vectorStore.similaritySearch("", 1000);
        const uniqueDocuments = new Set(
          allDocs.map((doc) => doc.metadata.documentId),
        );

        return {
          totalDocuments: uniqueDocuments.size,
          totalChunks: allDocs.length,
          usingMemoryFallback: true,
          vectorStoreType: "Memory",
        };
      } else {
        // For PostgreSQL vector store, query the database directly
        const client = await databaseService.getClient();
        try {
          const tableName = config.database.vectorStore.tableName;

          // LangChain stores documents with collection_name = null and metadata contains documentId
          // Query by checking the metadata JSON field for documentId
          const result = await client.query(
            `SELECT 
              COUNT(DISTINCT (metadata->>'documentId')) as total_documents,
              COUNT(*) as total_chunks
            FROM ${tableName}
            WHERE (collection_name IS NULL OR collection_name = $1)
              AND metadata->>'documentId' IS NOT NULL`,
            [config.database.vectorStore.collectionName],
          );

          return {
            totalDocuments: parseInt(result.rows[0].total_documents, 10) || 0,
            totalChunks: parseInt(result.rows[0].total_chunks, 10) || 0,
            usingMemoryFallback: false,
            vectorStoreType: "PostgreSQL",
          };
        } finally {
          client.release();
        }
      }
    } catch (error) {
      console.error("Error getting document stats:", error);
      return {
        totalDocuments: 0,
        totalChunks: 0,
        usingMemoryFallback: this.usingMemoryFallback,
        vectorStoreType: this.usingMemoryFallback ? "Memory" : "PostgreSQL",
      };
    }
  }

  async deleteDocumentFromVectorStore(documentId) {
    try {
      if (!this.vectorStore) {
        return { deletedChunks: 0 };
      }

      if (this.usingMemoryFallback) {
        // Memory vector store doesn't have delete method
        console.log(
          `Would delete all chunks for document ${documentId} from memory vector store`,
        );
        return { deletedChunks: 0 };
      } else {
        // For PostgreSQL vector store, delete from database
        const client = await databaseService.getClient();
        try {
          const tableName = config.database.vectorStore.tableName;
          // LangChain stores documents with metadata containing documentId
          const result = await client.query(
            `DELETE FROM ${tableName}
            WHERE (collection_name IS NULL OR collection_name = $1) 
              AND metadata->>'documentId' = $2`,
            [config.database.vectorStore.collectionName, documentId],
          );

          console.log(
            `Deleted ${result.rowCount} chunks for document ${documentId} from PostgreSQL`,
          );
          return { deletedChunks: result.rowCount };
        } finally {
          client.release();
        }
      }
    } catch (error) {
      console.error("Error deleting document from vector store:", error);
      throw new Error(
        `Failed to delete document from vector store: ${error.message}`,
      );
    }
  }
}

module.exports = new DocumentProcessingService();
