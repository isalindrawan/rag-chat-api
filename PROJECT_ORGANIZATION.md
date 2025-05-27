# Project Organization

This document explains the organized structure of the RAG Chat API project.

## Directory Structure

```
rag-chat-api/
├── docs/                     # Documentation files
│   ├── INDEX.md             # Documentation index
│   ├── README.md            # Main project documentation
│   ├── QUICK_START.md       # Getting started guide
│   ├── DOCUMENT_API.md      # API documentation
│   ├── PRODUCTION_GUIDE.md  # Production deployment guide
│   ├── BLOB_STORAGE_GUIDE.md # Blob storage guide
│   ├── NEON_DB_INTEGRATION.md # Database integration guide
│   └── ...                  # Other documentation files
│
├── integration-tests/        # Integration tests and debug scripts
│   ├── README.md            # Test documentation
│   ├── test-neon-integration.js # Database integration tests
│   ├── test-blob-integration.js # Blob storage tests
│   ├── test-rag.js          # Complete RAG pipeline tests
│   ├── debug-neon-db.js     # Database debug scripts
│   └── ...                  # Other test files
│
├── test-files/              # Test data and sample files
│   ├── README.md            # Test files documentation
│   ├── test-doc.txt         # Sample text document
│   ├── test-doc-2.pdf       # Sample PDF document
│   └── ...                  # Other test files
│
├── src/                     # Source code
├── tests/                   # Unit tests
├── scripts/                 # Setup and utility scripts
└── ...                      # Other project files
```

## Updated npm Scripts

The following scripts have been updated to work with the new organization:

```bash
# Integration Tests
npm run test:neon       # Test Neon database integration
npm run test:blob       # Test blob storage integration
npm run test:rag        # Test complete RAG functionality

# Debug Scripts
npm run debug:neon      # Debug Neon database connectivity
npm run debug:simple    # Simple debug test

# Verification Scripts
npm run verify:blob     # Verify blob storage functionality
```

## Benefits of This Organization

1. **Clear Separation**: Documentation, tests, and data files are clearly separated
2. **Easy Navigation**: Each directory has its own README explaining its contents
3. **Improved Maintenance**: Easier to find and maintain specific types of files
4. **Better Development Workflow**: Clear structure for adding new tests and documentation
5. **Professional Structure**: Follows common project organization patterns

## Quick Access

- **📚 Documentation**: See [`docs/INDEX.md`](docs/INDEX.md) for all documentation
- **🧪 Tests**: See [`integration-tests/README.md`](integration-tests/README.md) for testing info
- **📁 Test Data**: See [`test-files/README.md`](test-files/README.md) for test file info

## Migration Notes

All files have been moved to their new locations with no functionality changes. The npm scripts have been updated to reference the new file paths.
