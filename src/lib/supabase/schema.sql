-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  requirements TEXT[],
  responsibilities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personas table
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_name VARCHAR(255) NOT NULL,
    persona_gender VARCHAR(50),
    persona_style VARCHAR(50) CHECK (persona_style IN ('conversational', 'structured')),
    language_tone VARCHAR(255) DEFAULT 'English with Indian flavor',
    emoji_style BOOLEAN DEFAULT true,
    default_closing TEXT,
    system_prompt TEXT,
    role_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id),
  role_id UUID REFERENCES roles(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id),
  persona_id UUID REFERENCES personas(id),
  status TEXT DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
    summary_recruiter TEXT,
    summary_candidate TEXT,
    chat_transcript JSONB,
    attachments JSONB,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('assistant', 'user')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create initial personas
INSERT INTO personas (persona_name, persona_gender, persona_style, role_type, default_closing, system_prompt) VALUES
('Maya', 'female', 'conversational', 'Operations', 'Thank you for your time! A real recruiter from our team will be in touch soon 🇮🇳', 'You are Maya, an experienced Operations recruiter with a warm and professional Indian communication style. Focus on operational excellence and process optimization experience.'),
('Arjun', 'male', 'structured', 'Technical', 'Thank you for your time! A real recruiter from our team will be in touch soon 🇮🇳', 'You are Arjun, a technical recruiter with deep understanding of software development and system architecture. Use structured technical evaluation approach with Indian cultural context.'),
('Shruti', 'female', 'conversational', 'Business Development', 'Thank you for your time! A real recruiter from our team will be in touch soon 🇮🇳', 'You are Shruti, a Business Development recruiter focusing on sales aptitude and relationship building skills. Maintain a friendly yet professional Indian communication style.'),
('Karan', 'male', 'structured', 'Product Management', 'Thank you for your time! A real recruiter from our team will be in touch soon 🇮🇳', 'You are Karan, a Product Management recruiter evaluating product sense and leadership abilities. Use a structured approach while maintaining Indian cultural context.');

-- Create RLS policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Roles are viewable by everyone" ON roles
  FOR SELECT USING (true);

CREATE POLICY "Personas are viewable by everyone" ON personas
  FOR SELECT USING (true);

CREATE POLICY "Candidates can view their own data" ON candidates
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Applications are viewable by candidates and companies" ON applications
  FOR SELECT USING (
    auth.uid() = candidate_id OR
    EXISTS (
      SELECT 1 FROM roles
      WHERE roles.id = applications.role_id
      AND roles.company_id = auth.uid()
    )
  );

CREATE POLICY "Interviews are viewable by candidates and companies" ON interviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = interviews.application_id
      AND (
        applications.candidate_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM roles
          WHERE roles.id = applications.role_id
          AND roles.company_id = auth.uid()
        )
      )
    )
  );

-- Policies for chat_sessions
CREATE POLICY "Candidates can view their own chat sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can create chat sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = candidate_id);

-- Policies for messages
CREATE POLICY "Candidates can view their own messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = messages.chat_session_id
            AND chat_sessions.candidate_id = auth.uid()
        )
    );

CREATE POLICY "Candidates can insert messages"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = messages.chat_session_id
            AND chat_sessions.candidate_id = auth.uid()
        )
    );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_role_id ON chat_sessions(role_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_candidate_id ON chat_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_session_id ON messages(chat_session_id); 