import { PersonaConfig } from './personas';
import { Message, ResumeInsights, PortfolioInsights, ExperienceLevel } from './types';
import { analyzeResume as analyzeResumeText, analyzePortfolio as analyzePortfolioText } from './fileProcessor';

interface ConversationState {
  currentTopic: string;
  askedQuestions: Set<string>;
  candidateStrengths: string[];
  candidateWeaknesses: string[];
  interestIndicators: string[];
  fileUploadPrompts: string[];
}

interface ResponseContext {
  roleRequirements: string[];
  previousExchange: Message[];
  candidateProfile: {
    detectedSkills: string[];
    experienceLevel: string;
    communicationStyle: string;
  };
}

const fileUploadTriggers = [
  "experience with similar projects",
  "portfolio",
  "code samples",
  "previous work",
  "resume",
  "documentation",
  "case study",
  "project"
];

export function analyzeResponse(message: string): {
  strengths: string[];
  weaknesses: string[];
  interests: string[];
  shouldPromptUpload: boolean;
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const interests: string[] = [];
  
  // Basic keyword analysis
  const positiveIndicators = [
    "successfully", "achieved", "improved", "optimized", "led", "implemented",
    "developed", "designed", "architected", "solved", "resolved"
  ];
  
  const interestIndicators = [
    "interested", "passionate", "excited", "enjoy", "love", "fascinated",
    "curious", "motivated", "driven"
  ];
  
  // Analyze message for strengths and interests
  positiveIndicators.forEach(indicator => {
    if (message.toLowerCase().includes(indicator)) {
      strengths.push(indicator);
    }
  });
  
  interestIndicators.forEach(indicator => {
    if (message.toLowerCase().includes(indicator)) {
      interests.push(indicator);
    }
  });
  
  // Check for file upload triggers
  const shouldPromptUpload = fileUploadTriggers.some(
    trigger => message.toLowerCase().includes(trigger)
  );
  
  return {
    strengths,
    weaknesses,
    interests,
    shouldPromptUpload
  };
}

export function selectNextQuestion(
  state: ConversationState,
  analysis: ReturnType<typeof analyzeResponse>,
  persona: PersonaConfig
): string {
  // If we haven't asked any questions yet, start with the first topic
  if (state.askedQuestions.size === 0) {
    return persona.followUpQuestions[0];
  }
  
  // If we have strengths or interests, follow up on those topics
  if (analysis.strengths.length > 0 || analysis.interests.length > 0) {
    const relevantQuestions = persona.followUpQuestions.filter(q => 
      analysis.strengths.some(s => q.includes(s)) ||
      analysis.interests.some(i => q.includes(i))
    );
      
    if (relevantQuestions.length > 0) {
      const unaskedQuestions = relevantQuestions.filter(q => !state.askedQuestions.has(q));
      if (unaskedQuestions.length > 0) {
        return unaskedQuestions[0];
      }
    }
  }
  
  // Default to next unasked question
  const unaskedQuestions = persona.followUpQuestions.filter(q => !state.askedQuestions.has(q));
  if (unaskedQuestions.length > 0) {
    return unaskedQuestions[0];
  }
  
  // If all questions are asked, start over with the first question
  return persona.followUpQuestions[0];
}

export function generatePersonaResponse(
  message: string,
  context: ResponseContext,
  persona: PersonaConfig
): string {
  const analysis = analyzeResponse(message);
  
  // If we should prompt for file upload
  if (analysis.shouldPromptUpload && !context.candidateProfile.detectedSkills.includes('hasUploadedFiles')) {
    return "Would you like to share any relevant files? You can upload your resume, portfolio, or code samples to help me better understand your experience.";
  }
  
  // If we have enough information to generate a closing statement
  if (context.previousExchange.length >= 5 && analysis.strengths.length >= 2) {
    return persona.closingStatements[Math.floor(Math.random() * persona.closingStatements.length)];
  }
  
  // Generate follow-up question based on analysis
  const nextQuestion = selectNextQuestion({
    currentTopic: context.candidateProfile.detectedSkills[0] || 'general',
    askedQuestions: new Set(context.previousExchange.map(m => m.content)),
    candidateStrengths: analysis.strengths,
    candidateWeaknesses: analysis.weaknesses,
    interestIndicators: analysis.interests,
    fileUploadPrompts: []
  }, analysis, persona);
  
  return nextQuestion;
}

export function generateFollowUpQuestions(insights: ResumeInsights | PortfolioInsights, persona: PersonaConfig): string[] {
  if ('experience' in insights) {
    // Resume insights
    return [
      `I see you have ${insights.experience.years} years of experience. Could you tell me more about your role at ${insights.experience.companies[0]}?`,
      `Your experience with ${insights.skills[0]} is interesting. How did you apply this in your projects?`,
      ...insights.relevantProjects.map(project => 
        `Could you elaborate on your ${project.name} project? Specifically, how did you handle ${project.technologies[0]}?`
      )
    ];
  } else {
    // Portfolio insights
    return [
      `I'm impressed by your ${insights.projects[0].name} project. What was your role in this project?`,
      `How did you approach the technical choices in your projects?`,
      ...(insights.designStyle ? [`Your design style seems ${insights.designStyle}. Could you tell me more about your design process?`] : [])
    ];
  }
}

export function analyzeExperienceLevel(response: string): ExperienceLevel {
  const levelMatch = response.match(/(junior|mid|senior)/i);
  const yearsMatch = response.match(/(\d+)\s*(?:year|yr)s?/i);
  
  return {
    level: (levelMatch?.[1]?.toLowerCase() as 'junior' | 'mid' | 'senior') || 'mid',
    yearsOfExperience: yearsMatch ? parseInt(yearsMatch[1]) : 0,
    relevantAreas: extractRelevantAreas(response)
  };
}

function extractRelevantAreas(text: string): string[] {
  const areas: string[] = [];
  const commonAreas = ['frontend', 'backend', 'fullstack', 'devops', 'mobile', 'data', 'ai', 'cloud'];
  
  commonAreas.forEach(area => {
    if (text.toLowerCase().includes(area)) {
      areas.push(area);
    }
  });
  
  return areas;
}

export async function analyzeResume(text: string): Promise<ResumeInsights> {
  return analyzeResumeText(text);
}

export async function analyzePortfolio(text: string): Promise<PortfolioInsights> {
  return analyzePortfolioText(text);
} 