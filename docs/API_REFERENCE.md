# API Documentation

Complete API reference for the RAG Chat API.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.vercel.app/api`

## Authentication

Currently, the API does not require authentication. In production, consider implementing:

- API key authentication
- JWT token validation
- Rate limiting per user/IP

## Content Types

- **Request**: `application/json` or `multipart/form-data` (for file uploads)
- **Response**: `application/json`

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## HTTP Status Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid request data      |
| 401  | Unauthorized - Authentication required  |
| 403  | Forbidden - Access denied               |
| 404  | Not Found - Resource not found          |
| 413  | Payload Too Large - File too large      |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error    |

---

# Document Management

## Upload Document

Upload and process a document for RAG functionality.

### Request

```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

#### Form Data Parameters

| Parameter    | Type   | Required | Description                                         |
| ------------ | ------ | -------- | --------------------------------------------------- |
| `file`       | File   | Yes      | Document file (PDF, TXT)                            |
| `documentId` | String | No       | Custom document ID (auto-generated if not provided) |

#### File Constraints

- **Supported formats**: PDF, TXT
- **Maximum size**: 10MB
- **Text length**: Processed documents are chunked into segments

### Response

```json
{
  "success": true,
  "message": "Document uploaded and processed successfully",
  "data": {
    "documentId": "doc-1234567890",
    "filename": "example.pdf",
    "chunksCreated": 8,
    "totalCharacters": 4250,
    "processedAt": "2025-05-28T10:30:00.000Z",
    "blobUrl": "https://example.blob.vercel-storage.com/file.pdf"
  }
}
```

### Example

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@/path/to/document.pdf" \
  -F "documentId=my-custom-id"
```

### Error Cases

- **413**: File too large
- **400**: Unsupported file format
- **400**: Missing file
- **500**: Processing error

---

## Search Documents

Search through uploaded documents using vector similarity.

### Request

```http
POST /api/documents/search
Content-Type: application/json
```

#### JSON Parameters

| Parameter   | Type   | Required | Default | Description                            |
| ----------- | ------ | -------- | ------- | -------------------------------------- |
| `query`     | String | Yes      | -       | Search query text                      |
| `k`         | Number | No       | 3       | Number of results to return            |
| `threshold` | Number | No       | 0.0     | Minimum similarity threshold (0.0-1.0) |

### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "content": "This section discusses the main concepts...",
        "similarity": 0.8542,
        "metadata": {
          "documentId": "doc-1234567890",
          "filename": "example.pdf",
          "chunk": 2,
          "startIndex": 1024,
          "endIndex": 1524
        }
      },
      {
        "content": "Another relevant section about...",
        "similarity": 0.7823,
        "metadata": {
          "documentId": "doc-1234567890",
          "filename": "example.pdf",
          "chunk": 5,
          "startIndex": 2500,
          "endIndex": 3000
        }
      }
    ],
    "totalResults": 2,
    "query": "main concepts",
    "searchTime": "45ms"
  }
}
```

### Example

```bash
curl -X POST http://localhost:3000/api/documents/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the main features?",
    "k": 5,
    "threshold": 0.7
  }'
```

---

## Get Document Statistics

Retrieve statistics about processed documents and vector store.

### Request

```http
GET /api/documents/stats
```

### Response

```json
{
  "success": true,
  "data": {
    "totalDocuments": 12,
    "totalChunks": 89,
    "vectorStoreType": "PostgreSQL",
    "usingMemoryFallback": false,
    "averageChunkSize": 487,
    "totalCharacters": 43283,
    "lastProcessed": "2025-05-28T10:30:00.000Z"
  }
}
```

### Example

```bash
curl http://localhost:3000/api/documents/stats
```

---

## List All Documents

Get a list of all uploaded documents.

### Request

```http
GET /api/documents
```

#### Query Parameters

| Parameter | Type   | Required | Default     | Description           |
| --------- | ------ | -------- | ----------- | --------------------- |
| `page`    | Number | No       | 1           | Page number           |
| `limit`   | Number | No       | 20          | Items per page        |
| `sortBy`  | String | No       | 'createdAt' | Sort field            |
| `order`   | String | No       | 'desc'      | Sort order (asc/desc) |

### Response

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "documentId": "doc-1234567890",
        "filename": "example.pdf",
        "chunksCreated": 8,
        "totalCharacters": 4250,
        "processedAt": "2025-05-28T10:30:00.000Z",
        "blobUrl": "https://example.blob.vercel-storage.com/file.pdf"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Example

