# Vercel Deployment Guide

This guide explains how to deploy the RAG Chat API to Vercel.

## Prerequisites

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Create a Vercel account** at [vercel.com](https://vercel.com)

3. **Prepare environment variables**:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NODE_ENV` - Set to "production"
   - `BLOB_READ_WRITE_TOKEN` - Your Vercel Blob Storage token (for file uploads)
   - `BLOB_STORE_NAME` - Your blob store name (optional, defaults to "rag-chat-api-blob")
   - `CORS_ORIGIN` - Your frontend URL (optional)
   - `FRONTEND_URL` - Your frontend URL for CORS (optional)

## Deployment Steps

### 1. Login to Vercel

```bash
vercel login
```

### 2. Configure Environment Variables

In your Vercel dashboard or using CLI:

```bash
# Using Vercel CLI
vercel env add OPENAI_API_KEY
vercel env add NODE_ENV production
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add BLOB_STORE_NAME rag-chat-api-blob
vercel env add CORS_ORIGIN https://your-frontend-domain.com
```

Or add them in the Vercel dashboard:

- Go to your project settings
- Navigate to "Environment Variables"
- Add the required variables

### 3. Deploy to Vercel

**Initial Deployment:**

```bash
vercel
```

**Production Deployment:**

```bash
vercel --prod
```

**Using npm script:**

```bash
npm run deploy
```

### 4. Set up Vercel Blob Storage

1. **Create Blob Storage**:

   - Go to your Vercel project dashboard
   - Navigate to the "Storage" tab
   - Click "Create Database" → "Blob"
   - Name your store (e.g., "rag-chat-api-blob")

2. **Get Connection Token**:

   - Copy the `BLOB_READ_WRITE_TOKEN` from the connection details
   - Add it to your environment variables

3. **Configure Environment**:
   ```bash
   vercel env add BLOB_READ_WRITE_TOKEN your_blob_token_here
   vercel env add BLOB_STORE_NAME rag-chat-api-blob
   ```

### 5. Test Local Development with Vercel

```bash
npm run vercel-dev
```

## Project Structure for Vercel

The project is configured with the following Vercel-specific files:

- `vercel.json` - Vercel configuration
- `api/index.js` - Serverless function entry point
- `.vercelignore` - Files to exclude from deployment

## Important Notes

### Serverless Limitations

1. **File Storage**:

   - **✅ SOLVED**: Now uses Vercel Blob Storage for persistent file storage
   - Files are stored permanently in Vercel Blob Storage when `BLOB_READ_WRITE_TOKEN` is configured
   - Falls back to ephemeral `/tmp` directory for local development
   - **Setup Required**: Create Vercel Blob Storage and configure environment variables

2. **Vector Store**:

   - Current implementation uses in-memory vector store
   - Data will be lost between function invocations
   - For production, use persistent vector databases (Pinecone, Weaviate, etc.)

3. **Function Timeout**:
   - Maximum execution time is 30 seconds (configured in vercel.json)
   - Large document processing might timeout

### Production Recommendations

1. **Use Persistent Storage**:

   ```javascript
   // Example: AWS S3 integration
   const AWS = require("aws-sdk");
   const s3 = new AWS.S3();
   ```

2. **Use Persistent Vector Database**:

   ```javascript
   // Example: Pinecone integration
   const { PineconeStore } = require("langchain/vectorstores/pinecone");
   ```

3. **Environment Variables**:

   ```bash
   # Required
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=production

   # Vercel Blob Storage (Required for file uploads)
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   BLOB_STORE_NAME=rag-chat-api-blob

   # Optional for enhanced functionality
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_ENVIRONMENT=your_pinecone_env
   PINECONE_INDEX=your_pinecone_index
   ```

## API Endpoints

Once deployed, your API will be available at:

- Health Check: `https://your-app.vercel.app/health`
- Chat: `https://your-app.vercel.app/api/chat`
- RAG Chat: `https://your-app.vercel.app/api/chat/rag`
- Documents: `https://your-app.vercel.app/api/documents`

## Troubleshooting

### Common Issues

1. **Function Timeout**:

   - Increase timeout in `vercel.json` (max 30s for hobby plan)
   - Optimize document processing

2. **CORS Issues**:

   - Update CORS configuration in `src/app.js`
   - Set proper `FRONTEND_URL` environment variable

3. **Missing Dependencies**:

   - Ensure all dependencies are in `package.json`
   - Run `npm install` locally to verify

4. **Environment Variables**:
   - Verify all required env vars are set in Vercel dashboard
   - Use `vercel env ls` to list current variables

### Logs and Debugging

```bash
# View function logs
vercel logs

# View deployment logs
vercel logs --follow
```

## Example Frontend Integration

```javascript
// Example React component
const API_BASE_URL = "https://your-rag-api.vercel.app";

const sendMessage = async (message) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/rag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  return response.json();
};
```

## Monitoring and Analytics

Consider adding monitoring tools:

- Vercel Analytics
- Sentry for error tracking
- LogRocket for user sessions

## Scaling Considerations

- Vercel automatically scales serverless functions
- Monitor function execution time and memory usage
- Consider upgrading to Pro plan for better limits
- Implement caching strategies for frequently accessed data
