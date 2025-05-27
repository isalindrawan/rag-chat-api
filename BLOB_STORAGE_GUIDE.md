# Vercel Blob Storage Integration Guide

This document explains how the RAG Chat API integrates with Vercel Blob Storage for document uploads in production.

## Overview

The application now supports dual storage modes:

- **Local Storage**: For development (files stored in `public/uploads/`)
- **Blob Storage**: For production on Vercel (files stored in Vercel Blob Storage)

## Setup Instructions

### 1. Create Vercel Blob Storage

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to the **Storage** tab
4. Create a new **Blob** store
5. Copy the connection string/token

### 2. Environment Variables

Add these environment variables to your Vercel deployment:

```bash
# Required for blob storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx...
BLOB_STORE_NAME=rag-chat-api-blob
```

### 3. Local Development

For local development, you can optionally set the blob storage token to test the integration:

```bash
# .env (optional for local development)
BLOB_READ_WRITE_TOKEN=your_token_here
BLOB_STORE_NAME=rag-chat-api-blob-dev
```

If not set, the application will automatically use local file storage.

## How It Works

### Upload Flow

1. **File Upload**: User uploads file via `/api/documents/upload`
2. **Memory Processing**: Multer processes file into memory (not disk)
3. **Storage Decision**:
   - If `BLOB_READ_WRITE_TOKEN` exists → Upload to Vercel Blob Storage
   - Otherwise → Save to local `public/uploads/` directory
4. **Document Processing**: Extract text and create embeddings
5. **Storage Metadata**: Store file info with storage type (`blob` or `local`)

### File Access

- **Blob Files**: Downloaded via blob URL for processing and user downloads
- **Local Files**: Accessed directly from filesystem

### Cleanup

- **Blob Files**: Deleted from Vercel Blob Storage when document is deleted
- **Local Files**: Deleted from local filesystem when document is deleted

## Code Architecture

### Key Components

1. **`blobStorageService.js`**: Handles all Vercel Blob Storage operations

   - `uploadFile()`: Upload file buffer to blob storage
   - `downloadFile()`: Download file from blob storage
   - `deleteFile()`: Delete file from blob storage
   - `getFileMetadata()`: Get file metadata
   - `isConfigured()`: Check if blob storage is properly configured

2. **`uploadMiddleware.js`**: Enhanced upload middleware

   - Uses memory storage instead of disk storage
   - Includes `uploadToBlob` middleware for blob upload
   - Automatically detects and uses appropriate storage

3. **`documentProcessingService.js`**: Updated for dual storage support

   - `extractTextFromFile()`: Handles both blob URLs and local file paths
   - `processDocument()`: Enhanced with `isBlob` parameter

4. **`documentStore.js`**: In-memory document metadata storage

   - Tracks storage type for each document
   - Handles deletion from appropriate storage

5. **`documentController.js`**: Updated controller logic
   - Determines storage type based on blob URL presence
   - Handles downloads from appropriate storage
   - Manages deletion from appropriate storage

### Storage Type Detection

The application automatically detects storage type:

```javascript
// In uploadMiddleware.js
const uploadToBlob = async (req, res, next) => {
  if (blobStorageService.isConfigured()) {
    // Upload to blob storage
    const blobResult = await blobStorageService.uploadFile(/*...*/);
    req.file.blobUrl = blobResult.url;
  }
  // Otherwise, continues with local storage
};

// In documentController.js
const isBlob = !!file.blobUrl;
const storageType = isBlob ? "blob" : "local";
```

## API Response Format

Document objects now include storage information:

```json
{
  "id": "doc_1703123456789",
  "originalName": "example.pdf",
  "filename": "1703123456789-example.pdf",
  "mimetype": "application/pdf",
  "size": 245760,
  "path": "https://blob-url.vercel-storage.com/...",
  "storageType": "blob",
  "uploadedAt": "2024-12-21T10:30:00.000Z",
  "processed": true,
  "processing": {
    "documentId": "doc_1703123456789",
    "chunksCreated": 15,
    "totalCharacters": 3542,
    "processedAt": "2024-12-21T10:30:01.000Z"
  }
}
```

## File Size Limits

- **Upload Limit**: 10MB per file (configurable in upload middleware)
- **Vercel Blob**: Up to 500MB per file (platform limit)
- **Multiple Files**: Up to 5 files per request

## Error Handling

The service includes comprehensive error handling:

1. **Configuration Errors**: Warns if blob storage not configured
2. **Upload Errors**: Graceful fallback to local storage if blob upload fails
3. **Download Errors**: Detailed error messages for debugging
4. **Deletion Errors**: Continues with metadata cleanup even if file deletion fails

## Monitoring and Debugging

### Logs to Watch

```bash
# Blob storage configuration
BLOB_READ_WRITE_TOKEN not found. Blob storage will not work.

# Successful blob operations
File uploaded to blob storage: https://blob-url...
Deleted file from blob storage: https://blob-url...

# Fallback operations
Blob storage not configured, skipping blob upload
```

### Storage Statistics

Get storage statistics via `/api/documents/stats`:

```json
{
  "vectorStore": {
    "totalDocuments": 5,
    "totalChunks": 87
  },
  "storage": {
    "total": 5,
    "blob": 3,
    "local": 2,
    "totalSize": 1245760,
    "blobSize": 845760,
    "localSize": 400000
  }
}
```

## Production Checklist

- [ ] Vercel Blob Storage created
- [ ] `BLOB_READ_WRITE_TOKEN` environment variable set
- [ ] `BLOB_STORE_NAME` environment variable set (optional)
- [ ] File upload endpoint tested
- [ ] Document processing working with blob files
- [ ] File download working from blob storage
- [ ] File deletion working from blob storage

## Troubleshooting

### Common Issues

1. **"Blob storage not configured"**

   - Ensure `BLOB_READ_WRITE_TOKEN` is set
   - Check Vercel environment variables

2. **"Failed to upload file to blob storage"**

   - Verify blob token has write permissions
   - Check file size limits
   - Review Vercel logs for detailed errors

3. **"Failed to download file"**

   - Verify blob URL is still valid
   - Check if file was deleted from blob storage
   - Ensure blob token has read permissions

4. **Files not being processed**
   - Check if `extractTextFromFile` is receiving correct parameters
   - Verify `isBlob` parameter is being passed correctly
   - Review document processing service logs

### Development vs Production

| Feature     | Development           | Production              |
| ----------- | --------------------- | ----------------------- |
| Storage     | Local files           | Vercel Blob Storage     |
| File Path   | `/uploads/filename`   | Blob URL                |
| Cleanup     | Manual file deletion  | Automatic blob deletion |
| Scalability | Limited by disk space | Virtually unlimited     |
| Performance | Fast local access     | Network-dependent       |

## Migration Notes

If migrating from local storage to blob storage:

1. Existing local files will continue to work
2. New uploads will use blob storage (if configured)
3. Mixed storage types are supported
4. No data migration required for existing documents
