export type ConversationMode = 'structured' | 'conversational';

export interface ChatSession {
  id: string;
  role_id: string;
  status: 'active' | 'completed' | 'error';
  context: {
    mode: ConversationMode;
    expectedResponseLength: string;
    currentStage: number;
    resumeUploaded: boolean;
    resumeUrl?: string;
    requirements?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
  created_at: string;
  status?: 'sending' | 'delivered' | 'error';
} 