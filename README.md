# RAG Chat API

A powerful Retrieval-Augmented Generation (RAG) API built with Express.js, LangChain, and OpenAI. This API enables document upload, processing, and intelligent question-answering with context-aware responses.

## 🚀 Features

- **Document Processing**: Upload and process various document formats (PDF, TXT, MD, JSON)
- **Vector Storage**: Store document embeddings using PostgreSQL with pgvector
- **RAG Chat**: Context-aware responses using retrieved document chunks
- **Blob Storage**: Scalable file storage with Vercel Blob
- **Rate Limiting**: Built-in API rate limiting for production use
- **Auto-fallback**: Graceful degradation to memory storage if database unavailable
- **Security**: Comprehensive security middleware and best practices

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Upload   │───▶│  Text Extraction │───▶│   Embedding     │
│ (PDF,TXT,MD,JSON)│    │   & Chunking     │    │   Generation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌─────────────────┐              │
│   RAG Response  │◀───│  Vector Search   │◀─────────────┘
│   Generation    │    │   (pgvector)     │
└─────────────────┘    └─────────────────┘
```

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Documentation](#-documentation)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database with pgvector extension (or use Neon)
- OpenAI API key
- Vercel Blob storage (optional, for production)

### 1. Clone and Install

```bash
git clone <repository-url>
cd rag-chat-api
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.vercel .env
```

Configure your `.env` file:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Database (choose one)
DATABASE_URL=postgresql://user:password@localhost:5432/ragchat
# OR for Neon (recommended)
DATABASE_URL=postgresql://user:password@ep-example.neon.tech/neondb?sslmode=require

# Optional - for production file storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 3. Database Setup

**Option A: Using Neon (Recommended)**

1. Create a [Neon](https://neon.tech) account
2. Create a new database
3. Run the setup script: `psql $DATABASE_URL -f scripts/neon-setup.sql`
4. Update your `DATABASE_URL` in `.env`

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL and pgvector extension
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE EXTENSION vector;"

# Create database
createdb ragchat
psql ragchat -f scripts/neon-setup.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Your API will be available at `http://localhost:3000`

## 🔧 Installation

### Development Setup

```bash
# Install dependencies
npm install

# Install development tools
npm install -g nodemon

# Setup pre-commit hooks (optional)
npm run prepare
```

### Production Setup

```bash
# Install production dependencies only
npm ci --production

# Build and start
npm start
```

## ⚙️ Configuration

### Environment Variables

| Variable                | Required | Description                            | Default        |
| ----------------------- | -------- | -------------------------------------- | -------------- |
| `OPENAI_API_KEY`        | Yes      | OpenAI API key for embeddings and chat | -              |
| `DATABASE_URL`          | No       | PostgreSQL connection string           | Memory storage |
| `BLOB_READ_WRITE_TOKEN` | No       | Vercel Blob storage token              | Local storage  |
| `PORT`                  | No       | Server port                            | 3000           |
| `NODE_ENV`              | No       | Environment mode                       | development    |
| `RATE_LIMIT_WINDOW`     | No       | Rate limit window (minutes)            | 15             |
| `RATE_LIMIT_MAX`        | No       | Max requests per window                | 100            |

### Database Configuration

The system supports multiple database configurations:

- **Memory Storage**: Default fallback for development
- **PostgreSQL + pgvector**: Recommended for production
- **Neon**: Serverless PostgreSQL (recommended for deployment)

## 📚 API Reference

### Upload Document

```bash
POST /api/documents/upload
Content-Type: multipart/form-data

# Example
curl -X POST http://localhost:3000/api/documents/upload \
  -F "document=@example.pdf"
```

### Chat with Documents

```bash
POST /api/chat
Content-Type: application/json

{
  "message": "What is the main topic of the uploaded documents?",
  "conversationId": "optional-conversation-id"
}
```

### List Documents

```bash
GET /api/documents
```

### Get Document Details

```bash
GET /api/documents/:id
```

For complete API documentation, see [docs/API_REFERENCE.md](docs/API_REFERENCE.md).

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Integration Tests

```bash
# Test Neon database integration
npm run test:neon

# Test Vercel Blob integration
npm run test:blob

# Test complete RAG workflow
npm run test:rag
```

### Debug Tools

```bash
# Debug database connection
npm run debug:neon

# Simple debug test
npm run debug:simple

# Verify blob storage
npm run verify:blob
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel --prod
   ```

3. **Configure Environment**
   - Set environment variables in Vercel dashboard
   - Use Neon for database
   - Enable Vercel Blob storage

### Docker

```bash
# Build image
docker build -t rag-chat-api .

# Run container
docker run -p 3000:3000 --env-file .env rag-chat-api
```

### Manual Deployment

1. Set up PostgreSQL with pgvector extension
2. Configure environment variables
3. Run database migrations
4. Start the application with `npm start`

## 📁 Project Structure

```
rag-chat-api/
├── api/                    # Vercel API routes
├── docs/                   # Documentation
│   ├── API_REFERENCE.md   # Complete API docs
│   ├── FAQ.md             # Frequently asked questions
│   └── README.md          # Documentation index
├── integration-tests/      # Integration test suites
├── scripts/               # Database and utility scripts
├── src/                   # Source code
│   ├── app.js            # Express app configuration
│   ├── server.js         # Server entry point
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── tests/                 # Unit tests
├── temp-files/           # Temporary file storage
└── test-files/           # Test documents
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📖 Documentation

- **[Quick Setup Guide](QUICK_SETUP.md)** - Get started in 5 minutes
- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation
- **[FAQ](docs/FAQ.md)** - Frequently asked questions
- **[Contributing](CONTRIBUTING.md)** - How to contribute
- **[Security](SECURITY.md)** - Security policy and best practices
- **[Changelog](CHANGELOG.md)** - Version history

## 🔒 Security

Security is a top priority. Please review our [Security Policy](SECURITY.md) for:

- Vulnerability reporting procedures
- Security best practices
- Supported versions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [FAQ](docs/FAQ.md) for common questions
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and community support

## 🗺️ Roadmap

### Current Version (1.0.0)

- ✅ Core RAG functionality
- ✅ PostgreSQL + pgvector support
- ✅ OpenAI integration
- ✅ Vercel Blob storage
- ✅ Rate limiting and security

### Planned Features

- 🔄 Additional embedding providers (Hugging Face, Cohere)
- 🔄 Support for more document formats (DOCX, RTF)
- 🔄 Chat conversation persistence
- 🔄 Document versioning
- 🔄 Advanced search filters
- 🔄 Batch document processing
- 🔄 Analytics and monitoring dashboard

---

**Made with ❤️ for the developer community**
