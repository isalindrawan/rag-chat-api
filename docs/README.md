# Documentation Index

Welcome to the RAG Chat API documentation! This directory contains comprehensive guides and references for the project.

## 📚 Documentation Overview

### Quick Start

- **[README.md](../README.md)** - Main project documentation and setup guide
- **[QUICK_SETUP.md](../QUICK_SETUP.md)** - 5-minute setup guide for immediate use

### API Documentation

- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API documentation with examples
- **[FAQ.md](./FAQ.md)** - Frequently asked questions and troubleshooting

### Development

- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - How to contribute to the project
- **[CHANGELOG.md](../CHANGELOG.md)** - Version history and release notes

### Security & Legal

- **[SECURITY.md](../SECURITY.md)** - Security policy and best practices
- **[LICENSE](../LICENSE)** - MIT License terms

## 🚀 Getting Started

1. **New Users**: Start with [README.md](../README.md) for complete setup
2. **Quick Setup**: Use [QUICK_SETUP.md](../QUICK_SETUP.md) for rapid deployment
3. **API Integration**: Refer to [API_REFERENCE.md](./API_REFERENCE.md)
4. **Troubleshooting**: Check [FAQ.md](./FAQ.md)

## 📖 Documentation Categories

### Setup & Installation

- Environment configuration
- Database setup (Neon, local PostgreSQL)
- OpenAI API configuration
- Vercel Blob storage setup

### Development

- Project architecture
- Code structure
- Development workflow
- Testing guidelines

### Deployment

- Vercel deployment
- Docker containerization (single container)
- Production best practices
- Environment variables

### API Usage

- Authentication (coming soon)
- Rate limiting
- Error handling
- Response formats

### Security

- Best practices
- Vulnerability reporting
- Environment security
- Data protection

## 🛠️ Quick Links

| Task                  | Documentation                                                        |
| --------------------- | -------------------------------------------------------------------- |
| **First-time setup**  | [README.md](../README.md) → [Quick Start](../README.md#-quick-start) |
| **5-minute setup**    | [QUICK_SETUP.md](../QUICK_SETUP.md)                                  |
| **API integration**   | [API_REFERENCE.md](./API_REFERENCE.md)                               |
| **Upload documents**  | [API_REFERENCE.md](./API_REFERENCE.md#upload-document)               |
| **Chat with RAG**     | [API_REFERENCE.md](./API_REFERENCE.md#send-rag-message)              |
| **Troubleshooting**   | [FAQ.md](./FAQ.md#troubleshooting)                                   |
| **Contributing code** | [CONTRIBUTING.md](../CONTRIBUTING.md)                                |
| **Security concerns** | [SECURITY.md](../SECURITY.md)                                        |

## 📋 Complete Feature List

- ✅ **Document Upload**: PDF, TXT file support
- ✅ **Text Processing**: Automatic chunking and embedding
- ✅ **Vector Storage**: PostgreSQL with pgvector
- ✅ **RAG Chat**: Context-aware responses
- ✅ **File Storage**: Vercel Blob integration
- ✅ **Rate Limiting**: Built-in protection
- ✅ **Auto-fallback**: Memory storage backup
- ✅ **Health Monitoring**: Status endpoints
- ✅ **Testing Suite**: Comprehensive test coverage
- ✅ **Production Ready**: Vercel deployment support

## 🎯 Common Use Cases

### 1. Document Q&A System

```bash
# Upload document
curl -X POST http://localhost:3000/api/documents/upload -F "file=@document.pdf"

# Ask questions
curl -X POST http://localhost:3000/api/chat/rag \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the key points in this document?"}'
```

### 2. Knowledge Base Search

```bash
# Search documents
curl -X POST http://localhost:3000/api/documents/search \
  -H "Content-Type: application/json" \
  -d '{"query": "customer satisfaction", "k": 5}'
```

### 3. Document Analysis

```bash
# Get statistics
curl http://localhost:3000/api/documents/stats
```

## 🔧 Development Environment

### Required Tools

- Node.js 18+
- PostgreSQL with pgvector
- OpenAI API key

### Optional Tools

- Docker for containerization (single container)
- Vercel CLI for deployment
- Postman for API testing

### Development Scripts

```bash
npm run dev          # Start development server
npm run test         # Run all tests
npm run test:neon    # Test database integration
npm run lint         # Check code style
npm run format       # Format code
```

## 📞 Support

### Community Support

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community help
- **Documentation**: Comprehensive guides and examples

### Getting Help

1. Check the [FAQ.md](./FAQ.md) for common questions
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join community discussions

### Contributing

We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md) for:

- Development setup
- Coding standards
- Pull request process
- Areas needing help

## 📈 Project Roadmap

### Completed ✅

- Core RAG functionality
- Document processing
- Vector storage
- Basic API endpoints
- Deployment support

### In Progress 🚧

- Enhanced authentication
- Additional file formats
- Performance optimizations

### Planned 📅

- Multi-language support
- Advanced search filters
- Conversation history
- Admin dashboard
- Plugin system

---

**Happy building with RAG Chat API!** 🚀

For quick questions, check the [FAQ](./FAQ.md). For detailed API usage, see the [API Reference](./API_REFERENCE.md).
