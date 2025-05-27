const FormData = require("form-data");
const fs = require("fs");
const fetch = require("node-fetch");

async function testDocumentUpload() {
  console.log("🧪 Testing document upload to identify the issue");
  console.log("=================================================");

  try {
    // Test uploading a file
    const form = new FormData();
    form.append("document", fs.createReadStream("./test-doc.txt"));

    console.log("1. Uploading document to API...");
    const response = await fetch("http://localhost:3000/api/documents/upload", {
      method: "POST",
      body: form,
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Upload successful!");
      console.log("Storage type:", result.data.storageType);
      console.log("File path:", result.data.path);
      console.log("Processing result:", result.data.processed);

      if (result.data.processingError) {
        console.log("❌ Processing error:", result.data.processingError);
      }
    } else {
      console.log("❌ Upload failed:", result);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testDocumentUpload().catch(console.error);
