# Document Upload and Management API

## Overview

The RAG Chat API includes comprehensive document management functionality that allows you to upload, store, and manage documents for Retrieval-Augmented Generation (RAG) processing.

## Features

- ✅ **File Upload**: Upload documents with validation and security
- ✅ **File Storage**: Secure storage in the `public/uploads` directory
- ✅ **File Management**: List, retrieve, and delete uploaded documents
- ✅ **Static Serving**: Direct access to uploaded files via URL
- ✅ **File Download**: Download documents with proper headers
- ✅ **Type Validation**: Support for various document formats
- ✅ **Size Limits**: 10MB maximum file size
- ✅ **Error Handling**: Comprehensive error responses

## Supported File Types

The API accepts the following document types:

- **PDF**: `application/pdf`
- **Word Documents**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Text Files**: `text/plain`, `text/markdown`
- **Spreadsheets**: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Data Files**: `text/csv`, `application/json`

## API Endpoints

### 1. Upload Document

**Endpoint:** `POST /api/documents/upload`

**Content-Type:** `multipart/form-data`

**Parameters:**

- `document` (file, required): The document file to upload

**Example:**

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "document=@example.pdf"
```

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "1748308541018_6kzy46q6r",
    "originalName": "example.pdf",
    "filename": "1748308541018_6kzy46q6r.pdf",
    "mimetype": "application/pdf",
    "size": 125436,
    "path": "/uploads/1748308541018_6kzy46q6r.pdf",
    "uploadedAt": "2025-05-27T01:15:41.020Z"
  },
  "timestamp": "2025-05-27T01:15:41.020Z"
}
```

### 2. List All Documents

**Endpoint:** `GET /api/documents`

**Example:**

```bash
curl -X GET http://localhost:3000/api/documents
```

**Response:**

```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": [
    {
      "id": "1748308541018_6kzy46q6r",
      "filename": "1748308541018_6kzy46q6r.pdf",
      "originalName": "example.pdf",
      "path": "/uploads/1748308541018_6kzy46q6r.pdf",
      "size": 125436,
      "uploadedAt": "2025-05-27T01:15:41.020Z"
    }
  ],
  "timestamp": "2025-05-27T01:16:08.545Z"
}
```

### 3. Get Document Information

**Endpoint:** `GET /api/documents/:id`

**Parameters:**

- `id` (string, required): The document ID

**Example:**

```bash
curl -X GET http://localhost:3000/api/documents/1748308541018_6kzy46q6r
```

**Response:**

```json
{
  "success": true,
  "message": "Document retrieved successfully",
  "data": {
    "id": "1748308541018_6kzy46q6r",
    "filename": "1748308541018_6kzy46q6r.pdf",
    "originalName": "example.pdf",
    "path": "/uploads/1748308541018_6kzy46q6r.pdf",
    "size": 125436,
    "uploadedAt": "2025-05-27T01:15:41.020Z"
  },
  "timestamp": "2025-05-27T01:16:08.545Z"
}
```

### 4. Download Document

**Endpoint:** `GET /api/documents/:id/download`

**Parameters:**

- `id` (string, required): The document ID

**Example:**

```bash
curl -X GET http://localhost:3000/api/documents/1748308541018_6kzy46q6r/download
```

**Response:** Binary file content with appropriate download headers

### 5. Delete Document

**Endpoint:** `DELETE /api/documents/:id`

**Parameters:**

- `id` (string, required): The document ID

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/documents/1748308541018_6kzy46q6r
```

**Response:**

```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": {
    "id": "1748308541018_6kzy46q6r",
    "filename": "1748308541018_6kzy46q6r.pdf"
  },
  "timestamp": "2025-05-27T01:20:15.123Z"
}
```

### 6. Direct File Access (Static Route)

**Endpoint:** `GET /uploads/:filename`

**Parameters:**

- `filename` (string, required): The actual filename of the uploaded document

**Example:**

```bash
curl -X GET http://localhost:3000/uploads/1748308541018_6kzy46q6r.pdf
```

**Response:** Binary file content

## Error Responses

### File Not Uploaded

```json
{
  "error": {
    "message": "No file uploaded",
    "status": 400
  }
}
```

### Invalid File Type

```json
{
  "error": {
    "message": "Invalid file type. Only documents are allowed.",
    "status": 400
  }
}
```

### File Too Large

```json
{
  "error": {
    "message": "File size too large. Maximum size is 10MB.",
    "status": 400
  }
}
```

### Document Not Found

```json
{
  "error": {
    "message": "Document not found",
    "status": 404
  }
}
```

## File Storage Structure

Uploaded files are stored in the `public/uploads/` directory with the following naming convention:

```
{timestamp}_{randomId}.{originalExtension}
```

Example: `1748308541018_6kzy46q6r.pdf`

## Security Features

- **File Type Validation**: Only allowed document types can be uploaded
- **File Size Limits**: Maximum 10MB per file
- **Unique Filenames**: Prevents conflicts and overwrites
- **Path Traversal Protection**: Files are contained within the uploads directory
- **MIME Type Checking**: Validates actual file content, not just extension

## Integration with RAG

The document upload system is designed to integrate seamlessly with RAG processing:

1. **Upload Documents**: Store knowledge base documents
2. **Process Documents**: Extract text and create embeddings (future enhancement)
3. **Vector Storage**: Store document embeddings for similarity search (future enhancement)
4. **Context Retrieval**: Use uploaded documents to provide context for chat responses

## Frontend Integration

### HTML Form Example

```html
<form
  action="/api/documents/upload"
  method="post"
  enctype="multipart/form-data">
  <input
    type="file"
    name="document"
    accept=".pdf,.doc,.docx,.txt,.md,.csv,.json"
    required />
  <button type="submit">Upload Document</button>
</form>
```

### JavaScript/Fetch Example

```javascript
const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log("Document uploaded:", result.data);
    } else {
      console.error("Upload failed:", result.error);
    }
  } catch (error) {
    console.error("Upload error:", error);
  }
};
```

## Testing

The document upload functionality includes comprehensive tests:

- Upload validation
- File type checking
- Size limit enforcement
- CRUD operations
- Error handling
- File storage verification

Run tests with:

```bash
npm test
```

## Future Enhancements

- [ ] **Document Processing**: Automatic text extraction from PDFs and Word documents
- [ ] **Vector Embeddings**: Generate embeddings for document chunks
- [ ] **Database Integration**: Store document metadata in database
- [ ] **OCR Support**: Extract text from images and scanned documents
- [ ] **Batch Upload**: Support multiple file uploads
- [ ] **Document Versioning**: Track document versions and changes
- [ ] **Access Control**: User-based document permissions
- [ ] **Document Search**: Full-text search across uploaded documents
