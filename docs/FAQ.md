# Frequently Asked Questions (FAQ)

## General Questions

### What is RAG Chat API?

RAG Chat API is a Retrieval-Augmented Generation system that allows you to upload documents and have intelligent conversations about their content. It combines document processing, vector search, and AI chat capabilities to provide context-aware responses.

### What file formats are supported?

Currently supported formats:

- **PDF files** (.pdf) - Text extraction from PDF documents
- **Text files** (.txt) - Plain text documents
- **Markdown files** (.md) - Markdown formatted text
- **JSON files** (.json) - Structured JSON data

### How does the RAG process work?

1. **Document Upload**: Upload your documents via the API
2. **Text Extraction**: Extract text content from documents
3. **Chunking**: Split text into manageable chunks (500-1000 characters)
4. **Embedding**: Generate vector embeddings using OpenAI
5. **Storage**: Store embeddings in PostgreSQL with pgvector
6. **Query**: When you ask questions, relevant chunks are retrieved
7. **Generation**: AI generates responses using retrieved context

## Setup and Installation

### Do I need a PostgreSQL database?

While PostgreSQL with pgvector is recommended for production, the system includes automatic fallback to in-memory storage for development and testing. For production use, we strongly recommend using a persistent database.

### Can I use a different database?

Currently, the system is optimized for PostgreSQL with pgvector extension. Support for other vector databases (Pinecone, Chroma, Weaviate) is planned for future releases.

### What if I don't have OpenAI credits?

You'll need an OpenAI API key with available credits for:

- **Chat completions** (GPT-3.5-turbo or GPT-4)
- **Embeddings** (text-embedding-3-small or text-embedding-3-large)

Alternative embedding providers are planned for future releases.

### How do I get Vercel Blob storage?

Vercel Blob storage is optional and only needed for production file storage. For development, files are stored locally. To set up Blob storage:

1. Create a Vercel account
2. Create a new project
3. Go to Storage → Blob
4. Create a new store
5. Copy the token to `BLOB_READ_WRITE_TOKEN`

## Usage Questions

### How large can uploaded documents be?

- **Default limit**: 10MB per file
- **Recommended**: 1-5MB for optimal processing
- **Configurable**: You can adjust limits in the configuration

### How many documents can I upload?

There's no hard limit on the number of documents, but consider:

- **Database storage**: Vector embeddings require storage space
- **Memory usage**: Large numbers of documents may impact performance
- **API costs**: More documents = more embedding API calls

### How accurate are the responses?

Response accuracy depends on several factors:

- **Document quality**: Clear, well-structured documents work best
- **Question specificity**: More specific questions yield better results
- **Chunk relevance**: The system retrieves the most relevant chunks
- **Model choice**: GPT-4 generally provides more accurate responses than GPT-3.5

### Can I customize the chunking strategy?

Yes! You can adjust chunking parameters in the configuration:

- **Chunk size**: Default 1000 characters
- **Overlap**: Default 200 characters for context preservation
- **Separators**: Custom text separators for splitting

## Technical Questions

### How do I handle rate limiting?

The API includes built-in rate limiting:

- **Default**: 100 requests per 15 minutes per IP
- **Configurable**: Adjust via environment variables
- **Production**: Consider implementing user-based rate limiting

### Can I run this in Docker?

Yes! The project includes Docker support:

```bash
# Build image
docker build -t rag-chat-api .

# Run container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your-key \
  -e DATABASE_URL=your-db-url \
  rag-chat-api

# Or use docker-compose
docker-compose up -d
```

### How do I deploy to Vercel?

1. **Setup Environment Variables**:

   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add DATABASE_URL
   vercel env add BLOB_READ_WRITE_TOKEN
   ```

2. **Deploy**:

   ```bash
   vercel --prod
   ```

3. **Configure Vercel Blob Storage** in your project dashboard

### What are the system requirements?

**Minimum Requirements:**

- Node.js 18.0.0 or higher
- 512MB RAM (for development)
- PostgreSQL 12+ with pgvector extension

**Recommended for Production:**

- Node.js 20.0.0 or higher
- 2GB RAM or more
- Managed PostgreSQL (like Neon)
- CDN for file storage

### How do I monitor the system?

Check these endpoints for monitoring:

- **Health**: `GET /health` - Basic health check
- **Stats**: `GET /api/documents/stats` - Document statistics
- **Logs**: Check console output or configure logging service

## Development Questions

### How do I add support for new file types?

1. **Update file validation** in `uploadMiddleware.js`
2. **Add text extraction logic** in `documentProcessingService.js`
3. **Test with sample files**
4. **Update documentation**

Example for adding Word document support:

```javascript
// In uploadMiddleware.js
const allowedMimeTypes = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word
];

