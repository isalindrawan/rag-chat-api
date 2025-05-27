#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const BASE_URL = "http://localhost:3000";

async function testRAGFunctionality() {
  console.log("🚀 Starting RAG Functionality Test\n");

  try {
    // 1. Start the server (assuming it's running)
    console.log("📡 Testing server health...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Server is healthy:", healthResponse.data.status);

    // 2. Create a test document
    console.log("\n📄 Creating test document...");
    const testContent = `
RAG (Retrieval-Augmented Generation) Technology Overview

RAG is a powerful AI technique that combines the strengths of pre-trained language models with external knowledge retrieval. This approach enhances the model's ability to provide accurate, up-to-date, and contextually relevant responses.

Key Components:
1. Knowledge Base: A collection of documents, articles, or data sources
2. Retrieval System: Searches for relevant information based on user queries
3. Generation Model: Creates responses using both retrieved context and model knowledge

Benefits of RAG:
- Improved accuracy through access to specific domain knowledge
- Reduced hallucinations by grounding responses in factual data
- Dynamic knowledge updates without retraining the model
- Better handling of specialized or recent information

Use Cases:
- Customer support systems with access to product documentation
- Research assistants with scientific paper databases
- Legal advisors with case law repositories
- Medical diagnosis support with clinical literature
    `;

    const testDocPath = path.join(__dirname, "test-rag-document.txt");
    fs.writeFileSync(testDocPath, testContent);

    // 3. Upload the document
    console.log("📤 Uploading test document...");
    const form = new FormData();
    form.append("document", fs.createReadStream(testDocPath));

    const uploadResponse = await axios.post(
      `${BASE_URL}/api/documents/upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      },
    );

    console.log(
      "✅ Document uploaded successfully:",
      uploadResponse.data.data.originalName,
    );
    const documentId = uploadResponse.data.data.id;

    // 4. Wait a moment for processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 5. Test document search
    console.log("\n🔍 Testing document search...");
    const searchResponse = await axios.post(
      `${BASE_URL}/api/documents/search`,
      {
        query: "What are the benefits of RAG?",
        k: 3,
      },
    );

    console.log(
      "✅ Document search results:",
      searchResponse.data.data.length,
      "chunks found",
    );
    if (searchResponse.data.data.length > 0) {
      console.log(
        "📝 First result preview:",
        searchResponse.data.data[0].content.substring(0, 100) + "...",
      );
    }

    // 6. Test regular chat (without RAG)
    console.log("\n💬 Testing regular chat...");
    const regularChatResponse = await axios.post(`${BASE_URL}/api/chat`, {
      message: "What are the main benefits of RAG technology?",
      sessionId: "test-session-regular",
    });

    console.log("✅ Regular chat response:");
    console.log(
      "Response:",
      regularChatResponse.data.data.aiResponse.substring(0, 200) + "...",
    );
    console.log("RAG Enabled:", regularChatResponse.data.data.ragEnabled);

    // 7. Test RAG-enabled chat
    console.log("\n🧠 Testing RAG-enabled chat...");
    const ragChatResponse = await axios.post(`${BASE_URL}/api/chat/rag`, {
      message: "What are the main benefits of RAG technology?",
      sessionId: "test-session-rag",
    });

    console.log("✅ RAG chat response:");
    console.log(
      "Response:",
      ragChatResponse.data.data.aiResponse.substring(0, 200) + "...",
    );
    console.log("RAG Enabled:", ragChatResponse.data.data.ragEnabled);
    console.log(
      "Context Info:",
      ragChatResponse.data.data.contextInfo || "No context info",
    );

    // 8. Test with useRAG parameter
    console.log("\n🔧 Testing chat with useRAG parameter...");
    const ragParamResponse = await axios.post(`${BASE_URL}/api/chat`, {
      message: "Can you explain the key components of RAG?",
      sessionId: "test-session-param",
      useRAG: true,
    });

    console.log("✅ RAG parameter response:");
    console.log(
      "Response:",
      ragParamResponse.data.data.aiResponse.substring(0, 200) + "...",
    );
    console.log("RAG Enabled:", ragParamResponse.data.data.ragEnabled);
    console.log(
      "Context Info:",
      ragParamResponse.data.data.contextInfo || "No context info",
    );

    // 9. Get document stats
    console.log("\n📊 Getting document statistics...");
    const statsResponse = await axios.get(`${BASE_URL}/api/documents/stats`);
    console.log("✅ Document stats:", statsResponse.data.data);

    // 10. Clean up
    console.log("\n🧹 Cleaning up...");
    await axios.delete(`${BASE_URL}/api/documents/${documentId}`);
    fs.unlinkSync(testDocPath);
    console.log("✅ Test document deleted");

    console.log("\n🎉 RAG Functionality Test Completed Successfully!");
    console.log("\n📋 Summary:");
    console.log("- Document upload and processing: ✅");
    console.log("- Vector search functionality: ✅");
    console.log("- Regular chat endpoint: ✅");
    console.log("- RAG-enabled chat endpoint: ✅");
    console.log("- RAG parameter support: ✅");
    console.log("- Document statistics: ✅");
    console.log("- Cleanup operations: ✅");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  }
}

// Check if server is supposed to be running
if (process.argv.includes("--start-server")) {
  console.log("🚀 Starting server first...");
  const { spawn } = require("child_process");
  const server = spawn("npm", ["start"], { stdio: "inherit" });

  // Wait for server to start
  setTimeout(() => {
    testRAGFunctionality();
  }, 3000);
} else {
  testRAGFunctionality();
}