```bash
curl "http://localhost:3000/api/documents?page=1&limit=10"
```

---

## Get Specific Document

Retrieve information about a specific document.

### Request

```http
GET /api/documents/:id
```

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | String | Yes      | Document ID |

### Response

```json
{
  "success": true,
  "data": {
    "documentId": "doc-1234567890",
    "filename": "example.pdf",
    "chunksCreated": 8,
    "totalCharacters": 4250,
    "processedAt": "2025-05-28T10:30:00.000Z",
    "blobUrl": "https://example.blob.vercel-storage.com/file.pdf",
    "chunks": [
      {
        "chunkId": 1,
        "content": "First chunk of the document...",
        "startIndex": 0,
        "endIndex": 500
      }
    ]
  }
}
```

### Example

```bash
curl http://localhost:3000/api/documents/doc-1234567890
```

---

## Delete Document

Delete a document and all its associated chunks.

### Request

```http
DELETE /api/documents/:id
```

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | String | Yes      | Document ID |

### Response

```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": {
    "documentId": "doc-1234567890",
    "deletedChunks": 8,
    "deletedAt": "2025-05-28T11:00:00.000Z"
  }
}
```

### Example

```bash
curl -X DELETE http://localhost:3000/api/documents/doc-1234567890
```

---

# Chat

## Send RAG Message

Send a message with Retrieval-Augmented Generation (RAG) capabilities.

### Request

```http
POST /api/chat/rag
Content-Type: application/json
```

#### JSON Parameters

| Parameter     | Type   | Required | Default | Description                          |
| ------------- | ------ | -------- | ------- | ------------------------------------ |
| `message`     | String | Yes      | -       | User message/question                |
| `history`     | Array  | No       | []      | Conversation history                 |
| `k`           | Number | No       | 3       | Number of context chunks to retrieve |
| `temperature` | Number | No       | 0.7     | Response randomness (0.0-2.0)        |
| `maxTokens`   | Number | No       | 1000    | Maximum response tokens              |

#### History Format

```json
[
  {
    "role": "user",
    "content": "Previous user message"
  },
  {
    "role": "assistant",
    "content": "Previous assistant response"
  }
]
```

### Response

```json
{
  "success": true,
  "data": {
    "response": "Based on the uploaded documents, the main features include...",
    "sources": [
      {
        "documentId": "doc-1234567890",
        "filename": "example.pdf",
        "content": "Relevant context chunk...",
        "similarity": 0.8542,
        "chunkId": 2
      }
    ],
    "responseTime": "1250ms",
    "tokensUsed": 245,
    "model": "gpt-3.5-turbo"
  }
}
```

### Example

```bash
curl -X POST http://localhost:3000/api/chat/rag \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the key benefits mentioned in the documents?",
    "history": [
      {
        "role": "user",
        "content": "Hello"
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help you with the documents?"
      }
    ],
    "k": 5,
    "temperature": 0.5
  }'
```

---

## Send Regular Chat Message

Send a regular chat message without document context.

### Request

```http
POST /api/chat
Content-Type: application/json
```

#### JSON Parameters

| Parameter     | Type   | Required | Default | Description             |
| ------------- | ------ | -------- | ------- | ----------------------- |
| `message`     | String | Yes      | -       | User message            |
| `history`     | Array  | No       | []      | Conversation history    |
| `temperature` | Number | No       | 0.7     | Response randomness     |
| `maxTokens`   | Number | No       | 1000    | Maximum response tokens |

### Response

```json
{
  "success": true,
  "data": {
    "response": "I'm a helpful AI assistant. How can I help you today?",
    "responseTime": "850ms",
    "tokensUsed": 156,
    "model": "gpt-3.5-turbo"
  }
}
```

### Example

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "temperature": 0.8
  }'
