export type ConversationMode = 'structured' | 'conversational' | 'initial';

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  title: string;
  description: string;
  level: string;
  location: string;
  company_id: string;
  company_name?: string;
  requirements: string[];
  responsibilities: string[];
  conversation_mode: 'structured' | 'conversational';
  expected_response_length: string;
}

export interface ChatContext {
  mode: ConversationMode;
  expectedResponseLength?: string;
  resumeContent?: string;
  collectedInfo: Record<string, any>;
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
}

export interface ChatSession {
  id: string;
  role_id: string;
  status: 'active' | 'completed';
  context: ChatContext;
  created_at: string;
  updated_at: string;
}

export interface ChatState {
  session: ChatSession | null;
  persona: Persona | null;
  isLoading: boolean;
  error: string | null;
  mode: ConversationMode;
  collectedInfo: Record<string, unknown>;
  currentStep: number;
  totalSteps: number;
  actions: {
    startSession: (roleId: string) => Promise<void>;
    sendMessage: (text: string, attachments?: File[]) => Promise<void>;
    uploadResume: (file: File) => Promise<void>;
    endSession: () => Promise<void>;
  };
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Project {
  name: string;
  description?: string;
  technologies?: string[];
  year?: string;
}

export interface ResumeInsights {
  skills: string[];
  experience: {
    years: number;
    roles: string[];
  };
  education: Education[];
}

export interface PortfolioInsights {
  projects: Project[];
  skills: string[];
}

export interface FileContext {
  resumeSubmitted?: boolean;
  resumeInsights?: ResumeInsights;
  portfolioSubmitted?: boolean;
  portfolioInsights?: PortfolioInsights;
}

export interface ExperienceLevel {
  level: 'junior' | 'mid' | 'senior';
  yearsOfExperience: number;
  relevantAreas: string[];
} 