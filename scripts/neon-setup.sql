-- Neon Database Setup Script for RAG Chat API with pgvector
-- This script should be run in your Neon database console or via psql

-- Enable pgvector extension (should be available by default in Neon)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the embeddings table for LangChain pgvector integration
CREATE TABLE IF NOT EXISTS langchain_pg_embedding (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_name VARCHAR(255),
    embedding VECTOR(1536), -- OpenAI text-embedding-3-large dimensions
    text TEXT, -- LangChain expects this column to be named 'text'
    metadata JSONB, -- LangChain expects this column to be named 'metadata'
    custom_id VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS langchain_pg_embedding_collection_name_idx 
ON langchain_pg_embedding (collection_name);

CREATE INDEX IF NOT EXISTS langchain_pg_embedding_embedding_idx 
ON langchain_pg_embedding USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS langchain_pg_embedding_custom_id_idx 
ON langchain_pg_embedding (custom_id);

CREATE INDEX IF NOT EXISTS langchain_pg_embedding_metadata_idx 
ON langchain_pg_embedding USING gin (metadata);

-- Verify the setup
SELECT 'pgvector extension installed successfully' as status 
WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector');

SELECT 'Table created successfully' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_name = 'langchain_pg_embedding');

-- Show table structure
\d langchain_pg_embedding;
