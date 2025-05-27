const { put, del, head } = require("@vercel/blob");
const path = require("path");
const config = require("../config/config");

class BlobStorageService {
  constructor() {
    this.blobStoreName = config.blobStorage.storeName;

    // Verify blob token is available
    if (!config.blobStorage.token) {
      console.warn(
        "BLOB_READ_WRITE_TOKEN not found. Blob storage will not work.",
      );
    }
  }

  /**
   * Upload a file to Vercel Blob Storage
   * @param {Buffer} fileBuffer - File content as buffer
   * @param {string} filename - Original filename
   * @param {string} contentType - MIME type of the file
   * @returns {Promise<Object>} Upload result with URL and metadata
   */
  async uploadFile(fileBuffer, filename, contentType) {
    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const extension = path.extname(filename);
      const baseName = path.basename(filename, extension);
      const uniqueFilename = `${timestamp}-${baseName}${extension}`;

      // Upload to Vercel Blob
      const blob = await put(uniqueFilename, fileBuffer, {
        access: "public",
        contentType,
        addRandomSuffix: false,
      });

      return {
        url: blob.url,
        filename: uniqueFilename,
        originalName: filename,
        size: fileBuffer.length,
        contentType,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error uploading file to blob storage:", error);
      throw new Error(
        `Failed to upload file to blob storage: ${error.message}`,
      );
    }
  }

  /**
   * Download a file from Vercel Blob Storage
   * @param {string} blobUrl - URL of the blob to download
   * @returns {Promise<Buffer>} File content as buffer
   */
  async downloadFile(blobUrl) {
    try {
      console.log("Attempting to download file from blob storage:", blobUrl);

      const response = await fetch(blobUrl);
      if (!response.ok) {
        console.error(
          "Blob download failed:",
          response.status,
          response.statusText,
        );
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(
        "Successfully downloaded file from blob storage, size:",
        buffer.length,
      );
      return buffer;
    } catch (error) {
      console.error("Error downloading file from blob storage:", error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete a file from Vercel Blob Storage
   * @param {string} blobUrl - URL of the blob to delete
   * @returns {Promise<void>}
   */
  async deleteFile(blobUrl) {
    try {
      await del(blobUrl);
      console.log(`Successfully deleted file from blob storage: ${blobUrl}`);
    } catch (error) {
      console.error("Error deleting file from blob storage:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file metadata from Vercel Blob Storage
   * @param {string} blobUrl - URL of the blob
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(blobUrl) {
    try {
      const metadata = await head(blobUrl);
      return {
        size: metadata.size,
        contentType: metadata.contentType,
        cacheControl: metadata.cacheControl,
        uploadedAt: metadata.uploadedAt,
      };
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Check if blob storage is configured properly
   * @returns {boolean}
   */
  isConfigured() {
    return config.blobStorage.enabled;
  }
}

module.exports = new BlobStorageService();
