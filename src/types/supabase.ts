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
      companies: {
        Row: {
          id: string
          name: string
          website: string | null
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          website?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          location: string | null
          requirements: string[] | null
          responsibilities: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          location?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          location?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      personas: {
        Row: {
          id: string
          persona_name: string
          persona_gender: string | null
          persona_style: 'conversational' | 'structured'
          language_tone: string
          emoji_style: boolean
          default_closing: string | null
          system_prompt: string | null
          role_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          persona_name: string
          persona_gender?: string | null
          persona_style: 'conversational' | 'structured'
          language_tone?: string
          emoji_style?: boolean
          default_closing?: string | null
          system_prompt?: string | null
          role_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          persona_name?: string
          persona_gender?: string | null
          persona_style?: 'conversational' | 'structured'
          language_tone?: string
          emoji_style?: boolean
          default_closing?: string | null
          system_prompt?: string | null
          role_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          email: string
          name: string | null
          resume_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          candidate_id: string
          role_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          role_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          role_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          application_id: string
          persona_id: string
          status: string
          scheduled_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          persona_id: string
          status?: string
          scheduled_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          persona_id?: string
          status?: string
          scheduled_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          role_id: string | null
          candidate_id: string | null
          fit_score: number | null
          summary_recruiter: string | null
          summary_candidate: string | null
          chat_transcript: Json | null
          attachments: Json | null
          context: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_id?: string | null
          candidate_id?: string | null
          fit_score?: number | null
          summary_recruiter?: string | null
          summary_candidate?: string | null
          chat_transcript?: Json | null
          attachments?: Json | null
          context?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string | null
          candidate_id?: string | null
          fit_score?: number | null
          summary_recruiter?: string | null
          summary_candidate?: string | null
          chat_transcript?: Json | null
          attachments?: Json | null
          context?: Json
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_session_id: string
          role: 'assistant' | 'user'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_session_id: string
          role: 'assistant' | 'user'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_session_id?: string
          role?: 'assistant' | 'user'
          content?: string
          created_at?: string
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