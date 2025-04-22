import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { ChatSession, Message, Persona } from './types';
import { toast } from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export class ChatManager {
  private supabase: SupabaseClient<Database>;
  private session: ChatSession | null = null;
  private persona: Persona | null = null;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  async initializeChat(userId: string, personaId: string): Promise<void> {
    const { data: persona, error: personaError } = await this.supabase
      .from('personas')
      .select('*')
      .eq('id', personaId)
      .single();

    if (personaError || !persona) {
      throw new Error('Failed to fetch persona');
    }

    const { data: session, error: sessionError } = await this.supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        persona_id: personaId,
        messages: [],
        context: {
          collected_info: {},
          resumeUploaded: false,
          currentStage: 'initial'
        }
      })
      .select()
      .single();

    if (sessionError || !session) {
      throw new Error('Failed to create chat session');
    }

    this.session = session;
    this.persona = persona;
  }

  async loadSession(sessionId: string): Promise<void> {
    const { data: session, error: sessionError } = await this.supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Failed to load chat session');
    }

    const { data: persona, error: personaError } = await this.supabase
      .from('personas')
      .select('*')
      .eq('id', session.persona_id)
      .single();

    if (personaError || !persona) {
      throw new Error('Failed to load persona');
    }

    this.session = session;
    this.persona = persona;
  }

  async handleFileUpload(file: File): Promise<string> {
    if (!this.session) {
      throw new Error('Chat session not initialized');
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a PDF or Word document.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${this.session.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await this.supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError || !data) {
      throw new Error('Failed to upload file');
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    await this.updateSessionContext({
      resume_url: publicUrl,
      resumeUploaded: true
    });

    return publicUrl;
  }

  async updateSessionContext(contextUpdate: Partial<ChatSession['context']>): Promise<void> {
    if (!this.session) {
      throw new Error('Chat session not initialized');
    }

    const updatedContext = {
      ...this.session.context,
      ...contextUpdate
    };

    const { error } = await this.supabase
      .from('chat_sessions')
      .update({ 
        context: updatedContext,
        updated_at: new Date().toISOString()
      })
      .eq('id', this.session.id);

    if (error) {
      throw new Error('Failed to update session context');
    }

    this.session.context = updatedContext;
  }

  async addMessage(message: Omit<Message, 'timestamp'>): Promise<void> {
    if (!this.session) {
      throw new Error('Chat session not initialized');
    }

    const newMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };

    const updatedTranscript = [
      ...(this.session.chat_transcript || []),
      newMessage
    ];

    const { error } = await this.supabase
      .from('chat_sessions')
      .update({ chat_transcript: updatedTranscript })
      .eq('id', this.session.id);

    if (error) {
      throw new Error('Failed to add message');
    }

    this.session.chat_transcript = updatedTranscript;
  }

  async endSession(): Promise<void> {
    if (!this.session) {
      throw new Error('Chat session not initialized');
    }

    const { error } = await this.supabase
      .from('chat_sessions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', this.session.id);

    if (error) {
      throw new Error('Failed to end chat session');
    }

    this.session = null;
    this.persona = null;
  }

  getSession(): ChatSession | null {
    return this.session;
  }

  getPersona(): Persona | null {
    return this.persona;
  }
} 