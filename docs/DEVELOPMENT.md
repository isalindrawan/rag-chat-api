# Development Guide

This guide provides detailed information for developers working on the RAG Chat API project.

## 🛠️ Development Environment Setup

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **PostgreSQL**: Version 13+ with pgvector extension (optional for development)
- **Git**: For version control
- **Docker**: (Optional) For containerized development

### Quick Setup

```bash
# Clone the repository
git clone <repository-url>
cd rag-chat-api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit your environment variables
nano .env

# Start development server
npm run dev
```

## 📁 Project Architecture

### Directory Structure

```
src/
├── app.js              # Express app configuration
├── server.js           # Server entry point
├── config/
│   └── config.js       # Application configuration
├── controllers/        # Route controllers
│   ├── chatController.js
│   └── documentController.js
├── middleware/         # Custom middleware
│   ├── asyncHandler.js
│   ├── errorMiddleware.js
│   ├── uploadMiddleware.js
│   └── validationMiddleware.js
├── routes/             # API routes
│   ├── chatRoutes.js
│   ├── documentRoutes.js
│   └── index.js
├── services/           # Business logic layer
│   ├── blobStorageService.js
│   ├── chatService.js
│   ├── databaseService.js
│   ├── documentProcessingService.js
│   └── documentStore.js
└── utils/              # Utility functions
    └── helpers.js
```

### Design Patterns

- **MVC Architecture**: Clear separation of concerns
- **Service Layer**: Business logic isolated from controllers
- **Middleware Pattern**: Composable request processing
- **Factory Pattern**: For database and storage connections
- **Repository Pattern**: Data access abstraction

## 🔧 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code changes ...

# Run tests
npm test

# Check code quality
npm run lint
npm run format:check

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Code Standards

#### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
  },
};
```

#### Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
};
```

### 3. Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks

Examples:

```bash
feat: add document versioning support
fix: resolve memory leak in document processing
docs: update API documentation for new endpoints
test: add integration tests for blob storage
```

## 🧪 Testing Strategy

### Test Structure

```
tests/
├── unit/                   # Unit tests
│   ├── controllers/
│   ├── services/
│   └── utils/
├── integration/            # Integration tests
│   ├── api/
│   ├── database/
│   └── storage/
└── e2e/                   # End-to-end tests
    └── workflows/
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/chatController.test.js

# Run integration tests
npm run test:integration
```

### Writing Tests

#### Unit Test Example

```javascript
// tests/services/chatService.test.js
const chatService = require("../../src/services/chatService");

describe("ChatService", () => {
  describe("processMessage", () => {
    it("should process a simple message", async () => {
      const result = await chatService.processMessage("Hello");

      expect(result).toHaveProperty("sessionId");
      expect(result).toHaveProperty("userMessage", "Hello");
      expect(result).toHaveProperty("aiResponse");
    });
  });
});
```

#### Integration Test Example

```javascript
// tests/integration/api/chat.test.js
const request = require("supertest");
const app = require("../../../src/app");

describe("Chat API Integration", () => {
  it("should handle chat flow end-to-end", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({ message: "Hello, world!" })
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## 🐛 Debugging

### Debug Configuration

```javascript
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### Debugging Tools

```bash
# Debug specific integration
npm run debug:neon
npm run debug:simple

# Check application health
npm run health
```

## 📊 Performance Monitoring

### Key Metrics to Monitor

1. **Response Time**: API endpoint latency
2. **Memory Usage**: Node.js heap usage
3. **Database Performance**: Query execution time
4. **Vector Search**: Embedding generation and search time
5. **File Processing**: Document upload and processing time

### Performance Testing

```bash
# Load testing with Artillery
npx artillery quick --count 10 --num 100 http://localhost:3000/api/chat

# Memory profiling
node --inspect src/server.js
```

## 🔐 Security Guidelines

### Security Checklist

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection with proper encoding
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Error messages don't leak sensitive info
- [ ] File upload restrictions in place

### Security Testing

```bash
# Security audit
npm run security:audit

# Dependency vulnerability check
npm audit

# OWASP ZAP scanning (manual)
```

## 🚀 Deployment

### Local Development

```bash
# Standard development
npm run dev
```

### Production Deployment

```bash
# Vercel deployment
npm run deploy

# Docker production
npm run docker:build
npm run docker:run
```

### Environment Variables

Always update these files when adding new environment variables:

- `.env.example`
- `docs/API_REFERENCE.md`
- `README.md`

## 🤝 Collaboration

### Code Review Guidelines

1. **Review Checklist**:

   - [ ] Code follows style guidelines
   - [ ] Tests are included and passing
   - [ ] Documentation is updated
   - [ ] Security considerations addressed
   - [ ] Performance impact considered

2. **Review Process**:
   - All PRs require at least one review
   - CI/CD must pass before merge
   - Use meaningful commit messages
   - Squash commits when merging

### Communication

- **Issues**: Use GitHub issues for bugs and features
- **Discussions**: Use GitHub discussions for questions
- **PRs**: Use the pull request template

## 📚 Resources

### Documentation

- [Express.js Documentation](https://expressjs.com/)
- [LangChain Documentation](https://js.langchain.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [PostgreSQL pgvector](https://github.com/pgvector/pgvector)

### Tools

- [Postman Collection](docs/postman_collection.json) (if available)
- [VS Code Extensions](.vscode/extensions.json) (if available)

## 🔄 Continuous Integration

The project uses GitHub Actions for CI/CD:

- **Lint and Format**: Code quality checks
- **Tests**: Unit and integration tests
- **Security**: Dependency auditing
- **Docker**: Container build testing
- **Deploy**: Automatic deployment to Vercel

## 📈 Monitoring and Logging

### Development Logging

```javascript
// Use structured logging
const logger = require("./utils/logger");

logger.info("Processing document", {
  documentId,
  fileSize,
  processingTime,
});
```

### Production Monitoring

- Health checks via `/health` endpoint
- Error tracking with proper error handling
- Performance metrics collection
- Database connection monitoring

---

## 🆘 Need Help?

1. Check the [FAQ](docs/FAQ.md)
2. Search existing [GitHub issues](../../issues)
3. Create a new issue with the appropriate template
4. Join our [GitHub discussions](../../discussions)

Happy coding! 🚀
