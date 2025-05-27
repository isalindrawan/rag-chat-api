const fs = require("fs").promises;
const path = require("path");
const blobStorageService = require("./blobStorageService");

class DocumentStore {
  constructor() {
    this.documents = new Map();
  }

  /**
   * Add a document to the store
   * @param {Object} documentInfo - Document metadata
   */
  addDocument(documentInfo) {
    this.documents.set(documentInfo.id, documentInfo);
    console.log(`Document added to store: ${documentInfo.id}`);
  }

  /**
   * Get a document by ID
   * @param {string} documentId - Document ID
   * @returns {Object|null} Document info or null if not found
   */
  getDocument(documentId) {
    return this.documents.get(documentId) || null;
  }

  /**
   * Get all documents
   * @returns {Array} Array of all documents
   */
  getAllDocuments() {
    return Array.from(this.documents.values());
  }

  /**
   * Update document metadata
   * @param {string} documentId - Document ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated document or null if not found
   */
  updateDocument(documentId, updates) {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    const updatedDocument = { ...document, ...updates };
    this.documents.set(documentId, updatedDocument);
    return updatedDocument;
  }

  /**
   * Delete a document and its associated file
   * @param {string} documentId - Document ID
   * @returns {Object} Deleted document info
   * @throws {Error} If document not found
   */
  async deleteDocumentWithFile(documentId) {
    const document = this.documents.get(documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    try {
      // Delete from appropriate storage
      if (document.storageType === "blob") {
        // Delete from Vercel Blob Storage
        if (blobStorageService.isConfigured()) {
          await blobStorageService.deleteFile(document.path);
          console.log(`Deleted file from blob storage: ${document.path}`);
        } else {
          console.warn("Blob storage not configured, cannot delete blob file");
        }
      } else {
        // Delete from local storage
        const filePath = path.join(
          __dirname,
          "../../public/uploads",
          document.filename,
        );

        try {
          await fs.unlink(filePath);
          console.log(`Deleted local file: ${filePath}`);
        } catch (error) {
          console.warn(`Failed to delete local file: ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`Error deleting file for document ${documentId}:`, error);
      // Continue with document removal even if file deletion fails
    }

    // Remove from document store
    this.documents.delete(documentId);
    console.log(`Document removed from store: ${documentId}`);

    return document;
  }

  /**
   * Delete a document without deleting the file
   * @param {string} documentId - Document ID
   * @returns {Object|null} Deleted document info or null if not found
   */
  deleteDocument(documentId) {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    this.documents.delete(documentId);
    console.log(`Document removed from store: ${documentId}`);
    return document;
  }

  /**
   * Check if a document exists
   * @param {string} documentId - Document ID
   * @returns {boolean} True if document exists
   */
  hasDocument(documentId) {
    return this.documents.has(documentId);
  }

  /**
   * Get documents by storage type
   * @param {string} storageType - Storage type ('blob' or 'local')
   * @returns {Array} Array of documents with specified storage type
   */
  getDocumentsByStorageType(storageType) {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.storageType === storageType,
    );
  }

  /**
   * Get storage statistics
   * @returns {Object} Storage statistics
   */
  getStorageStats() {
    const allDocs = Array.from(this.documents.values());
    const blobDocs = allDocs.filter((doc) => doc.storageType === "blob");
    const localDocs = allDocs.filter((doc) => doc.storageType === "local");

    return {
      total: allDocs.length,
      blob: blobDocs.length,
      local: localDocs.length,
      totalSize: allDocs.reduce((sum, doc) => sum + (doc.size || 0), 0),
      blobSize: blobDocs.reduce((sum, doc) => sum + (doc.size || 0), 0),
      localSize: localDocs.reduce((sum, doc) => sum + (doc.size || 0), 0),
    };
  }

  /**
   * Clear all documents from store (for testing)
   */
  clear() {
    this.documents.clear();
    console.log("Document store cleared");
  }
}

module.exports = new DocumentStore();
