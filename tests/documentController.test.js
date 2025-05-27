const request = require("supertest");
const path = require("path");
const fs = require("fs").promises;
const app = require("../src/app");

// Create a test file for upload testing
const createTestFile = async () => {
  const testContent = "This is a test document for upload testing.";
  const testFilePath = path.join(__dirname, "test-document.txt");
  await fs.writeFile(testFilePath, testContent);
  return testFilePath;
};

// Clean up test files
const cleanupTestFiles = async () => {
  try {
    const uploadsDir = path.join(__dirname, "../public/uploads");
    const files = await fs.readdir(uploadsDir);

    // Delete all test files
    await Promise.all(
      files.map((file) =>
        fs.unlink(path.join(uploadsDir, file)).catch(() => {}),
      ),
    );

    // Delete test file from tests directory
    await fs.unlink(path.join(__dirname, "test-document.txt")).catch(() => {});
  } catch (error) {
    // Ignore errors during cleanup
  }
};

describe("Document Controller", () => {
  let testFilePath;

  beforeEach(async () => {
    testFilePath = await createTestFile();
  });

  afterEach(async () => {
    await cleanupTestFiles();
  });

  describe("POST /api/documents/upload", () => {
    it("should upload a document successfully", async () => {
      const response = await request(app)
        .post("/api/documents/upload")
        .attach("document", testFilePath)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty(
        "originalName",
        "test-document.txt",
      );
      expect(response.body.data).toHaveProperty("mimetype", "text/plain");
      expect(response.body.data).toHaveProperty("path");
    });

    it("should return 400 when no file is uploaded", async () => {
      const response = await request(app)
        .post("/api/documents/upload")
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error.message).toContain("No file uploaded");
    });

    it("should return 400 for invalid file type", async () => {
      // Create a fake image file
      const invalidFilePath = path.join(__dirname, "test-image.jpg");
      await fs.writeFile(invalidFilePath, "fake image content");

      const response = await request(app)
        .post("/api/documents/upload")
        .attach("document", invalidFilePath)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error.message).toContain("Invalid file type");

      // Cleanup
      await fs.unlink(invalidFilePath);
    });
  });

  describe("GET /api/documents", () => {
    it("should return empty array when no documents", async () => {
      const response = await request(app).get("/api/documents").expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toEqual([]);
    });

    it("should return uploaded documents", async () => {
      // First upload a document
      await request(app)
        .post("/api/documents/upload")
        .attach("document", testFilePath);

      const response = await request(app).get("/api/documents").expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty("filename");
      expect(response.body.data[0]).toHaveProperty("size");
    });
  });

  describe("GET /api/documents/:id", () => {
    it("should return specific document info", async () => {
      // First upload a document
      const uploadResponse = await request(app)
        .post("/api/documents/upload")
        .attach("document", testFilePath);

      const documentId = uploadResponse.body.data.id;

      const response = await request(app)
        .get(`/api/documents/${documentId}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("id", documentId);
    });

    it("should return 404 for non-existent document", async () => {
      const response = await request(app)
        .get("/api/documents/nonexistent")
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error.message).toContain("Document not found");
    });
  });

  describe("DELETE /api/documents/:id", () => {
    it("should delete a document successfully", async () => {
      // First upload a document
      const uploadResponse = await request(app)
        .post("/api/documents/upload")
        .attach("document", testFilePath);

      const documentId = uploadResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/documents/${documentId}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("id", documentId);

      // Verify file is deleted
      const getResponse = await request(app)
        .get(`/api/documents/${documentId}`)
        .expect(404);
    });

    it("should return 404 when deleting non-existent document", async () => {
      const response = await request(app)
        .delete("/api/documents/nonexistent")
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error.message).toContain("Document not found");
    });
  });

  describe("GET /api/documents/:id/download", () => {
    it("should download a document successfully", async () => {
      // First upload a document
      const uploadResponse = await request(app)
        .post("/api/documents/upload")
        .attach("document", testFilePath);

      const documentId = uploadResponse.body.data.id;

      const response = await request(app)
        .get(`/api/documents/${documentId}/download`)
        .expect(200);

      expect(response.headers["content-disposition"]).toContain("attachment");
    });

    it("should return 404 for non-existent document download", async () => {
      const response = await request(app)
        .get("/api/documents/nonexistent/download")
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error.message).toContain("Document not found");
    });
  });
});
