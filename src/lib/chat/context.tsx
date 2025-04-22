'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ChatSession, Message, ConversationMode } from '@/types/chat';
import { createClient } from '@/lib/supabase/client';
import { PersonaConfig, getPersonaForRole } from './personas';
import { generatePersonaResponse, analyzeResponse } from './intelligence';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  session: ChatSession | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  isInitializing: boolean;
  startSession: (roleId: string, mode?: ConversationMode, expectedResponseLength?: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
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
    retryCountRef.current = 0;
  }, []);

  const startSession = useCallback(async (roleId: string, mode?: ConversationMode, expectedResponseLength?: string) => {
    if (isInitializing) {
      console.log('Session initialization already in progress');
      return;
    }

    // Clear any existing timeout
    if (startSessionTimeoutRef.current) {
      clearTimeout(startSessionTimeoutRef.current);
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsInitializing(true);
    setError(null);

    try {
      if (!roleId) {
        throw new Error('Role ID is required to start a chat session');
      }

      const response = await fetch(`/api/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roleId,
          mode,
          expectedResponseLength
        }),
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json().catch(() => {
        throw new Error('Failed to parse response as JSON');
      });
      
      if (!data.session) {
        throw new Error('No session data received from server');
      }
      
      setSession(data.session);
      
      // Load existing messages if any
      if (data.session.id) {
        const { data: existingMessages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', data.session.id)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error loading messages:', messagesError);
          setMessages([]);
        } else {
          setMessages(existingMessages || []);
        }
      } else {
        setMessages([]);
      }
      
      const roleType = data.role?.type || 'technical';
      const persona = await getPersonaForRole(roleType);
      setCurrentPersona(persona);
      retryCountRef.current = 0;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to start chat session';
      console.error('Chat initialization error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsInitializing(false);
      abortControllerRef.current = null;
      startSessionTimeoutRef.current = null;
    }
  }, [isInitializing, supabase]);

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

  const sendMessage = useCallback(async (text: string) => {
    if (!session || !currentPersona) {
      console.error('No session or persona available');
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Add user message to local state immediately
      const userMessage: Message = {
        id: uuidv4(),
        session_id: session.id,
        role: 'user',
        content: text,
        created_at: new Date().toISOString(),
        status: 'sending'
      };
      
      setMessages(prev => [...prev, userMessage]);

      const formData = new FormData();
      formData.append('message', text);
      formData.append('sessionId', session.id);

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      setMessages(data.messages);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [session, currentPersona]);

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
        created_at: new Date().toISOString(),
        status: 'delivered'
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