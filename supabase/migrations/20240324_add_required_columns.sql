-- Add role_type to personas table
ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS role_type VARCHAR(50);

-- Add status to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Update existing messages to have a status
UPDATE messages 
SET status = 'delivered' 
WHERE status IS NULL; 