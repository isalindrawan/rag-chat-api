# Integration Tests

This directory contains all integration tests, debug scripts, and verification utilities.

## Test Files

### Integration Tests

- **test-blob-integration.js** - Tests blob storage integration with Vercel Blob
- **test-neon-integration.js** - Tests Neon database integration and pgvector functionality
- **test-rag.js** - Tests the complete RAG (Retrieval Augmented Generation) pipeline
- **test-upload-debug.js** - Debug utility for testing file uploads

### Debug Scripts

- **debug-neon-db.js** - Debug script for Neon database connectivity and operations
- **debug-simple.js** - Simple debug script for basic functionality testing

### Verification Scripts

- **verify-blob-integration.js** - Verification script for blob storage functionality

## Usage

### Running Tests

```bash
# Test Neon database integration
npm run test:neon

# Test blob storage integration
node integration-tests/test-blob-integration.js

# Test complete RAG functionality
node integration-tests/test-rag.js

# Debug database connectivity
node integration-tests/debug-neon-db.js
```

### Debug Scripts

Use the debug scripts to troubleshoot specific components:

```bash
# Debug Neon database
node integration-tests/debug-neon-db.js

# Simple debug test
node integration-tests/debug-simple.js
```

## Organization

- **test-\*.js** - Integration test files
- **debug-\*.js** - Debug and diagnostic scripts
- **verify-\*.js** - Verification and validation scripts
