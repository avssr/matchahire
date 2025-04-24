-- Add role_type column to personas table
ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS role_type VARCHAR(50);

-- Update existing personas with their role types
UPDATE personas p
SET role_type = r.title
FROM roles r
WHERE p.role_id = r.id;

-- Make the column NOT NULL after populating data
ALTER TABLE personas ALTER COLUMN role_type SET NOT NULL;

-- Fix status in messages
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE messages ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        
        -- Update existing messages to 'delivered' status
        UPDATE messages SET status = 'delivered' WHERE status IS NULL;
    END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema'; 