```

---

## Get Chat Sessions

Get a list of chat sessions (placeholder endpoint).

### Request

```http
GET /api/chat
```

### Response

```json
{
  "success": true,
  "data": {
    "sessions": [],
    "message": "Chat sessions feature coming soon"
  }
}
```

---

## Get Specific Chat Session

Get details of a specific chat session (placeholder endpoint).

### Request

```http
GET /api/chat/:sessionId
```

### Response

```json
{
  "success": true,
  "data": {
    "sessionId": "session-123",
    "messages": [],
    "message": "Chat session details coming soon"
  }
}
```

---

## Delete Chat Session

Delete a chat session (placeholder endpoint).

### Request

```http
DELETE /api/chat/:sessionId
```

### Response

```json
{
  "success": true,
  "message": "Chat session deletion coming soon"
}
```

---

# Health Check

## API Health Check

Check if the API is running and healthy.

### Request

```http
GET /api/health
```

### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-05-28T10:30:00.000Z",
    "version": "1.0.0",
    "environment": "development",
    "services": {
      "database": "connected",
      "vectorStore": "ready",
      "blobStorage": "configured"
    }
  }
}
```

---

# Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window**: 15 minutes (configurable)
- **Limit**: 100 requests per window (configurable)
- **Headers**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "code": "RATE_LIMIT_EXCEEDED",
    "details": {
      "limit": 100,
      "window": "15 minutes",
      "resetTime": "2025-05-28T10:45:00.000Z"
    }
  }
}
```

---

# Error Codes

Common error codes returned by the API:

| Code                    | Description                      |
| ----------------------- | -------------------------------- |
| `VALIDATION_ERROR`      | Request validation failed        |
| `FILE_TOO_LARGE`        | Uploaded file exceeds size limit |
| `UNSUPPORTED_FILE_TYPE` | File type not supported          |
| `DOCUMENT_NOT_FOUND`    | Document ID not found            |
| `PROCESSING_ERROR`      | Error processing document        |
| `OPENAI_API_ERROR`      | OpenAI API error                 |
| `DATABASE_ERROR`        | Database connection/query error  |
| `RATE_LIMIT_EXCEEDED`   | Too many requests                |
| `INTERNAL_ERROR`        | Internal server error            |

---

# Examples

## Complete Workflow Example

### 1. Upload a Document

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@./example.pdf" \
  -F "documentId=example-doc"
```

### 2. Search for Relevant Content

```bash
curl -X POST http://localhost:3000/api/documents/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "main topics",
    "k": 3
  }'
```

### 3. Ask Questions with RAG

```bash
curl -X POST http://localhost:3000/api/chat/rag \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you summarize the main points from the document?",
    "k": 5
  }'
```

### 4. Check Statistics

```bash
curl http://localhost:3000/api/documents/stats
```

## JavaScript/Node.js Example

```javascript
const FormData = require("form-data");
const fs = require("fs");
const fetch = require("node-fetch");

// Upload document
const uploadDocument = async () => {
  const form = new FormData();
  form.append("file", fs.createReadStream("./document.pdf"));
  form.append("documentId", "my-doc");

  const response = await fetch("http://localhost:3000/api/documents/upload", {
    method: "POST",
    body: form,
  });

  return response.json();
};

// Search documents
const searchDocuments = async (query) => {
  const response = await fetch("http://localhost:3000/api/documents/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      k: 3,
      threshold: 0.7,
    }),
  });

  return response.json();
};

// RAG chat
const ragChat = async (message) => {
  const response = await fetch("http://localhost:3000/api/chat/rag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      k: 5,
      temperature: 0.7,
    }),
  });

  return response.json();
};
```

## Python Example

```python
import requests
import json

BASE_URL = "http://localhost:3000/api"

# Upload document
def upload_document(file_path, document_id=None):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'documentId': document_id} if document_id else {}

        response = requests.post(
            f"{BASE_URL}/documents/upload",
            files=files,
            data=data
        )

    return response.json()

# Search documents
def search_documents(query, k=3, threshold=0.0):
    data = {
        "query": query,
        "k": k,
        "threshold": threshold
    }

    response = requests.post(
        f"{BASE_URL}/documents/search",
        json=data
    )

    return response.json()

# RAG chat
def rag_chat(message, history=None, k=3):
    data = {
        "message": message,
        "history": history or [],
        "k": k
    }

    response = requests.post(
        f"{BASE_URL}/chat/rag",
        json=data
    )

    return response.json()

# Example usage
if __name__ == "__main__":
    # Upload a document
    upload_result = upload_document("document.pdf", "my-doc")
    print("Upload result:", upload_result)

    # Search for content
    search_result = search_documents("main topics", k=5)
    print("Search result:", search_result)

    # Ask questions
    chat_result = rag_chat("What are the key points?")
    print("Chat result:", chat_result)
```

---

This API documentation provides comprehensive information for integrating with the RAG Chat API. For additional examples and troubleshooting, refer to the main README.md file.
