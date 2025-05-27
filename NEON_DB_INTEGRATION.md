# Neon DB pgvector Integration Guide

This guide explains how to integrate Neon DB with pgvector for persistent document embeddings storage in the RAG Chat API.

## Overview

The RAG Chat API now supports persistent storage using Neon DB (PostgreSQL) with pgvector extension. This provides several advantages over in-memory storage:

- **Persistence**: Documents survive server restarts
- **Scalability**: Better performance with large document collections
- **Production Ready**: Suitable for production deployments
- **Managed Service**: No database maintenance required
- **Built-in pgvector**: pgvector extension pre-installed

## Neon DB Setup

### 1. Create Neon Account and Project

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Choose a region close to your application
4. Note down your connection details

### 2. Get Connection String

After creating your project, you'll get a connection string like:

```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3. Configure Environment Variables

Update your `.env` file:

```bash
# Neon DB Configuration
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Vector Store Settings (optional)
VECTOR_TABLE_NAME=langchain_pg_embedding
VECTOR_COLLECTION_NAME=documents
VECTOR_DIMENSIONS=1536
USE_MEMORY_FALLBACK=true
```

### 4. Initialize Database Schema

Run the setup script in your Neon console or via psql:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE IF NOT EXISTS langchain_pg_embedding (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_name VARCHAR(255),
    embedding VECTOR(1536),
    document TEXT,
    cmetadata JSONB,
    custom_id VARCHAR(255)
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS langchain_pg_embedding_collection_name_idx
ON langchain_pg_embedding (collection_name);

CREATE INDEX IF NOT EXISTS langchain_pg_embedding_embedding_idx
ON langchain_pg_embedding USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

You can also use the provided script: `scripts/neon-setup.sql`

## Configuration Options

### Environment Variables

| Variable                 | Description                       | Default                  |
| ------------------------ | --------------------------------- | ------------------------ |
| `DATABASE_URL`           | Full Neon connection string       | Required                 |
| `DATABASE_SSL`           | Enable SSL (recommended for Neon) | `true`                   |
| `VECTOR_TABLE_NAME`      | Table name for embeddings         | `langchain_pg_embedding` |
| `VECTOR_COLLECTION_NAME` | Collection name for documents     | `documents`              |
| `VECTOR_DIMENSIONS`      | Embedding dimensions              | `1536`                   |
| `USE_MEMORY_FALLBACK`    | Fall back to memory if DB fails   | `true`                   |

### Alternative Connection Parameters

Instead of `DATABASE_URL`, you can use individual parameters:

```bash
DATABASE_HOST=ep-xxx-xxx.us-east-2.aws.neon.tech
DATABASE_PORT=5432
DATABASE_USER=username
DATABASE_PASSWORD=your_password
DATABASE_NAME=neondb
DATABASE_SSL=true
```

## Features

### Automatic Fallback

The system automatically falls back to in-memory storage if:

- Database connection fails
- Neon DB is unavailable
- `USE_MEMORY_FALLBACK=true` is set

### Document Statistics

Enhanced statistics now include:

- Vector store type (PostgreSQL/Memory)
- Total documents and chunks
- Fallback status

### Document Deletion

- **PostgreSQL**: Actual deletion from database
- **Memory**: Placeholder (memory store limitation)

## Testing

### Test Database Connection

```bash
npm run test:integration
```

### Verify Setup

Check the application logs for:

- ✅ Database connected successfully
- ✅ pgvector extension enabled
- ✅ Table langchain_pg_embedding created/verified

## Production Deployment

### Vercel Configuration

In your Vercel project settings, add:

```bash
DATABASE_URL=your_neon_connection_string
DATABASE_SSL=true
USE_MEMORY_FALLBACK=false
```

### Environment Setup

1. Copy `.env.vercel` template
2. Update with your Neon credentials
3. Deploy to Vercel

## Troubleshooting

### Common Issues

#### Connection Fails

- Verify DATABASE_URL is correct
- Check Neon project is active
- Ensure SSL settings match

#### Table Not Found

- Run the setup SQL script
- Check table permissions
- Verify schema is initialized

#### Performance Issues

- Monitor index usage
- Consider upgrading Neon plan
- Check query performance

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm start
```

## Performance Optimization

### Index Configuration

The setup creates optimized indexes:

- **Collection Name**: Fast filtering by collection
- **Vector Similarity**: IVFFlat index for cosine similarity
- **Custom ID**: Fast document lookups

### Connection Pooling

Built-in connection pooling ensures:

- Efficient database connections
- Automatic connection management
- Graceful error handling

## Migration from Memory Store

If upgrading from memory store:

1. Set up Neon DB as described above
2. Configure environment variables
3. Restart the application
4. Re-upload documents (memory data is not persisted)

## Best Practices

1. **Use SSL**: Always enable SSL for production
2. **Monitor Usage**: Track Neon DB usage and performance
3. **Backup Strategy**: Neon provides automatic backups
4. **Error Handling**: Keep fallback enabled during testing
5. **Performance**: Monitor vector search performance

## Support

For issues:

- Check Neon documentation: [docs.neon.tech](https://docs.neon.tech)
- Review application logs
- Test connection with provided scripts
- Ensure pgvector extension is available

## Limits and Considerations

### Neon Limits

- Free tier: 512 MB storage
- Paid tiers: Higher storage and compute
- Connection limits vary by plan

### pgvector Considerations

- Vector dimensions must match embeddings (1536 for text-embedding-3-large)
- Index performance depends on data size
- Consider query optimization for large datasets
