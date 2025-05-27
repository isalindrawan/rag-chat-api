const fs = require("fs").promises;
const path = require("path");
const blobStorageService = require("../src/services/blobStorageService");
const documentProcessingService = require("../src/services/documentProcessingService");

async function testBlobIntegration() {
  console.log("🧪 Testing Blob Storage Integration");
  console.log("=====================================");

  // Check if blob storage is configured
  console.log("1. Checking blob storage configuration...");
  const isConfigured = blobStorageService.isConfigured();
  console.log(`   Blob storage configured: ${isConfigured}`);

  if (!isConfigured) {
    console.log(
      "❌ Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN",
    );
    return;
  }

  try {
    // Test 1: Upload a test file
    console.log("\n2. Testing file upload to blob storage...");
    const testContent = "This is a test document for blob storage integration.";
    const testBuffer = Buffer.from(testContent, "utf-8");

    const uploadResult = await blobStorageService.uploadFile(
      testBuffer,
      "test-integration.txt",
      "text/plain",
    );
    console.log("   ✅ Upload successful:", uploadResult.url);

    // Test 2: Download the file
    console.log("\n3. Testing file download from blob storage...");
    const downloadedBuffer = await blobStorageService.downloadFile(
      uploadResult.url,
    );
    const downloadedContent = downloadedBuffer.toString("utf-8");
    console.log(
      "   ✅ Download successful, content matches:",
      downloadedContent === testContent,
    );

    // Test 3: Process document with blob storage
    console.log("\n4. Testing document processing with blob storage...");
    const documentId = `test_${Date.now()}`;
    const processingResult = await documentProcessingService.processDocument(
      documentId,
      uploadResult.url,
      "test-integration.txt",
      "text/plain",
      true, // isBlob = true
    );
    console.log("   ✅ Document processing successful:", processingResult);

    // Test 4: Clean up - delete the test file
    console.log("\n5. Testing file deletion from blob storage...");
    await blobStorageService.deleteFile(uploadResult.url);
    console.log("   ✅ File deletion successful");

    console.log("\n🎉 All blob storage integration tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("   Stack trace:", error.stack);
  }
}

// Test with existing file
async function testExistingFile() {
  console.log("\n🧪 Testing with existing file");
  console.log("==============================");

  try {
    const testFilePath = path.join(__dirname, "test-doc.txt");
    const fileExists = await fs
      .access(testFilePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      console.log("❌ test-doc.txt not found, skipping existing file test");
      return;
    }

    const fileBuffer = await fs.readFile(testFilePath);
    console.log("📁 Found test file, size:", fileBuffer.length);

    if (blobStorageService.isConfigured()) {
      console.log("1. Uploading existing file to blob storage...");
      const uploadResult = await blobStorageService.uploadFile(
        fileBuffer,
        "test-doc.txt",
        "text/plain",
      );
      console.log("   ✅ Upload successful:", uploadResult.url);

      console.log("2. Processing uploaded file...");
      const documentId = `existing_test_${Date.now()}`;
      const processingResult = await documentProcessingService.processDocument(
        documentId,
        uploadResult.url,
        "test-doc.txt",
        "text/plain",
        true,
      );
      console.log("   ✅ Processing successful:", processingResult);

      // Clean up
      await blobStorageService.deleteFile(uploadResult.url);
      console.log("   ✅ Cleanup successful");
    }
  } catch (error) {
    console.error("❌ Existing file test failed:", error.message);
  }
}

// Run tests
async function runTests() {
  await testBlobIntegration();
  await testExistingFile();
}

runTests().catch(console.error);
