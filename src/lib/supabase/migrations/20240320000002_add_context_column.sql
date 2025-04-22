-- Add context column to chat_sessions table
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::jsonb;

-- Update the updated_at timestamp
UPDATE chat_sessions
SET updated_at = NOW()
WHERE context IS NULL; 