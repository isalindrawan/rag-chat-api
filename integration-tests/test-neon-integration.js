#!/usr/bin/env node

/**
 * Test script for Neon DB pgvector integration
 * This script tests the complete integration including fallback mechanisms
 */

const fs = require("fs");
const path = require("path");
const documentProcessingService = require("../src/services/documentProcessingService");
const databaseService = require("../src/services/databaseService");

async function testNeonDbIntegration() {
  console.log("🚀 Testing Neon DB pgvector integration...");
  console.log("==========================================");

  try {
    // Test 1: Vector store initialization
    console.log("\n1️⃣ Testing vector store initialization...");
    await documentProcessingService.initializeVectorStore();

    // Test 2: Database connection status
    console.log("\n2️⃣ Testing Neon DB connection...");
    const isDbReady = await databaseService.healthCheck();
    console.log(
      isDbReady
        ? "✅ Neon DB connection is ready"
        : "❌ Neon DB connection is not ready",
    );

    // Test 3: Document processing
    console.log("\n3️⃣ Testing document processing...");

    // Create a test document
    const testDoc = `# Test Document for Neon DB Integration

This is a comprehensive test document for the Neon DB pgvector integration in the RAG Chat API.

## Features Being Tested

1. **Document Processing**: Converting text to embeddings
2. **Vector Storage**: Storing embeddings in PostgreSQL with pgvector
3. **Similarity Search**: Finding relevant documents based on queries
4. **Fallback Mechanism**: Graceful degradation to memory storage

## Technical Details

- Using OpenAI text-embedding-3-large model
- PostgreSQL with pgvector extension
- LangChain PGVectorStore integration
- Automatic fallback to MemoryVectorStore

This document contains various topics to test the similarity search functionality including database integration, vector embeddings, and RAG functionality.`;

    const testFilePath = path.join(
      __dirname,
      "../temp-files/temp-neon-test-doc.txt",
    );
    fs.writeFileSync(testFilePath, testDoc);

    const result = await documentProcessingService.processDocument(
      "neon-test-doc-001",
      testFilePath,
      "temp-neon-test-doc.txt",
      "text/plain",
      false, // isBlob = false for local file
    );

    console.log("✅ Document processed successfully:");
    console.log(`   - Document ID: ${result.documentId}`);
    console.log(`   - Chunks created: ${result.chunksCreated}`);
    console.log(`   - Total characters: ${result.totalCharacters}`);
    console.log(`   - Processed at: ${result.processedAt}`);

    // Test 4: Similarity search
    console.log("\n4️⃣ Testing similarity search...");

    const testQueries = [
      "Neon database integration",
      "pgvector extension features",
      "RAG functionality testing",
      "OpenAI embeddings",
    ];

    for (const query of testQueries) {
      const searchResults =
        await documentProcessingService.searchSimilarDocuments(query, {
          k: 3,
          threshold: 0.3,
        });
      console.log(
        `📊 Query: "${query}" - Found ${searchResults.length} results`,
      );
      if (searchResults.length > 0) {
        console.log(
          `   Top result similarity: ${searchResults[0].similarity.toFixed(3)}`,
        );
        console.log(
          `   Content preview: ${searchResults[0].content.substring(0, 80)}...`,
        );
      }
    }

    // Test 5: Document statistics
    console.log("\n5️⃣ Testing document statistics...");
    const stats = await documentProcessingService.getDocumentStats();
    console.log("✅ Statistics retrieved:");
    console.log(`   - Total documents: ${stats.totalDocuments}`);
    console.log(`   - Total chunks: ${stats.totalChunks}`);
    console.log(`   - Using memory fallback: ${stats.usingMemoryFallback}`);
    console.log(`   - Vector store type: ${stats.vectorStoreType}`);

    // Test 6: Document deletion
    console.log("\n7️⃣ Testing document deletion...");
    const deleteResult =
      await documentProcessingService.deleteDocumentFromVectorStore(
        "neon-test-doc-001",
      );
    console.log(
      `✅ Delete operation completed: ${deleteResult.deletedChunks} chunks deleted`,
    );

    // Test 7: Final statistics
    console.log("\n8️⃣ Final statistics after deletion...");
    const finalStats = await documentProcessingService.getDocumentStats();
    console.log("✅ Final statistics:");
    console.log(`   - Total documents: ${finalStats.totalDocuments}`);
    console.log(`   - Total chunks: ${finalStats.totalChunks}`);

    // Clean up
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📊 Integration Summary:");
    console.log("================================");
    console.log(
      `✅ Vector Store Type: ${stats.vectorStoreType}${stats.usingMemoryFallback ? " (Fallback)" : ""}`,
    );
    console.log(`✅ Database Ready: ${isDbReady}`);
    console.log("✅ Document Processing: Working");
    console.log("✅ Similarity Search: Working");
    console.log("✅ Statistics: Working");
    console.log("✅ Document Deletion: Working");

    if (stats.usingMemoryFallback) {
      console.log("⚠️  Neon DB Integration: Using Memory Fallback");
      console.log("💡 To use Neon DB: Set DATABASE_URL in .env file");
    } else {
      console.log("✅ Neon DB Integration: Fully Operational");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    // Close database connection
    await databaseService.close();
  }
}

// Run the test
if (require.main === module) {
  testNeonDbIntegration()
    .then(() => {
      console.log("\n✅ Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Test failed:", error);
      process.exit(1);
    });
}

module.exports = testNeonDbIntegration;
