# Changelog

All notable changes to the RAG Chat API project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive documentation suite
- Contributing guidelines
- Project structure documentation

### Changed

- Improved project organization
- Enhanced error handling

### Security

- Updated dependency versions for security patches

## [1.0.0] - 2025-01-28

### Added

- **Core RAG Functionality**

  - Document upload and processing (PDF, TXT)
  - Vector embedding generation using OpenAI
  - Similarity search with pgvector
  - Context-aware chat responses
  - Document chunking and preprocessing

- **API Endpoints**

  - `POST /api/documents/upload` - Upload documents
  - `POST /api/documents/search` - Search documents by similarity
  - `GET /api/documents/stats` - Get document statistics
  - `GET /api/documents` - List all documents
  - `GET /api/documents/:id` - Get specific document
  - `DELETE /api/documents/:id` - Delete document
  - `POST /api/chat` - Regular chat endpoint
  - `POST /api/chat/rag` - RAG-enabled chat endpoint
  - `GET /health` - Health check endpoint

- **Database Integration**

  - PostgreSQL with pgvector extension support
  - Neon Database integration
  - Vector storage and retrieval
  - Automatic fallback to in-memory storage

- **File Storage**

  - Vercel Blob storage integration
  - Local file storage for development
  - File upload validation and security
  - Automatic cleanup and management

- **Authentication & Security**

  - Rate limiting (100 requests per 15 minutes)
  - CORS configuration
  - Helmet security middleware
  - Input validation and sanitization
  - File type and size validation

- **Development Tools**

  - Comprehensive test suite (Jest + Supertest)
  - Integration tests for all major components
  - ESLint and Prettier configuration
  - Development and production environments
  - Debug and diagnostic scripts

- **Documentation**

  - Complete API reference with examples
  - Setup and installation guides
  - Deployment documentation (Vercel)
  - Troubleshooting guides
  - Architecture documentation

- **Deployment Support**
  - Vercel serverless deployment
  - Docker containerization support
  - Environment-based configuration
  - Production optimization settings

### Technical Stack

- **Backend**: Express.js v4.18.2
- **AI/ML**: LangChain, OpenAI GPT-3.5-turbo
- **Database**: PostgreSQL with pgvector extension
- **Storage**: Vercel Blob, local filesystem
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint (Airbnb config), Prettier
- **Deployment**: Vercel, Docker

### Configuration

- Environment-based configuration
- Support for development and production modes
- Configurable OpenAI models and parameters
- Flexible database connection options
- Optional blob storage configuration

### Performance Features

- Connection pooling for database
- Compression middleware
- Efficient vector indexing (HNSW)
- Memory optimization for large files
- Streaming support for file uploads

### Error Handling

- Comprehensive error responses
- Graceful degradation (database fallbacks)
- Detailed logging and debugging
- User-friendly error messages
- Health check monitoring

## [0.1.0] - 2025-01-20

### Added

- Initial project setup
- Basic Express.js application structure
- OpenAI integration
- Simple chat functionality
- Health check endpoint

---

## Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

## Contributing

When adding entries to this changelog:

1. Add unreleased changes to the `[Unreleased]` section
2. Use the format: `- Description of change (#PR-number if applicable)`
3. Organize changes by type (Added, Changed, Fixed, etc.)
4. Move unreleased changes to a new version section when releasing
5. Update version links at the bottom of the file

## Version Links

[Unreleased]: https://github.com/your-username/rag-chat-api/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/rag-chat-api/releases/tag/v1.0.0
[0.1.0]: https://github.com/your-username/rag-chat-api/releases/tag/v0.1.0
