-- Update chat_sessions table to match ChatSession interface
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES personas(id),
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_steps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversation_mode TEXT CHECK (conversation_mode IN ('structured', 'conversational')),
ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('new', 'in-progress', 'closed')) DEFAULT 'new';

-- Update existing rows to have default values
UPDATE chat_sessions 
SET 
  current_step = 0,
  total_steps = 5,
  conversation_mode = 'structured',
  messages = '[]'::jsonb,
  context = '{}'::jsonb,
  status = 'new'
WHERE current_step IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_persona_id ON chat_sessions(persona_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);

-- Add trigger to update updated_at
CREATE TRIGGER update_chat_sessions_timestamp
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 