// In documentProcessingService.js
const mammoth = require("mammoth");

if (
  file.mimetype ===
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}
```

### How do I implement authentication?

The API currently doesn't include authentication. To add it:

1. **Choose authentication method** (JWT, API keys, OAuth)
2. **Add authentication middleware**
3. **Update all protected routes**
4. **Add user management endpoints**

Example JWT implementation:

```javascript
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Apply to protected routes
app.use("/api/documents", authenticateToken);
```

### How do I add custom embeddings models?

Currently supports OpenAI embeddings. To add custom models:

1. **Create embedding service interface**
2. **Implement model-specific logic**
3. **Update configuration**
4. **Test embedding generation**

### Can I use this with other AI models?

Yes! The chat functionality can be adapted for other models:

1. **Replace OpenAI client** with your preferred model client
2. **Update chat service** to use new model API
3. **Adjust prompt formatting** if needed
4. **Test responses**

Example for using local models:

```javascript
// For local models via Ollama
const ollama = require("ollama");

const response = await ollama.chat({
  model: "llama2",
  messages: [{ role: "user", content: prompt }],
});
```

## Troubleshooting

### Common Issues

#### "Database connection failed"

**Causes:**

- Incorrect DATABASE_URL
- Network connectivity issues
- pgvector extension not installed

**Solutions:**

```bash
# Test database connection
npm run debug:neon

# Check environment variables
echo $DATABASE_URL

# Verify pgvector extension
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

#### "OpenAI API error"

**Causes:**

- Invalid API key
- Insufficient credits
- Rate limit exceeded
- Model not available

**Solutions:**

```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check usage and billing in OpenAI dashboard
```

#### "File upload fails"

**Causes:**

- File too large
- Unsupported format
- Storage permission issues

**Solutions:**

```bash
# Check file size
ls -lh your-file.pdf

# Verify file type
file your-file.pdf

# Test with smaller file
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@small-test.txt"
```

#### "RAG responses are irrelevant"

**Causes:**

- Poor document quality
- Inappropriate chunking
- Low similarity threshold

**Solutions:**

- Improve document formatting
- Adjust chunk size and overlap
- Lower similarity threshold
- Use more specific questions

#### "Memory issues"

**Causes:**

- Large documents
- Many concurrent requests
- Memory leaks

**Solutions:**

- Process documents in smaller chunks
- Implement request queuing
- Monitor memory usage
- Restart service regularly

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment
DEBUG=* npm run dev

# Or specific modules
DEBUG=app:* npm run dev
```

### Performance Issues

**Slow responses:**

- Check database query performance
- Monitor OpenAI API response times
- Consider caching frequently accessed data

**High memory usage:**

- Implement document chunk size limits
- Use streaming for large files
- Clear cache periodically

**Database performance:**

- Create proper indexes
- Monitor query execution plans
- Consider read replicas for scaling

## Best Practices

### Document Preparation

1. **Clean text**: Remove unnecessary formatting
2. **Structure**: Use clear headings and sections
3. **Length**: Aim for 1-10 pages per document
4. **Format**: Use supported file formats
5. **Language**: Ensure text is in supported languages

### Production Deployment

1. **Security**: Implement authentication and HTTPS
2. **Monitoring**: Set up health checks and logging
3. **Scaling**: Use load balancers and multiple instances
4. **Backup**: Regular database and file backups
5. **Updates**: Keep dependencies updated

### API Usage

1. **Rate limiting**: Respect API limits
2. **Error handling**: Implement proper error handling
3. **Timeouts**: Set appropriate request timeouts
4. **Retries**: Implement exponential backoff for retries
5. **Caching**: Cache responses when appropriate

### Cost Optimization

1. **Embedding costs**: Use smaller embedding models for development
2. **Chat costs**: Limit response length and context
3. **Storage costs**: Clean up unused documents
4. **Database costs**: Monitor and optimize queries

## Getting Help

### Documentation

- **README.md**: Main project documentation
- **API_REFERENCE.md**: Complete API documentation
- **CONTRIBUTING.md**: Contribution guidelines
- **SECURITY.md**: Security best practices

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community support
- **Documentation**: Check the docs/ directory

### Community

- Share your use cases and improvements
- Contribute to documentation
- Report bugs and suggest features
- Help other users in discussions

### Professional Support

For enterprise deployments and custom integrations, consider:

- Professional services consultation
- Custom feature development
- Performance optimization
- Security audits

---

**Need more help?** Create an issue on GitHub with:

- Clear description of the problem
- Steps to reproduce
- Environment details
- Relevant logs or error messages

We're here to help you build amazing RAG applications! 🚀

# Run container

docker run -p 3000:3000 --env-file .env rag-chat-api

````

See `docs/PRODUCTION_GUIDE.md` for complete Docker instructions.

### How do I monitor performance?

Built-in monitoring includes:
- **Health check**: `GET /health` endpoint
- **Document stats**: `GET /api/documents/stats`
- **Error logging**: Comprehensive error tracking
- **Integration tests**: Automated testing suite

### Can I deploy to platforms other than Vercel?

Yes! The API can be deployed to various platforms:
- **Vercel**: Serverless deployment (recommended)
- **AWS**: EC2, Lambda, ECS
- **Google Cloud**: Cloud Run, Compute Engine
- **DigitalOcean**: Droplets, App Platform
- **Railway**: Platform-as-a-Service
- **Render**: Web services

## Development Questions

### How do I add support for new file formats?

To add support for new file formats:

1. Install appropriate parser (e.g., `mammoth` for .docx)
2. Update `documentProcessingService.js`
3. Add file type validation in `uploadMiddleware.js`
4. Update API documentation

Example for Word documents:
```javascript
// Install: npm install mammoth
const mammoth = require('mammoth');

