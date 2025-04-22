export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          company_id: string
          level: string
          tags: string[]
          conversation_mode: string
          expected_response_length: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          company_id: string
          level: string
          tags: string[]
          conversation_mode: string
          expected_response_length: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          company_id?: string
          level?: string
          tags?: string[]
          conversation_mode?: string
          expected_response_length?: string
        }
      }
      companies: {
        Row: {
          id: string
          created_at: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          role_id: string
          candidate_id: string
          persona_id: string | null
          current_step: number
          total_steps: number
          conversation_mode: 'structured' | 'conversational'
          status: 'new' | 'in-progress' | 'closed'
          messages: {
            id: string
            text: string
            type: 'user' | 'assistant'
            timestamp: number
            metadata?: {
              isTyping?: boolean
              isError?: boolean
              attachments?: {
                type: 'resume' | 'portfolio' | 'other'
                url: string
                name: string
              }[]
            }
          }[]
          context: {
            candidate_name?: string
            resume_url?: string
            portfolio_urls?: string[]
            collected_info: Record<string, any>
          }
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          role_id: string
          candidate_id: string
          persona_id?: string
          current_step?: number
          total_steps?: number
          conversation_mode?: 'structured' | 'conversational'
          status?: 'new' | 'in-progress' | 'closed'
          messages?: {
            id: string
            text: string
            type: 'user' | 'assistant'
            timestamp: number
            metadata?: {
              isTyping?: boolean
              isError?: boolean
              attachments?: {
                type: 'resume' | 'portfolio' | 'other'
                url: string
                name: string
              }[]
            }
          }[]
          context?: {
            candidate_name?: string
            resume_url?: string
            portfolio_urls?: string[]
            collected_info: Record<string, any>
          }
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          role_id?: string
          candidate_id?: string
          persona_id?: string
          current_step?: number
          total_steps?: number
          conversation_mode?: 'structured' | 'conversational'
          status?: 'new' | 'in-progress' | 'closed'
          messages?: {
            id: string
            text: string
            type: 'user' | 'assistant'
            timestamp: number
            metadata?: {
              isTyping?: boolean
              isError?: boolean
              attachments?: {
                type: 'resume' | 'portfolio' | 'other'
                url: string
                name: string
              }[]
            }
          }[]
          context?: {
            candidate_name?: string
            resume_url?: string
            portfolio_urls?: string[]
            collected_info: Record<string, any>
          }
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          session_id: string
          content: string
          role: 'user' | 'assistant'
        }
        Insert: {
          id?: string
          created_at?: string
          session_id: string
          content: string
          role: 'user' | 'assistant'
        }
        Update: {
          id?: string
          created_at?: string
          session_id?: string
          content?: string
          role?: 'user' | 'assistant'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 