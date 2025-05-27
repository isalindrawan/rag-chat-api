#!/usr/bin/env node

/**
 * Database Reinitialization Script
 * This script completely reinitializes the database by:
 * 1. Dropping all existing tables
 * 2. Recreating the vector store with correct dimensions
 * 3. Setting up proper indexes
 * 4. Verifying the setup
 */

require("dotenv").config();
const databaseService = require("../src/services/databaseService");
const config = require("../src/config/config");

async function reinitializeDatabase() {
  console.log("🔄 Database Reinitialization");
  console.log("=".repeat(50));

  try {
    console.log("\n1️⃣ Connecting to database...");
    await databaseService.initialize();

    if (!databaseService.isReady) {
      throw new Error("Failed to connect to database");
    }
    console.log("✅ Database connected successfully");

    console.log("\n2️⃣ Getting database client...");
    const client = await databaseService.getClient();

    try {
      console.log("\n3️⃣ Dropping existing tables and indexes...");

      // Drop all indexes first
      await client.query(`
        DROP INDEX IF EXISTS langchain_pg_embedding_embedding_idx;
        DROP INDEX IF EXISTS langchain_pg_embedding_collection_name_idx;
        DROP INDEX IF EXISTS langchain_pg_embedding_document_idx;
        DROP INDEX IF EXISTS langchain_pg_embedding_cmetadata_idx;
      `);
      console.log("   - Dropped existing indexes");

      // Drop the main table
      await client.query(`
        DROP TABLE IF EXISTS ${config.database.vectorStore.tableName} CASCADE;
      `);
      console.log("   - Dropped langchain_pg_embedding table");

      // Drop any other related tables
      await client.query(`
        DROP TABLE IF EXISTS langchain_pg_collection CASCADE;
      `);
      console.log("   - Dropped langchain_pg_collection table");

      console.log("\n4️⃣ Ensuring pgvector extension is enabled...");
      await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
      console.log("   - pgvector extension enabled");

      console.log("\n5️⃣ Creating fresh vector store tables...");

      // Create the main embedding table with correct dimensions
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${config.database.vectorStore.tableName} (
          uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          collection_name TEXT,
          embedding VECTOR(${config.database.vectorStore.dimensions}),
          document TEXT,
          cmetadata JSONB,
          custom_id TEXT
        );
      `);
      console.log(
        `   - Created table with ${config.database.vectorStore.dimensions} dimensions`,
      );

      // Create collection table
      await client.query(`
        CREATE TABLE IF NOT EXISTS langchain_pg_collection (
          uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT UNIQUE NOT NULL,
          cmetadata JSONB
        );
      `);
      console.log("   - Created collection table");

      console.log("\n6️⃣ Creating optimized indexes...");

      const dimensions = config.database.vectorStore.dimensions;
      let indexType = "ivfflat";
      let indexOptions = "WITH (lists = 100)";

      // Choose index type based on dimensions
      if (dimensions > 1000 && dimensions <= 2000) {
        indexType = "hnsw";
        indexOptions = "WITH (m = 16, ef_construction = 64)";
        console.log(`   - Using HNSW index for ${dimensions} dimensions`);
      } else if (dimensions <= 1000) {
        console.log(`   - Using IVFFlat index for ${dimensions} dimensions`);
      } else {
        console.log(
          `   - Warning: ${dimensions} dimensions exceeds pgvector limits, skipping index`,
        );
        indexType = null;
      }

      if (indexType) {
        await client.query(`
          CREATE INDEX langchain_pg_embedding_embedding_idx 
          ON ${config.database.vectorStore.tableName} 
          USING ${indexType} (embedding vector_cosine_ops) 
          ${indexOptions};
        `);
        console.log(`   - Created ${indexType} index on embedding column`);
      }

      // Create other indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS langchain_pg_embedding_collection_name_idx 
        ON ${config.database.vectorStore.tableName} (collection_name);
      `);
      console.log("   - Created collection_name index");

      await client.query(`
        CREATE INDEX IF NOT EXISTS langchain_pg_embedding_custom_id_idx 
        ON ${config.database.vectorStore.tableName} (custom_id);
      `);
      console.log("   - Created custom_id index");

      await client.query(`
        CREATE INDEX IF NOT EXISTS langchain_pg_embedding_cmetadata_idx 
        ON ${config.database.vectorStore.tableName} USING GIN (cmetadata);
      `);
      console.log("   - Created metadata index");

      console.log("\n7️⃣ Verifying database setup...");

      // Check table structure
      const tableInfo = await client.query(
        `
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `,
        [config.database.vectorStore.tableName],
      );

      console.log("   - Table structure:");
      tableInfo.rows.forEach((row) => {
        console.log(`     ${row.column_name}: ${row.data_type}`);
      });

      // Check embedding column dimensions
      const embeddingInfo = await client.query(
        `
        SELECT atttypmod 
        FROM pg_attribute 
        WHERE attrelid = (SELECT oid FROM pg_class WHERE relname = $1)
        AND attname = 'embedding'
      `,
        [config.database.vectorStore.tableName],
      );

      if (embeddingInfo.rows.length > 0) {
        const actualDimensions = embeddingInfo.rows[0].atttypmod - 4;
        console.log(`   - Embedding dimensions: ${actualDimensions}`);

        if (actualDimensions === config.database.vectorStore.dimensions) {
          console.log("   ✅ Dimensions match configuration");
        } else {
          console.log(
            `   ❌ Dimension mismatch! Expected: ${config.database.vectorStore.dimensions}, Got: ${actualDimensions}`,
          );
        }
      }

      // Check indexes
      const indexes = await client.query(
        `
        SELECT indexname, indexdef
        FROM pg_indexes 
        WHERE tablename = $1
        ORDER BY indexname;
      `,
        [config.database.vectorStore.tableName],
      );

      console.log("   - Indexes created:");
      indexes.rows.forEach((row) => {
        console.log(`     ${row.indexname}`);
      });

      // Check record count
      const count = await client.query(`
        SELECT COUNT(*) as count FROM ${config.database.vectorStore.tableName}
      `);
      console.log(`   - Records in table: ${count.rows[0].count}`);
    } finally {
      client.release();
    }

    console.log("\n8️⃣ Testing vector store initialization...");

    // Force reinitialization of the vector store
    await databaseService.close();
    await databaseService.initialize();

    if (databaseService.isReady) {
      console.log("✅ Vector store reinitialized successfully");
    } else {
      throw new Error("Failed to reinitialize vector store");
    }

    console.log("\n🎉 Database Reinitialization Complete!");
    console.log("================================");
    console.log(`✅ Database Type: PostgreSQL (Neon)`);
    console.log(`✅ Embedding Model: ${config.openai.embeddingModel}`);
    console.log(
      `✅ Vector Dimensions: ${config.database.vectorStore.dimensions}`,
    );
    console.log(`✅ Table: ${config.database.vectorStore.tableName}`);
    console.log(`✅ pgvector Extension: Enabled`);
    console.log(
      `✅ Indexes: Optimized for ${config.database.vectorStore.dimensions}D vectors`,
    );
    console.log("\nThe database is now ready for document processing!");
  } catch (error) {
    console.error("\n❌ Database reinitialization failed:", error);
    process.exit(1);
  } finally {
    await databaseService.close();
  }
}

// Run the reinitialization
if (require.main === module) {
  reinitializeDatabase()
    .then(() => {
      console.log("\n✅ Reinitialization completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Reinitialization failed:", error);
      process.exit(1);
    });
}

module.exports = { reinitializeDatabase };
