# RAG Chat API

A RESTful API backend built with Express.js v4, LangChain, and OpenAI for building RAG (Retrieval-Augmented Generation) chat applications.

## Features

- 🚀 Express.js v4 with MVC architecture
- 🤖 LangChain integration with OpenAI
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- 📝 Structured logging with Morgan
- 🔧 Environment-based configuration
- 🧪 Jest testing setup
- 📊 ESLint for code quality
- 🗂️ Organized project structure

## Project Structure

```
src/
├── app.js              # Main application entry point
├── config/             # Configuration files
│   └── config.js       # Environment configuration
├── controllers/        # Route controllers (MVC)
│   └── chatController.js
├── middleware/         # Custom middleware
│   ├── asyncHandler.js
│   └── errorMiddleware.js
├── models/             # Data models
│   └── index.js
├── routes/             # API routes
│   ├── index.js
│   └── chatRoutes.js
├── services/           # Business logic layer
│   └── chatService.js
└── utils/              # Utility functions
    └── helpers.js
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### API Endpoints

#### Health Check

- `GET /health` - Server health status

#### Chat API

- `GET /api/` - API information
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat` - Get all chat sessions (placeholder)
- `GET /api/chat/:sessionId` - Get specific chat session (placeholder)
- `DELETE /api/chat/:sessionId` - Delete chat session (placeholder)

#### Document Management API

- `POST /api/documents/upload` - Upload a document for RAG processing
- `GET /api/documents` - Get all uploaded documents
- `GET /api/documents/:id` - Get specific document information
- `GET /api/documents/:id/download` - Download a document
- `DELETE /api/documents/:id` - Delete a document
- `GET /uploads/:filename` - Access uploaded files directly (static route)

#### Example Chat Request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how can you help me?"}'
```

#### Example Document Upload

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "document=@your-document.pdf"
```

#### Example Chat Response

```json
{
  "success": true,
  "data": {
    "sessionId": "session_1716825600000_abc123def",
    "userMessage": "Hello, how can you help me?",
    "aiResponse": "Hello! I'm here to help you with any questions...",
    "timestamp": "2024-05-27T12:00:00.000Z"
  }
}
```

## Configuration

Environment variables:

| Variable                  | Description             | Default                 |
| ------------------------- | ----------------------- | ----------------------- |
| `NODE_ENV`                | Environment mode        | `development`           |
| `PORT`                    | Server port             | `3000`                  |
| `OPENAI_API_KEY`          | OpenAI API key          | Required                |
| `OPENAI_MODEL`            | OpenAI model            | `gpt-3.5-turbo`         |
| `OPENAI_TEMPERATURE`      | Model temperature       | `0.7`                   |
| `OPENAI_MAX_TOKENS`       | Max response tokens     | `1000`                  |
| `CORS_ORIGIN`             | CORS origin             | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window       | `900000` (15 min)       |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100`                   |

## Testing

Run tests:

```bash
npm test
```

## Linting

Check code quality:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication and authorization
- [ ] Document upload and processing for RAG
- [ ] Vector database integration (Pinecone, Chroma)
- [ ] Chat session persistence
- [ ] WebSocket support for real-time chat
- [ ] API documentation with Swagger
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run tests and linting
6. Submit a pull request

## License

MIT License - see LICENSE file for details
