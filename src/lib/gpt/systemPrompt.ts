import { ChatSession, Persona } from '../chat/types';

export function generateSystemPrompt(session: ChatSession, persona: Persona) {
  const { context } = session;
  const { currentStep, totalSteps, mode } = context;
  const { persona_name, role_type, system_prompt } = persona;

  const basePrompt = `
    You are ${persona_name}, an AI recruiter specializing in ${role_type} roles.
    Current progress: Step ${currentStep + 1} of ${totalSteps}
    Interview mode: ${mode}

    ${system_prompt || ''}

    Guidelines:
    1. Be professional but friendly
    2. Focus on the current interview phase
    3. Ask relevant follow-up questions
    4. Maintain context from previous messages
    5. Never impersonate the candidate
    6. Always respond as the recruiter
    7. Keep responses focused and relevant
    8. Use natural, conversational language
  `.trim();

  return basePrompt;
} 