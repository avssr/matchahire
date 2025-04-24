-- Add role_type to personas if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'personas' 
        AND column_name = 'role_type'
    ) THEN
        ALTER TABLE personas ADD COLUMN role_type VARCHAR(50) NOT NULL DEFAULT 'general';
    END IF;
END $$;

-- Add status to messages if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE messages ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$; 