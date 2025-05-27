class Document {
  constructor(data) {
    this.id = data.id;
    this.originalName = data.originalName;
    this.filename = data.filename;
    this.mimetype = data.mimetype;
    this.size = data.size;
    this.path = data.path;
    this.uploadedAt = data.uploadedAt || new Date().toISOString();
    this.processedAt = data.processedAt || null;
    this.isProcessed = data.isProcessed || false;
    this.chunks = data.chunks || [];
    this.metadata = data.metadata || {};
  }

  // Mark document as processed for RAG
  markAsProcessed(chunks = []) {
    this.isProcessed = true;
    this.processedAt = new Date().toISOString();
    this.chunks = chunks;
  }

  // Add metadata to document
  addMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
  }

  // Get file extension
  getExtension() {
    return this.filename.split('.').pop().toLowerCase();
  }

  // Check if document is supported for RAG processing
  isSupportedForRAG() {
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'application/json',
    ];
    return supportedTypes.includes(this.mimetype);
  }

  // Convert to JSON representation
  toJSON() {
    return {
      id: this.id,
      originalName: this.originalName,
      filename: this.filename,
      mimetype: this.mimetype,
      size: this.size,
      path: this.path,
      uploadedAt: this.uploadedAt,
      processedAt: this.processedAt,
      isProcessed: this.isProcessed,
      chunks: this.chunks.length,
      metadata: this.metadata,
    };
  }
}

module.exports = Document;

