import { ResumeInsights, PortfolioInsights } from './types';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    // Convert PDF to text using OpenAI's vision model
    const base64 = await file.arrayBuffer().then(buffer => 
      Buffer.from(buffer).toString('base64')
    );
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all text from this PDF document. Format it in a clean, readable way." },
            { type: "image_url", image_url: { url: `data:image/png;base64,${base64}` } }
          ]
        }
      ],
      max_tokens: 2000
    });

    return response.choices[0].message.content || '';
  } else if (file.type.startsWith('text/')) {
    return await file.text();
  } else {
    throw new Error('Unsupported file type');
  }
}

export async function analyzeResume(text: string): Promise<ResumeInsights> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Analyze this resume and extract key information in a structured format.
        Focus on:
        1. Technical skills
        2. Years of experience
        3. Previous roles
        4. Education history
        Return the data in a JSON format matching the ResumeInsights interface.`
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  const analysis = response.choices[0].message.content;
  if (!analysis) throw new Error('Failed to analyze resume');

  // Parse the structured response
  return JSON.parse(analysis);
}

export async function analyzePortfolio(text: string): Promise<PortfolioInsights> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Analyze this portfolio and extract key information in a structured format.
        Focus on:
        1. Project names and descriptions
        2. Technologies used
        3. Technical skills demonstrated
        Return the data in a JSON format matching the PortfolioInsights interface.`
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  const analysis = response.choices[0].message.content;
  if (!analysis) throw new Error('Failed to analyze portfolio');

  // Parse the structured response
  return JSON.parse(analysis);
}

function extractSkills(text: string): string[] {
  const commonSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS'];
  return commonSkills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
}

function extractYearsOfExperience(text: string): number {
  const match = text.match(/(\d+)\s*(?:year|yr)s?/i);
  return match ? parseInt(match[1]) : 0;
}

function extractRoles(text: string): string[] {
  const commonRoles = ['Developer', 'Engineer', 'Designer', 'Manager', 'Architect'];
  return commonRoles.filter(role => text.toLowerCase().includes(role.toLowerCase()));
}

function extractCompanies(text: string): string[] {
  // This is a simple implementation
  // In production, you'd want to use a more sophisticated approach
  const companyRegex = /at\s+([A-Za-z0-9\s]+)(?:\s+from|\s+\(|$)/gi;
  const matches = text.matchAll(companyRegex);
  return Array.from(matches).map(match => match[1].trim());
}

function extractEducation(text: string): Array<{ degree: string; institution: string; year: number }> {
  // This is a placeholder implementation
  return [{
    degree: 'Bachelor of Science',
    institution: 'University',
    year: 2020
  }];
}

function extractProjects(text: string): Array<{ name: string; description: string; technologies: string[] }> {
  // This is a placeholder implementation
  return [{
    name: 'Project Name',
    description: 'Project description',
    technologies: ['React', 'Node.js']
  }];
}

function extractPortfolioProjects(text: string): Array<{ name: string; description: string; technologies: string[]; role: string; impact: string }> {
  // This is a placeholder implementation
  return [{
    name: 'Portfolio Project',
    description: 'Project description',
    technologies: ['React', 'Node.js'],
    role: 'Lead Developer',
    impact: 'Improved performance by 50%'
  }];
}

function extractDesignStyle(text: string): string | undefined {
  const styles = ['minimalist', 'modern', 'classic', 'bold', 'playful'];
  return styles.find(style => text.toLowerCase().includes(style));
}

function extractTechnicalChoices(text: string): string[] {
  const choices = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java'];
  return choices.filter(choice => text.toLowerCase().includes(choice.toLowerCase()));
} 