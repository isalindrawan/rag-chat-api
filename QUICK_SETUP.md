# Quick Setup Guide

Get your RAG Chat API up and running in 5 minutes!

## 🚀 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- OpenAI API key

## ⚡ Quick Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd rag-chat-api
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Required Environment Variables:**

```env
# OpenAI API Key (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database URL (Required)
DATABASE_URL=postgresql://username:password@host:5432/database

# Optional: Blob Storage
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### 3. Database Setup

**Option A: Neon Database (Recommended)**

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy connection string to `DATABASE_URL`
4. Run setup script:

```bash
npm run setup:neon
```

**Option B: Local PostgreSQL**

```sql
-- Connect to your PostgreSQL instance
CREATE DATABASE rag_chat_api;

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE langchain_pg_embedding (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID,
    embedding VECTOR(1536),
    document TEXT,
    cmetadata JSONB,
    custom_id TEXT
);

-- Create index for performance
CREATE INDEX langchain_pg_embedding_embedding_idx
ON langchain_pg_embedding USING hnsw (embedding vector_cosine_ops);
```

### 4. Start Development Server

```bash
npm run dev
```

✅ **API will be available at:** `http://localhost:3000`

## 🧪 Test Your Setup

### Test Database Connection

```bash
npm run test:neon
```

### Test Document Upload

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@./test-files/test-doc.txt"
```

### Test RAG Chat

```bash
curl -X POST http://localhost:3000/api/chat/rag \
  -H "Content-Type: application/json" \
  -d '{"message": "What is in the uploaded document?"}'
```

## 🎯 Next Steps

1. **Upload Documents**: Use the `/api/documents/upload` endpoint
2. **Test Search**: Try the `/api/documents/search` endpoint
3. **Chat with RAG**: Use `/api/chat/rag` for context-aware responses
4. **Check API Documentation**: See `docs/API_REFERENCE.md`

## 🚨 Troubleshooting

### Database Issues

```bash
# Debug database connection
npm run debug:neon

# Check if pgvector is installed
npm run debug:simple
```

### OpenAI API Issues

- Verify your API key is valid
- Check you have sufficient credits
- Ensure the model name is correct

### File Upload Issues

- Check file size (max 10MB)
- Ensure file format is supported (PDF, TXT)
- Verify multipart/form-data headers

## 🌟 Tips

- **Development**: Use `text-embedding-3-small` for faster/cheaper embeddings
- **Production**: Consider `text-embedding-3-large` for better quality
- **Performance**: Enable database indexing for large document collections
- **Monitoring**: Check `/api/documents/stats` for system status

## 📚 Learn More

- **Full Documentation**: `README.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Testing Guide**: `integration-tests/README.md`
- **Deployment**: `docs/PRODUCTION_GUIDE.md`

**Happy building! 🚀**
