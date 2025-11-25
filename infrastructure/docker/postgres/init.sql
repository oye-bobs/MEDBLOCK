-- MEDBLOCK Database Initialization Script
-- This script sets up the PostgreSQL database with encryption extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE record_type AS ENUM ('diagnosis', 'lab_result', 'imaging', 'prescription', 'encounter');
CREATE TYPE access_level AS ENUM ('read', 'write', 'admin');

-- Create indexes for performance
-- (Tables will be created by Django migrations)

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE medblock_db TO medblock_user;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'MEDBLOCK database initialized successfully';
END $$;
