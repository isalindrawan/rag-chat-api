# Test Data Files

This directory contains test documents and sample files used for testing the RAG Chat API functionality.

## Files

### Document Files

- **test-doc.txt** - Simple text document for testing document processing
- **test-doc-2.pdf** - PDF document for testing PDF parsing and processing
- **test.txt** - Empty test file

## Usage

These files are used by integration tests and debug scripts to:

1. **Test Document Upload** - Verify file upload functionality
2. **Test Text Extraction** - Validate text extraction from different file formats
3. **Test Document Processing** - Verify document chunking and embedding generation
4. **Test Similarity Search** - Validate vector search functionality

### Example Usage in Tests

```javascript
// Using test documents in integration tests
const testDocument = {
  filename: "test-doc.txt",
  filePath: path.join(__dirname, "../test-files/test-doc.txt"),
  documentId: "test-doc-001",
};
```

## File Formats Supported

- **Text files (.txt)** - Plain text documents
- **PDF files (.pdf)** - PDF documents with text content
- **Other formats** - As supported by the document processing service

## Adding New Test Files

When adding new test files:

1. Place them in this directory
2. Use descriptive filenames (e.g., `test-large-document.pdf`)
3. Update integration tests to include the new files
4. Document any special characteristics of the test files
