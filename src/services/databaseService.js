const { Pool } = require("pg");
const config = require("../config/config");

class DatabaseService {
  constructor() {
    this.pool = null;
    this.isReady = false;
  }

  async initialize() {
    try {
      // Create connection pool
      const connectionConfig = config.database.url
        ? {
            connectionString: config.database.url,
            ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
          }
        : {
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.password,
            database: config.database.name,
            ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
          };

      this.pool = new Pool(connectionConfig);

      // Test connection
      const client = await this.pool.connect();
      console.log("✅ Database connected successfully");

      // Initialize schema
      await this.initializeSchema(client);

      client.release();
      this.isReady = true;
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      this.isReady = false;

      if (config.database.vectorStore.useMemoryFallback) {
        console.log("⚠️  Falling back to memory vector store");
      } else {
        throw error;
      }
    }
  }

  async initializeSchema(client) {
    try {
      // Enable pgvector extension
      await client.query("CREATE EXTENSION IF NOT EXISTS vector");
      console.log("✅ pgvector extension enabled");

      // Create the embeddings table
      const tableName = config.database.vectorStore.tableName;

      // Check if table exists and has correct schema
      const tableInfo = await client.query(
        `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name IN ('text', 'document', 'metadata', 'cmetadata')
      `,
        [tableName],
      );

      const hasDocumentColumn = tableInfo.rows.some(
        (row) => row.column_name === "document",
      );
      const hasTextColumn = tableInfo.rows.some(
        (row) => row.column_name === "text",
      );
      const hasCMetadataColumn = tableInfo.rows.some(
        (row) => row.column_name === "cmetadata",
      );
      const hasMetadataColumn = tableInfo.rows.some(
        (row) => row.column_name === "metadata",
      );

      // If table has incorrect schema, we need to migrate
      const needsMigration =
        (hasDocumentColumn && !hasTextColumn) ||
        (hasCMetadataColumn && !hasMetadataColumn);

      if (needsMigration) {
        console.log(
          `⚠️  Table ${tableName} has incorrect schema, migrating...`,
        );
        await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
        console.log(`🗑️  Dropped table ${tableName} for schema migration`);
      }

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          collection_name VARCHAR(255),
          embedding VECTOR(${config.database.vectorStore.dimensions}),
          text TEXT,
          metadata JSONB,
          custom_id VARCHAR(255)
        )
      `;

      await client.query(createTableQuery);
      console.log(`✅ Table ${tableName} created/verified`);

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS ${tableName}_collection_name_idx 
        ON ${tableName} (collection_name)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS ${tableName}_embedding_idx 
        ON ${tableName} USING ivfflat (embedding vector_cosine_ops) 
        WITH (lists = 100)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS ${tableName}_custom_id_idx 
        ON ${tableName} (custom_id)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS ${tableName}_metadata_idx 
        ON ${tableName} USING gin (metadata)
      `);

      console.log("✅ Database indexes created/verified");
    } catch (error) {
      console.error("❌ Error initializing database schema:", error);
      throw error;
    }
  }

  async getClient() {
    if (!this.pool) {
      throw new Error("Database not initialized");
    }
    return this.pool.connect();
  }

  getPool() {
    return this.pool;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isReady = false;
    }
  }

  async healthCheck() {
    try {
      if (!this.pool) return false;
      const client = await this.pool.connect();
      await client.query("SELECT 1");
      client.release();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;
