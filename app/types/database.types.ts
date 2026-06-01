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
      reviews: {
        Row: {
          id: string
          created_at: string
          author_nationality: string
          target_country: string
          ratings: Json
          comments: Json
          is_approved: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          author_nationality: string
          target_country: string
          ratings: Json
          comments: Json
          is_approved?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          author_nationality?: string
          target_country?: string
          ratings?: Json
          comments?: Json
          is_approved?: boolean
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
