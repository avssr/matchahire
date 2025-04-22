import { createClient } from '@/lib/supabase/server';
import { ChatSession, Message } from '@/types/chat';

export class ChatManager {
  private supabase;
  private session: ChatSession | null = null;
  private messageQueue: Message[] = [];
  private processingQueue = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor() {
    this.supabase = createClient();
  }

  async initializeSession(roleId: string): Promise<ChatSession> {
    try {
      const { data: session, error } = await this.supabase
        .from('chat_sessions')
        .insert([
          {
            role_id: roleId,
            status: 'active',
            context: {
              roleId,
              createdAt: new Date().toISOString(),
              lastActivity: new Date().toISOString()
            }
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (!session) throw new Error('Failed to create chat session');

      this.session = session;
      return session;
    } catch (error) {
      console.error('Error initializing session:', error);
      throw error;
    }
  }

  async loadSession(sessionId: string): Promise<ChatSession> {
    try {
      const { data: session, error } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      if (!session) throw new Error('Session not found');

      this.session = session;
      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      throw error;
    }
  }

  async addMessage(content: string, role: 'user' | 'assistant'): Promise<Message> {
    if (!this.session) {
      throw new Error('No active session');
    }

    const message: Message = {
      id: crypto.randomUUID(),
      session_id: this.session.id,
      role,
      content,
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    this.messageQueue.push(message);
    await this.processMessageQueue();

    return message;
  }

  private async processMessageQueue() {
    if (this.processingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue[0];
        
        try {
          const { error } = await this.supabase
            .from('messages')
            .insert([message]);

          if (error) throw error;

          // Update message status to delivered
          message.status = 'delivered';
          this.messageQueue.shift();
          this.retryCount = 0;
        } catch (error) {
          if (this.retryCount < this.MAX_RETRIES) {
            this.retryCount++;
            await new Promise(resolve => 
              setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, this.retryCount))
            );
            continue;
          }
          
          // If max retries reached, mark message as error
          message.status = 'error';
          this.messageQueue.shift();
          throw error;
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  async updateSessionContext(context: Record<string, any>): Promise<void> {
    if (!this.session) {
      throw new Error('No active session');
    }

    try {
      const { error } = await this.supabase
        .from('chat_sessions')
        .update({
          context: {
            ...this.session.context,
            ...context,
            lastActivity: new Date().toISOString()
          }
        })
        .eq('id', this.session.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session context:', error);
      throw error;
    }
  }

  async endSession(): Promise<void> {
    if (!this.session) {
      return;
    }

    try {
      const { error } = await this.supabase
        .from('chat_sessions')
        .update({ status: 'ended' })
        .eq('id', this.session.id);

      if (error) throw error;

      this.session = null;
      this.messageQueue = [];
      this.retryCount = 0;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  async getMessages(limit = 50): Promise<Message[]> {
    if (!this.session) {
      throw new Error('No active session');
    }

    try {
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('session_id', this.session.id)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  getCurrentSession(): ChatSession | null {
    return this.session;
  }

  getMessageQueue(): Message[] {
    return [...this.messageQueue];
  }
} 