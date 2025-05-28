# Contributing to RAG Chat API

Thank you for your interest in contributing to the RAG Chat API! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

We are committed to fostering a welcoming and inclusive community. Please be respectful and professional in all interactions.

### Our Standards

- **Be Respectful**: Treat all community members with respect and kindness
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Collaborative**: Work together to improve the project
- **Be Patient**: Help newcomers and answer questions thoughtfully

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database with pgvector extension
- OpenAI API key
- Git

### Setting Up Development Environment

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/rag-chat-api.git
   cd rag-chat-api
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**

   ```bash
   # Setup Neon database or local PostgreSQL
   npm run setup:neon
   ```

5. **Run Tests**
   ```bash
   npm test
   npm run test:neon
   npm run test:rag
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-document-versioning`
- `fix/memory-leak-in-processing`
- `docs/update-api-examples`
- `test/improve-integration-coverage`

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (no functional changes)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(api): add document versioning support
fix(chat): resolve memory leak in RAG processing
docs(readme): update installation instructions
test(integration): add blob storage integration tests
```

## Coding Standards

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Fix automatically
npm run lint:fix

# Format code
npm run format
```

### JavaScript/Node.js Guidelines

- Use `const` and `let` instead of `var`
- Use arrow functions for callbacks
- Use async/await instead of callbacks
- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Handle errors appropriately with try/catch

### File Organization

```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── config/          # Configuration files
└── utils/           # Utility functions
```

### Environment Variables

- Add new variables to `.env.example`
- Document in README.md configuration section
- Provide sensible defaults when possible
- Use descriptive names with prefixes (e.g., `OPENAI_*`, `DATABASE_*`)

## Testing Guidelines

### Types of Tests

1. **Unit Tests** (`tests/`)

   - Test individual functions and modules
   - Mock external dependencies
   - Fast execution

2. **Integration Tests** (`integration-tests/`)
   - Test API endpoints
   - Test database operations
   - Test external service integrations

### Writing Tests

```javascript
describe("Feature Name", () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it("should perform expected behavior", async () => {
    // Arrange
    const input = "test data";

    // Act
    const result = await functionUnderTest(input);

    // Assert
    expect(result).toBe("expected output");
  });
});
```

### Test Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:neon      # Database tests
npm run test:blob      # Blob storage tests
npm run test:rag       # Complete RAG pipeline

# Debug tests
npm run debug:neon     # Debug database connectivity
npm run debug:simple   # Simple functionality test
```

## Documentation

### API Documentation

- Update `docs/API_REFERENCE.md` for API changes
- Include request/response examples
- Document error codes and responses
- Add code examples in multiple languages

### README Updates

- Keep installation instructions current
- Update configuration tables
- Add new features to the features list
- Update troubleshooting section

### Code Documentation

```javascript
/**
 * Process a document for RAG (Retrieval-Augmented Generation)
 * @param {string} documentContent - The raw document content
 * @param {Object} options - Processing options
 * @param {number} options.chunkSize - Size of text chunks (default: 1000)
 * @param {number} options.overlap - Overlap between chunks (default: 200)
 * @returns {Promise<Array>} Array of processed document chunks
 */
async function processDocument(documentContent, options = {}) {
  // Implementation
}
```

## Submitting Changes

### Pull Request Process

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**

   - Write code following our standards
   - Add tests for new functionality
   - Update documentation

3. **Test Changes**

   ```bash
   npm test
   npm run lint
   npm run test:integration
   ```

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open Pull Request**
   - Provide clear description
   - Link related issues
   - Include screenshots if applicable

### Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**: Explain what changes were made and why
- **Tests**: Ensure all tests pass
- **Documentation**: Update relevant documentation
- **Breaking Changes**: Clearly note any breaking changes

### Review Process

1. Automated checks must pass (tests, linting)
2. Code review by maintainers
3. Address feedback if any
4. Approval and merge

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Tag created
- [ ] Deployment tested

## Development Tips

### Debugging

```bash
# Database debugging
npm run debug:neon

# API testing
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Check logs
tail -f logs/combined.log
```

### Performance Testing

```bash
# Load testing with autocannon
npx autocannon -c 10 -d 30 http://localhost:3000/api/chat

# Memory profiling
node --inspect src/server.js
```

### Common Issues

1. **Database Connection**

   - Check `DATABASE_URL` format
   - Ensure pgvector extension is installed
   - Verify network connectivity

2. **OpenAI API**

   - Verify API key is valid
   - Check rate limits
   - Monitor usage quotas

3. **File Upload**
   - Check file size limits
   - Verify multipart/form-data headers
   - Ensure sufficient disk space

## Getting Help

- **Documentation**: Check `README.md` and `docs/` directory
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub discussions for questions
- **Testing**: Run integration tests to identify issues

## Areas for Contribution

### High Priority

- [ ] Authentication and authorization system
- [ ] Rate limiting per user
- [ ] Document versioning
- [ ] Batch document processing
- [ ] Advanced search filters

### Medium Priority

- [ ] OCR support for images
- [ ] Multiple embedding model support
- [ ] Conversation history persistence
- [ ] Webhook support
- [ ] Admin dashboard

### Low Priority

- [ ] GraphQL API
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Plugin system
- [ ] Mobile SDK

## Recognition

Contributors will be acknowledged in:

- `README.md` contributors section
- Release notes
- Project documentation

Thank you for contributing to RAG Chat API! 🚀

---

For questions about contributing, please open a discussion or reach out to the maintainers.
