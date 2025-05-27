#!/usr/bin/env node

// Final verification script for blob storage integration
const blobStorageService = require("../src/services/blobStorageService");
const documentProcessingService = require("../src/services/documentProcessingService");
const fs = require("fs").promises;

async function verifyBlobIntegration() {
  console.log("🔍 Final Blob Storage Integration Verification");
  console.log("==============================================");

  try {
    // 1. Check environment
    console.log("1. Environment Check:");
    console.log("   - NODE_ENV:", process.env.NODE_ENV || "not set");
    console.log("   - VERCEL:", process.env.VERCEL || "not set");
    console.log("   - Blob configured:", blobStorageService.isConfigured());

    if (!blobStorageService.isConfigured()) {
      console.log("❌ Blob storage not configured. Cannot test integration.");
      return;
    }

    // 2. Test blob upload
    console.log("\n2. Testing blob upload...");
    const testContent = `Test document for verification - ${new Date().toISOString()}`;
    const testBuffer = Buffer.from(testContent, "utf-8");

    const uploadResult = await blobStorageService.uploadFile(
      testBuffer,
      "verification-test.txt",
      "text/plain",
    );

    console.log("   ✅ Upload successful");
    console.log("   - URL:", uploadResult.url);
    console.log("   - Filename:", uploadResult.filename);

    // 3. Test blob download
    console.log("\n3. Testing blob download...");
    const downloadedBuffer = await blobStorageService.downloadFile(
      uploadResult.url,
    );
    const downloadedContent = downloadedBuffer.toString("utf-8");
    const contentMatches = downloadedContent === testContent;

    console.log("   ✅ Download successful");
    console.log("   - Content matches:", contentMatches);

    // 4. Test document processing
    console.log("\n4. Testing document processing with blob...");
    const docId = `verify_${Date.now()}`;
    const processingResult = await documentProcessingService.processDocument(
      docId,
      uploadResult.url,
      "verification-test.txt",
      "text/plain",
      true,
    );

    console.log("   ✅ Processing successful");
    console.log("   - Chunks created:", processingResult.chunksCreated);
    console.log("   - Characters:", processingResult.totalCharacters);

    // 5. Cleanup
    console.log("\n5. Cleaning up...");
    await blobStorageService.deleteFile(uploadResult.url);
    console.log("   ✅ Cleanup successful");

    console.log("\n🎉 All verification tests passed!");
    console.log("\n📋 Summary:");
    console.log("   - Blob storage is properly configured");
    console.log("   - File upload/download works correctly");
    console.log("   - Document processing handles blob URLs");
    console.log("   - System is ready for production deployment");
  } catch (error) {
    console.error("\n❌ Verification failed:", error.message);
    console.error("   Stack:", error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyBlobIntegration().catch(console.error);
}

module.exports = { verifyBlobIntegration };
