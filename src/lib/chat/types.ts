export type ConversationMode = 'initial' | 'screening' | 'technical' | 'cultural' | 'closing';

export interface Persona {
  id: string;
  persona_name: string;
  persona_gender: string | null;
  persona_style: 'conversational' | 'structured';
  language_tone: string;
  emoji_style: boolean;
  default_closing: string | null;
  system_prompt: string | null;
  role_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatSession {
  id: string;
  role_id: string | null;
  candidate_id: string | null;
  fit_score: number | null;
  summary_recruiter: string | null;
  summary_candidate: string | null;
  chat_transcript: Message[] | null;
  attachments: Record<string, unknown> | null;
  context: {
    candidate_name?: string;
    resume_url?: string;
    portfolio_urls?: string[];
    collected_info: Record<string, unknown>;
    resumeUploaded?: boolean;
    currentStage?: string;
    currentStep: number;
    totalSteps: number;
    mode: ConversationMode;
  };
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