-- Insert SmartJoules company
INSERT INTO companies (name, website, description)
VALUES (
  'SmartJoules',
  'https://smartjoules.com',
  'SmartJoules is a leading energy management company focused on reducing energy consumption and carbon emissions.'
);

-- Insert roles
INSERT INTO roles (company_id, title, description, level, location, tags, requirements, responsibilities, conversation_mode, expected_response_length)
SELECT 
  id,
  'Senior Frontend Developer',
  'Join our team to build the future of AI-powered hiring.',
  'Senior',
  'Remote',
  ARRAY['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
  ARRAY[
    '5+ years of experience with React and TypeScript',
    'Strong understanding of modern web development practices',
    'Experience with Next.js and Tailwind CSS'
  ],
  ARRAY[
    'Develop and maintain the MatchaHire platform',
    'Implement AI-powered features and integrations',
    'Collaborate with the design team to create beautiful user experiences'
  ],
  'structured',
  'medium'
FROM companies
WHERE name = 'SmartJoules';

INSERT INTO roles (company_id, title, description, level, location, tags, requirements, responsibilities, conversation_mode, expected_response_length)
SELECT 
  id,
  'Product Designer',
  'Design intuitive experiences for our AI hiring platform.',
  'Mid-Senior',
  'Remote',
  ARRAY['UI/UX', 'Figma', 'Design Systems'],
  ARRAY[
    '3+ years of product design experience',
    'Strong portfolio of web applications',
    'Experience with Figma and design systems'
  ],
  ARRAY[
    'Design user interfaces for the MatchaHire platform',
    'Create and maintain design systems',
    'Conduct user research and testing'
  ],
  'conversational',
  'medium'
FROM companies
WHERE name = 'SmartJoules';

INSERT INTO roles (company_id, title, description, level, location, tags, requirements, responsibilities, conversation_mode, expected_response_length)
SELECT 
  id,
  'Backend Engineer',
  'Build scalable backend systems for our AI platform.',
  'Senior',
  'Remote',
  ARRAY['Node.js', 'TypeScript', 'PostgreSQL', 'Redis'],
  ARRAY[
    '5+ years of backend development experience',
    'Strong knowledge of Node.js and TypeScript',
    'Experience with PostgreSQL and Redis'
  ],
  ARRAY[
    'Develop and maintain backend services',
    'Implement data processing pipelines',
    'Ensure system reliability and performance'
  ],
  'structured',
  'medium'
FROM companies
WHERE name = 'SmartJoules';

INSERT INTO roles (company_id, title, description, level, location, tags, requirements, responsibilities, conversation_mode, expected_response_length)
SELECT 
  id,
  'AI Engineer',
  'Develop and optimize our AI models for hiring.',
  'Mid-Senior',
  'Remote',
  ARRAY['Python', 'Machine Learning', 'NLP', 'LLMs'],
  ARRAY[
    '3+ years of experience with machine learning',
    'Strong Python programming skills',
    'Experience with NLP and LLMs'
  ],
  ARRAY[
    'Develop and train AI models for hiring',
    'Optimize model performance and accuracy',
    'Implement AI-powered features'
  ],
  'structured',
  'medium'
FROM companies
WHERE name = 'SmartJoules';

-- Insert personas for each role
INSERT INTO personas (role_id, name, description, personality, interview_style)
SELECT 
  id,
  'Tech Lead Interviewer',
  'Experienced technical leader focused on evaluating technical skills and problem-solving abilities.',
  'Professional, analytical, and detail-oriented',
  'Technical questions, coding challenges, and system design discussions'
FROM roles
WHERE title = 'Senior Frontend Developer';

INSERT INTO personas (role_id, name, description, personality, interview_style)
SELECT 
  id,
  'Design Lead Interviewer',
  'Creative design leader focused on evaluating design thinking and user experience skills.',
  'Creative, empathetic, and collaborative',
  'Portfolio review, design challenges, and user experience discussions'
FROM roles
WHERE title = 'Product Designer';

INSERT INTO personas (role_id, name, description, personality, interview_style)
SELECT 
  id,
  'System Architect Interviewer',
  'Experienced backend architect focused on evaluating system design and scalability skills.',
  'Technical, methodical, and strategic',
  'System design questions, scalability discussions, and technical problem-solving'
FROM roles
WHERE title = 'Backend Engineer';

INSERT INTO personas (role_id, name, description, personality, interview_style)
SELECT 
  id,
  'AI Research Lead Interviewer',
  'AI expert focused on evaluating machine learning and NLP skills.',
  'Analytical, innovative, and research-oriented',
  'ML theory questions, practical challenges, and research discussions'
FROM roles
WHERE title = 'AI Engineer';

-- Insert initial roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrator with full access'),
('recruiter', 'Recruiter who can post jobs and manage candidates'),
('candidate', 'Job seeker who can apply for positions');

-- Insert sample job categories
INSERT INTO job_categories (name, description) VALUES
('Software Development', 'Software engineering and development roles'),
('Design', 'UI/UX and graphic design positions'),
('Marketing', 'Marketing and communications roles'),
('Sales', 'Sales and business development positions');

-- Insert sample locations
INSERT INTO locations (name, country, state, city) VALUES
('San Francisco', 'USA', 'California', 'San Francisco'),
('New York', 'USA', 'New York', 'New York'),
('London', 'UK', 'England', 'London'),
('Berlin', 'Germany', 'Berlin', 'Berlin');

-- Insert sample skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('Python', 'Programming'),
('UI/UX Design', 'Design'),
('Digital Marketing', 'Marketing'),
('Sales Strategy', 'Sales');

-- Insert sample companies
INSERT INTO companies (name, description, website, logo_url) VALUES
('TechCorp', 'Leading technology company', 'https://techcorp.com', 'https://techcorp.com/logo.png'),
('DesignHub', 'Creative design agency', 'https://designhub.com', 'https://designhub.com/logo.png'),
('MarketPro', 'Digital marketing solutions', 'https://marketpro.com', 'https://marketpro.com/logo.png');

-- Insert sample job listings
INSERT INTO job_listings (title, description, company_id, location_id, category_id, salary_min, salary_max, employment_type, experience_level) VALUES
('Senior Frontend Developer', 'Looking for an experienced React developer', 1, 1, 1, 120000, 160000, 'full_time', 'senior'),
('UI/UX Designer', 'Creative designer needed for web and mobile apps', 2, 2, 2, 90000, 120000, 'full_time', 'mid'),
('Digital Marketing Manager', 'Lead marketing campaigns and strategies', 3, 3, 3, 80000, 110000, 'full_time', 'senior');

-- Create initial personas
INSERT INTO personas (persona_name, persona_gender, persona_style, role_id, default_closing, system_prompt) VALUES
('Maya', 'female', 'conversational', (SELECT id FROM roles WHERE role_name = 'Operations'), 'Thank you for your time! A real recruiter from our team will be in touch soon 🇮🇳', 'You are Maya, an experienced Operations recruiter with a warm and professional Indian communication style. Focus on operational excellence and process optimization experience.'),
('Arjun', 'male', 'structured', (SELECT id FROM roles WHERE role_name = 'Technical'), 'Thank you for your time! A real recruiter from our team will be in touch soon 🇮🇳', 'You are Arjun, a technical recruiter with deep understanding of software development and system architecture. Use structured technical evaluation approach with Indian cultural context.'); 