async function extractFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
````

### How do I customize the AI model?

You can configure different OpenAI models:

```env
# Chat models
OPENAI_MODEL=gpt-3.5-turbo  # Fast, cost-effective
OPENAI_MODEL=gpt-4          # Higher quality, more expensive
OPENAI_MODEL=gpt-4-turbo    # Latest model

# Embedding models
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # 1536 dimensions
OPENAI_EMBEDDING_MODEL=text-embedding-3-large  # 3072 dimensions
```

### How do I add authentication?

Basic authentication implementation:

```javascript
// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

## Troubleshooting

### Common Error Messages

#### "Database connection failed"

- Check `DATABASE_URL` format
- Verify database is running
- Ensure pgvector extension is installed
- Check network connectivity

#### "OpenAI API key invalid"

- Verify API key is correct
- Check for sufficient credits
- Ensure no extra spaces or characters

#### "File upload failed"

- Check file size (max 10MB)
- Verify file format is supported
- Ensure proper multipart/form-data headers

#### "Vector search failed"

- Check if documents have been processed
- Verify database connection
- Ensure embeddings were generated successfully

### Performance Issues

#### Slow response times

- Check database query performance
- Optimize vector index (HNSW)
- Reduce chunk size for faster processing
- Use faster embedding models

#### High memory usage

- Implement streaming for large files
- Clear temporary files after processing
- Use pagination for large result sets
- Optimize document chunking

#### API timeout errors

- Increase timeout limits
- Use background processing for large documents
- Implement request queuing
- Optimize database queries

## Best Practices

### Document Preparation

1. **Clean text**: Remove unnecessary formatting
2. **Structure**: Use clear headings and sections
3. **Size**: Keep documents under 5MB for optimal processing
4. **Format**: PDF and TXT work best for text extraction

### Query Optimization

1. **Specific questions**: Ask targeted, specific questions
2. **Context**: Include relevant keywords in queries
3. **Chunk size**: Adjust based on document structure
4. **Similarity threshold**: Fine-tune for better relevance

### Production Deployment

1. **Environment variables**: Use secure, production values
2. **Database**: Use managed PostgreSQL service
3. **Monitoring**: Implement comprehensive logging
4. **Backup**: Regular database and file backups
5. **Security**: Enable HTTPS, rate limiting, input validation

## Getting Help

### Documentation

- **README.md**: Complete setup and usage guide
- **API_REFERENCE.md**: Detailed API documentation
- **QUICK_SETUP.md**: 5-minute setup guide
- **CONTRIBUTING.md**: Development guidelines

### Testing

```bash
# Run all tests
npm test

# Test specific components
npm run test:neon    # Database integration
npm run test:blob    # Blob storage
npm run test:rag     # Complete RAG pipeline

# Debug tools
npm run debug:neon   # Database debugging
npm run debug:simple # Basic functionality
```

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Questions and community support
- **Documentation**: Comprehensive guides and examples
- **Integration Tests**: Automated testing and validation

### Contributing

We welcome contributions! See `CONTRIBUTING.md` for:

- Development setup
- Coding standards
- Testing guidelines
- Pull request process

---

Still have questions? Check the troubleshooting section in `README.md` or open a GitHub discussion.
