# Blob Storage Issue Fix - Deployment Guide

## Problem Summary

The error you encountered was:

```
"processingError": "Failed to process document: Failed to extract text from file: ENOENT: no such file or directory, open '/var/task/public/uploads/Mining Text Data (Charu Aggarwal - Springer)-1748318780000-27525917.pdf'"
```

This error occurred because the system was trying to read files from the local filesystem (`/var/task/public/uploads/`) even when files were stored in Vercel Blob Storage.

## Root Cause

1. **Environment Variable Loading**: The `dotenv` package wasn't properly loading environment variables
2. **File Source Logic**: The system wasn't correctly determining whether to use blob URLs or local file paths
3. **Production Safety**: No specific handling for Vercel serverless environment

## Fixes Applied

### 1. Environment Variable Loading

**File**: `src/config/config.js`

```javascript
// Added at the top
require("dotenv").config();
```

### 2. Enhanced Upload Middleware

**File**: `src/middleware/uploadMiddleware.js`

- Added explicit storage type marking (`"blob"` or `"local"`)
- Added fallback mechanism if blob upload fails
- Enhanced logging for debugging
- Added verification that blob upload was successful

### 3. Improved Document Controller

**File**: `src/controllers/documentController.js`

- Enhanced storage type detection
- Added Vercel-specific safety checks
- Improved file source determination logic
- Added comprehensive debugging logs

### 4. Production Safety Checks

- If running in Vercel environment (`process.env.VERCEL`) and blob storage is configured, but no `blobUrl` is present, the system will fail fast with a clear error
- Fallback to local storage only happens in development or when blob storage is not configured

## Deployment Steps

### 1. Environment Variables

Ensure these are set in your Vercel project:

```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
BLOB_STORE_NAME=rag-chat-api-blob
OPENAI_API_KEY=your_openai_key
NODE_ENV=production
```

### 2. Deploy to Vercel

```bash
npm run deploy
```

### 3. Test the Deployment

After deployment, test with:

```bash
curl -X POST https://your-vercel-url.vercel.app/api/documents/upload \
  -F "document=@your-test-file.pdf"
```

## Expected Behavior

### ✅ Working (After Fix)

1. **Local Development**: Uses blob storage if configured, falls back to local storage
2. **Vercel Production**: Always uses blob storage, fails fast if blob storage not working
3. **File Processing**: Correctly downloads from blob URLs for text extraction
4. **Error Handling**: Clear error messages for debugging

### ❌ Previous Behavior (Before Fix)

1. Files uploaded to blob storage but system tried to read from local paths
2. Environment variables not loaded properly
3. No Vercel-specific handling
4. Silent fallback issues

## Key Code Changes

### Storage Type Detection

```javascript
// Enhanced logic to determine storage type
const storageType = file.storageType || (file.blobUrl ? "blob" : "local");
const isBlob = storageType === "blob";

// Vercel-specific safety check
if (process.env.VERCEL && blobStorageService.isConfigured()) {
  if (!file.blobUrl) {
    throw new Error(
      "Storage error: File upload to blob storage failed in serverless environment",
    );
  }
  fileSource = file.blobUrl;
}
```

### File Source Determination

```javascript
// Always use blob URL in production if available
let fileSource;
if (isBlob && file.blobUrl) {
  fileSource = file.blobUrl;
} else {
  fileSource =
    file.path || path.join(__dirname, "../../public/uploads", file.filename);
}
```

## Testing

### Local Testing

```bash
# Start development server
npm run dev

# Test upload
curl -X POST http://localhost:3000/api/documents/upload -F "document=@test-file.pdf"
```

### Production Testing

After deployment, the API should:

1. ✅ Upload files to Vercel Blob Storage
2. ✅ Process documents by downloading from blob URLs
3. ✅ Return proper storage type ("blob")
4. ✅ Create vector embeddings successfully

## Monitoring

Check the Vercel function logs for:

- File upload confirmations: "File uploaded to blob storage: [URL]"
- Storage type logs: "Final file source determination: {...}"
- Processing logs: "Downloading from blob storage: [URL]"

## Troubleshooting

If you still see the ENOENT error:

1. Check that `BLOB_READ_WRITE_TOKEN` is set in Vercel environment
2. Verify the logs show "Blob configured: true"
3. Ensure file uploads show `"storageType": "blob"` in the response
4. Check that `fileSource` in logs shows a blob URL, not a local path

The fixes should completely resolve the blob storage integration issue you were experiencing in production.
