'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ChatSession, Message, ConversationMode } from '@/types/chat';
import { createClient } from '@/lib/supabase/client';
import { PersonaConfig, getPersonaForRole } from './personas';
import { generatePersonaResponse, analyzeResponse } from './intelligence';
import { v4 as uuidv4 } from 'uuid';
import { ResumeInsights, PortfolioInsights, FileContext, ExperienceLevel } from './types';

interface ChatState {
  sessionId: string;
  roleId: string;
  messages: Message[];
  fileContext: FileContext;
  activeUntil: Date;
}

interface ChatContextType {
  session: ChatSession | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  isInitializing: boolean;
  startSession: (roleId: string, mode?: ConversationMode, expectedResponseLength?: string) => Promise<void>;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  uploadResume: (formData: FormData) => Promise<void>;
  endSession: () => Promise<void>;
  retrySession: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<PersonaConfig | null>(null);
  const [fileContext, setFileContext] = useState<FileContext>({});
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startSessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 1000; // 1 second base delay

  const supabase = createClient();

  const clearSessionState = useCallback(() => {
    setSession(null);
    setMessages([]);
    setCurrentPersona(null);
    setError(null);
    setIsInitializing(false);
    setFileContext({});
    setExperienceLevel(null);
    retryCountRef.current = 0;
  }, []);

