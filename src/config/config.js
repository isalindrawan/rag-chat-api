// Load environment variables from .env file
require("dotenv").config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
  rateLimitMaxRequests:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    embeddingModel:
      process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 1000,
  },

  // Vercel specific configurations
  isProduction: process.env.NODE_ENV === "production",
  isVercel: !!process.env.VERCEL,

  // Blob Storage Configuration
  blobStorage: {
    token: process.env.BLOB_READ_WRITE_TOKEN,
    storeName: process.env.BLOB_STORE_NAME || "rag-chat-api-blob",
    enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
  },

  // PostgreSQL Database Configuration (Neon DB)
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME || "rag_chat_api",
    ssl: process.env.DATABASE_SSL !== "false", // Default to true for Neon
    vectorStore: {
      tableName: process.env.VECTOR_TABLE_NAME || "langchain_pg_embedding",
      collectionName: process.env.VECTOR_COLLECTION_NAME || "documents",
      dimensions: parseInt(process.env.VECTOR_DIMENSIONS, 10) || 1536,
      useMemoryFallback: process.env.USE_MEMORY_FALLBACK !== "false",
    },
  },
};
