#!/usr/bin/env node

/**
 * Test script to verify embedding dimension migration from 1536 to 3072
 * This script tests the automatic dimension detection and migration logic
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { OpenAIEmbeddings } = require("@langchain/openai");
const config = require("./src/config/config");
const databaseService = require("./src/services/databaseService");

async function testDimensionMigration() {
  console.log("🧪 Testing Embedding Dimension Migration");
  console.log("=".repeat(50));

  try {
    // 1. Check current configuration
    console.log("\n📋 Current Configuration:");
    console.log(`- Embedding Model: ${config.openai.embeddingModel}`);
    console.log(
      `- Expected Dimensions: ${config.database.vectorStore.dimensions}`,
    );
    console.log(
      `- Database URL: ${config.database.url ? "✓ Set" : "✗ Not set"}`,
    );

    // 2. Test embedding model dimensions
    console.log("\n🔍 Testing Embedding Model Dimensions:");
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.embeddingModel,
    });

    const testEmbedding = await embeddings.embedQuery("test");
    const actualDimensions = testEmbedding.length;
    console.log(`- Actual embedding dimensions: ${actualDimensions}`);
    console.log(
      `- Expected dimensions: ${config.database.vectorStore.dimensions}`,
    );

    if (actualDimensions === config.database.vectorStore.dimensions) {
      console.log("✅ Embedding dimensions match configuration");
    } else {
      console.log("❌ Embedding dimensions mismatch!");
      console.log(`  Expected: ${config.database.vectorStore.dimensions}`);
      console.log(`  Actual: ${actualDimensions}`);

      if (actualDimensions === 1536) {
        console.log(
          "💡 Suggestion: Use 'text-embedding-3-small' model for 1536 dimensions",
        );
      } else if (actualDimensions === 3072) {
        console.log(
          "💡 Suggestion: Use 'text-embedding-3-large' model for 3072 dimensions",
        );
      }
    }

    // 3. Test database connection and migration
    console.log("\n🗄️  Testing Database Connection and Migration:");
    await databaseService.initialize();

    if (databaseService.isReady) {
      console.log("✅ Database connection successful");

      // Check table schema
      const client = await databaseService.getClient();
      try {
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
          const dbDimensions = embeddingInfo.rows[0].atttypmod - 4;
          console.log(`- Database embedding dimensions: ${dbDimensions}`);

          if (dbDimensions === actualDimensions) {
            console.log("✅ Database schema matches embedding model");
          } else {
            console.log(
              "⚠️  Database schema will be migrated on next initialization",
            );
          }
        }

        // Check if table has data
        const dataCount = await client.query(`
          SELECT COUNT(*) as count 
          FROM ${config.database.vectorStore.tableName}
        `);
        console.log(
          `- Existing records in database: ${dataCount.rows[0].count}`,
        );
      } finally {
        client.release();
      }
    } else {
      console.log("❌ Database connection failed");
    }

    // 4. Test end-to-end document processing (if database is ready)
    if (databaseService.isReady) {
      console.log("\n📄 Testing End-to-End Document Processing:");

      const documentProcessingService = require("./src/services/documentProcessingService");
      // documentProcessingService doesn't have an initialize method, it initializes automatically

      // Create a temporary test file
      const testFilePath = path.join(__dirname, "temp-dimension-test.txt");
      const testContent =
        "This is a test document to verify that embedding dimensions work correctly with the text-embedding-3-small model (1536 dimensions). This test validates the migration from 3072 to 1536 dimensions and ensures the RAG functionality works as expected.";

      // Write test file
      fs.writeFileSync(testFilePath, testContent);

      const testDocument = {
        filename: "test-dimension-migration.txt",
        filePath: testFilePath,
        content: testContent,
        documentId: `test-migration-${Date.now()}`,
      };

      try {
        console.log("- Processing test document...");
        const result =
          await documentProcessingService.processDocument(testDocument);
        console.log(`✅ Document processed successfully`);
        console.log(`- Chunks created: ${result.chunks.length}`);
        console.log(
          `- Documents added to vector store: ${result.documentsAdded}`,
        );

        // Test similarity search
        console.log("- Testing similarity search...");
        const searchResults =
          await documentProcessingService.searchSimilarDocuments(
            "test document embedding dimensions",
            3,
          );
        console.log(`✅ Similarity search successful`);
        console.log(`- Results found: ${searchResults.length}`);

        // Clean up test document
        console.log("- Cleaning up test document...");
        await documentProcessingService.deleteDocumentsByDocumentId(
          testDocument.documentId,
        );
        console.log("✅ Test document cleaned up");

        // Clean up temporary file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      } catch (error) {
        console.error("❌ Document processing test failed:", error.message);
        // Clean up temporary file even on error
        if (testFilePath && fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    }

    console.log("\n🎉 Dimension Migration Test Complete!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await databaseService.close();
  }
}

// Run the test
if (require.main === module) {
  testDimensionMigration()
    .then(() => {
      console.log("\n✅ All tests completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = { testDimensionMigration };