  const startSession = useCallback(async (roleId: string, mode?: ConversationMode, expectedResponseLength?: string) => {
    if (isInitializing) return;

    try {
      setIsInitializing(true);
      setError(null);

      // Create new session
      const sessionId = uuidv4();
      const now = new Date().toISOString();

      // Get role and persona
      const { data: role } = await supabase
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (!role) throw new Error('Role not found');

      const persona = await getPersonaForRole(roleId);
      setCurrentPersona(persona);

      // Create initial message
      const initialMessage = `${persona.initialMessage.greeting}\n\n${persona.initialMessage.experienceQuestion}\n\n${persona.initialMessage.resumeMention}`;

      // Create initial messages array with session_id
      const initialMessages: Message[] = [{
        id: uuidv4(),
        session_id: sessionId,
        role: 'assistant',
        content: initialMessage,
        created_at: now,
        status: 'delivered'
      }];

      // Save to DB for history
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          id: sessionId,
          role_id: roleId,
          status: 'active',
          context: {
            mode: mode || 'structured',
            expectedResponseLength: expectedResponseLength || 'medium',
            currentStage: 0,
            resumeUploaded: false
          },
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save initial message to messages table
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          id: initialMessages[0].id,
          session_id: sessionId,
          role: 'assistant',
          content: initialMessage,
          created_at: now,
          status: 'delivered'
        });

      if (messageError) throw messageError;

      // Update local state
      setSession(newSession);
      setMessages(initialMessages);

      // Save to session storage for persistence
      const state: ChatState = {
        sessionId,
        roleId,
        messages: initialMessages,
        fileContext: {},
        activeUntil: new Date(Date.now() + 30 * 60 * 1000)
      };
      sessionStorage.setItem(`chat_${sessionId}`, JSON.stringify(state));

    } catch (err) {
      console.error('Chat initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start chat session');
      clearSessionState();
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, supabase, clearSessionState]);

  const retrySession = useCallback(async () => {
    if (retryCountRef.current >= MAX_RETRIES) {
      setError('Maximum retry attempts reached. Please try again later.');
      return;
    }

    const delay = RETRY_DELAY * Math.pow(2, retryCountRef.current);
    retryCountRef.current += 1;

    try {
      await new Promise(resolve => setTimeout(resolve, delay));
      await startSession(session?.role_id || '');
    } catch (err) {
      console.error('Retry failed:', err);
    }
  }, [session?.role_id, startSession]);

  const getSystemPrompt = (persona: PersonaConfig | null, mode: ConversationMode) => {
    if (!persona) return '';
    
    return `You are ${persona.name}, an AI recruiter specialized in ${persona.roleType} roles.
    Your style is ${persona.style} and you speak with a ${persona.languageTone} tone.
    ${persona.emojiStyle ? 'Use emojis appropriately in your responses.' : ''}

    Conversation Mode: ${mode}
    ${persona.basePrompt}`;
  };

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!session?.id) {
      throw new Error('No active chat session');
    }

    try {
      setLoading(true);
      setError(null);

      // Verify session exists in DB
      const { data: existingSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', session.id)
        .single();

      if (sessionError || !existingSession) {
        throw new Error('Chat session not found');
      }

      // Create user message
      const userMessage: Message = {
        id: uuidv4(),
        session_id: session.id,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
        status: 'delivered'
      };

      // Save user message to DB
      const { error: messageError } = await supabase
        .from('messages')
        .insert(userMessage);

      if (messageError) throw messageError;

      // Update local state
      setMessages(prev => [...prev, userMessage]);

      // Get chat history
      const { data: history, error: historyError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (historyError) throw historyError;

      // Prepare messages for API
      const apiMessages = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          roleId: session.role_id,
          sessionId: session.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: uuidv4(),
        session_id: session.id,
        role: 'assistant',
        content: data.content,
        created_at: new Date().toISOString(),
        status: 'delivered'
      };

      // Save assistant message to DB
      const { error: assistantError } = await supabase
        .from('messages')
        .insert(assistantMessage);

      if (assistantError) throw assistantError;

      // Update local state
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Message sending error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [session, supabase]);

  const uploadResume = useCallback(async (formData: FormData) => {
    if (!session) return;

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Add progress tracking
      const progressCallback = (progress: number) => {
        console.log(`Upload progress: ${progress}%`);
      };

      formData.append('sessionId', session.id);
      formData.append('progressCallback', progressCallback.toString());

      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const data = await response.json();
      
      // Update session with resume analysis
      if (data.resumeAnalysis) {
        setSession(prev => ({
          ...prev!,
          context: {
            ...prev!.context,
            resumeAnalysis: data.resumeAnalysis,
            resumeUploaded: true,
            lastActivity: new Date().toISOString()
          }
        }));
      }

      // Add system message about resume upload
      const systemMessage: Message = {
        id: uuidv4(),
        session_id: session.id,
        role: 'assistant',
        content: 'Resume has been uploaded and analyzed. The AI will now consider this information in the conversation.',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, systemMessage]);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      setError('Failed to upload resume');
      console.error('Error uploading resume:', err);
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [session]);

  const endSession = useCallback(async () => {
    if (!session) return;
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (startSessionTimeoutRef.current) {
      clearTimeout(startSessionTimeoutRef.current);
    }
    
    clearSessionState();
  }, [session, clearSessionState]);

  const handleFileUpload = useCallback(async (file: File, type: 'resume' | 'portfolio') => {
    if (!session || !currentPersona) return;

    try {
      setLoading(true);
      
      // Process file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('sessionId', session.id);

      const response = await fetch('/api/chat/process-file', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to process file');

      const insights = await response.json();
      
      // Update context
      setFileContext(prev => ({
        ...prev,
        [`${type}Submitted`]: true,
        [`${type}Insights`]: insights
      }));

      // Add assistant message
      const newMessage: Message = {
        id: uuidv4(),
        session_id: session.id,
        role: 'assistant',
        content: `Thank you for sharing your ${type}. I'll analyze it and ask relevant questions.`,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMessage]);

    } catch (err) {
      console.error('File processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setLoading(false);
    }
  }, [session, currentPersona]);

  const handleModalClose = useCallback(async () => {
    if (!session) return;

    try {
      // Update session storage
      sessionStorage.removeItem(`chat_${session.id}`);
      
      // Update DB
      await supabase
        .from('chat_sessions')
        .update({
          context: {
            ...session.context,
            activeUntil: new Date().toISOString()
          }
        })
        .eq('id', session.id);

      clearSessionState();
    } catch (err) {
      console.error('Session cleanup error:', err);
    }
  }, [session, supabase, clearSessionState]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (startSessionTimeoutRef.current) {
        clearTimeout(startSessionTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    session,
    messages,
    loading,
    error,
    isInitializing,
    startSession,
    sendMessage,
    uploadResume,
    endSession,
    retrySession
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export function getSystemPrompt(role: any, context: any) {
  return `You are an AI recruiter interviewing a candidate for the ${role.title} position at ${role.company_name}. 
  Your goal is to assess the candidate's fit for the role based on their responses and any provided resume.
  
  Role details:
  - Title: ${role.title}
  - Level: ${role.level}
  - Location: ${role.location}
  - Mode: ${context.mode || 'initial'}
  
  Requirements:
  ${role.requirements?.join('\n')}
  
  Responsibilities:
  ${role.responsibilities?.join('\n')}
  
  Instructions:
  1. Be professional but friendly
  2. Ask relevant questions based on the role requirements
  3. If the candidate provides a resume, reference specific points from it
  4. Provide constructive feedback
  5. End the conversation when you have gathered enough information
  
  Current context:
  - Mode: ${context.mode || 'initial'}
  - Step: ${context.currentStep || 0} of ${context.totalSteps || 5}
  - Resume: ${context.resumeContent ? 'Provided' : 'Not provided'}
  `;
} 