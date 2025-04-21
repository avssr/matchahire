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
          user_id: string
          role_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          role_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          role_id?: string
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