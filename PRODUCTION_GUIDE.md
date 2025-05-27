# Production Deployment Guide

## Prerequisites

- Node.js 18+
- NPM or Yarn
- OpenAI API key
- Redis (optional, for caching)
- PostgreSQL/MongoDB (optional, for persistent storage)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Environment
NODE_ENV=production
PORT=3000

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE_MB=10
UPLOAD_PATH=./public/uploads

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Database (Optional)
DATABASE_URL=postgresql://user:password@localhost:5432/ragchat
MONGODB_URI=mongodb://localhost:27017/ragchat

# Redis Cache (Optional)
REDIS_URL=redis://localhost:6379

# Vector Store (Optional)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX=rag-chat-index
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  rag-chat-api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./public/uploads:/app/public/uploads
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ragchat
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Performance Optimizations

### 1. Vector Store Caching

```javascript
// Add to documentProcessingService.js
const Redis = require('redis');
const redis = Redis.createClient({ url: process.env.REDIS_URL });

async searchWithCache(query, options) {
  const cacheKey = `search:${Buffer.from(query).toString('base64')}:${JSON.stringify(options)}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Perform search
  const results = await this.searchSimilarDocuments(query, options);

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(results));

  return results;
}
```

### 2. Response Compression

Already implemented with compression middleware.

### 3. Request Validation

```javascript
// Add input validation middleware
const { body, validationResult } = require('express-validator');

const validateChatMessage = [
  body('message').isLength({ min: 1, max: 5000 }).trim().escape(),
  body('sessionId').optional().isAlphanumeric(),
  body('useRAG').optional().isBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

## Security Considerations

### 1. Authentication & Authorization

```javascript
// Add JWT middleware
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

### 2. File Upload Security

```javascript
// Enhanced file validation
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['application/pdf', 'text/plain', 'application/json'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'), false);
  }

  // Check file size (handled by multer limits)
  cb(null, true);
};

// Virus scanning (with ClamAV)
const NodeClam = require('clamscan');
const clamscan = await new NodeClam().init();

const scanFile = async (filePath) => {
  const { isInfected, file, viruses } = await clamscan.scanFile(filePath);
  if (isInfected) {
    throw new Error(`File is infected: ${viruses.join(', ')}`);
  }
};
```

### 3. Rate Limiting by User

```javascript
// User-specific rate limiting
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'Too many requests from this user/IP',
  });
```

## Monitoring & Logging

### 1. Application Monitoring

```javascript
// Add monitoring middleware
const prometheus = require('prom-client');

const httpDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestCounter = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
```

### 2. Structured Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

## Health Checks

### Enhanced Health Check

```javascript
const healthCheck = async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
    checks: {
      database: 'OK',
      redis: 'OK',
      openai: 'OK',
      vectorStore: 'OK',
    },
  };

  try {
    // Check database connection
    await checkDatabase();

    // Check Redis connection
    await checkRedis();

    // Check OpenAI API
    await checkOpenAI();

    // Check vector store
    await checkVectorStore();

    res.json(health);
  } catch (error) {
    health.status = 'ERROR';
    health.error = error.message;
    res.status(503).json(health);
  }
};
```

## Scaling Considerations

### 1. Horizontal Scaling

- Use load balancer (nginx, HAProxy)
- Implement session affinity or stateless sessions
- Use shared storage for uploads

### 2. Vector Store Scaling

- Migrate to Pinecone, Weaviate, or Qdrant for production
- Implement sharding for large document collections
- Use read replicas for search operations

### 3. Caching Strategy

- Redis for search results and embeddings
- CDN for static files
- Application-level caching for frequently accessed data

## Deployment Steps

1. **Build and Test**

   ```bash
   npm ci
   npm run lint
   npm test
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Docker Build**

   ```bash
   docker build -t rag-chat-api .
   docker-compose up -d
   ```

4. **Database Migration** (if using persistent storage)

   ```bash
   npm run migrate
   ```

5. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

## Maintenance

### Backup Strategy

- Regular database backups
- Vector store snapshots
- File storage backups
- Configuration backups

### Updates

- Monitor dependencies for security updates
- Regular OpenAI API version updates
- Vector store maintenance
- Log rotation and cleanup

### Performance Monitoring

- Response time monitoring
- Error rate tracking
- Resource usage monitoring
- User activity analytics

