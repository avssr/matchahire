import { PersonaConfig } from './personas';
import { Message } from '@/types/chat';

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
    const firstTopic = Object.keys(persona.followUpQuestions)[0];
    return persona.followUpQuestions[firstTopic][0];
  }
  
  // If we have strengths or interests, follow up on those topics
  if (analysis.strengths.length > 0 || analysis.interests.length > 0) {
    const relevantTopics = Object.entries(persona.followUpQuestions)
      .filter(([topic]) => 
        analysis.strengths.some(s => topic.includes(s)) ||
        analysis.interests.some(i => topic.includes(i))
      );
      
    if (relevantTopics.length > 0) {
      const [topic, questions] = relevantTopics[0];
      const unaskedQuestions = questions.filter(q => !state.askedQuestions.has(q));
      if (unaskedQuestions.length > 0) {
        return unaskedQuestions[0];
      }
    }
  }
  
  // Default to next unasked question in current topic
  const currentTopicQuestions = persona.followUpQuestions[state.currentTopic];
  if (currentTopicQuestions) {
    const unaskedQuestions = currentTopicQuestions.filter(q => !state.askedQuestions.has(q));
    if (unaskedQuestions.length > 0) {
      return unaskedQuestions[0];
    }
  }
  
  // If all questions in current topic are asked, move to next topic
  const topics = Object.keys(persona.followUpQuestions);
  const currentIndex = topics.indexOf(state.currentTopic);
  const nextTopic = topics[(currentIndex + 1) % topics.length];
  return persona.followUpQuestions[nextTopic][0];
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