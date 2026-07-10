export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AdminRole = 'moderator' | 'editor' | 'superadmin'

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
          city_name: string | null
          city_id: number | null
          author_profile: string | null
          stay_purpose: string | null
          still_there: boolean
          climate: string[] | null
          moderated_at: string | null
          moderated_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          author_nationality: string
          target_country: string
          ratings: Json
          comments: Json
          is_approved?: boolean
          city_name?: string | null
          city_id?: number | null
          author_profile?: string | null
          stay_purpose?: string | null
          still_there?: boolean
          climate?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          author_nationality?: string
          target_country?: string
          ratings?: Json
          comments?: Json
          is_approved?: boolean
          city_name?: string | null
          city_id?: number | null
          author_profile?: string | null
          stay_purpose?: string | null
          still_there?: boolean
          climate?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          id: number
          country: string
          name_en: string
          name_uk: string | null
          name_ru: string | null
          slug: string
          population: number
          created_at: string
          article_title_uk: string | null
          article_title_en: string | null
          article_title_ru: string | null
          article_excerpt_uk: string | null
          article_excerpt_en: string | null
          article_excerpt_ru: string | null
          article_body_uk: string | null
          article_body_en: string | null
          article_body_ru: string | null
          article_published: boolean
        }
        Insert: {
          id?: number
          country: string
          name_en: string
          name_uk?: string | null
          name_ru?: string | null
          slug: string
          population?: number
          created_at?: string
          article_title_uk?: string | null
          article_title_en?: string | null
          article_title_ru?: string | null
          article_excerpt_uk?: string | null
          article_excerpt_en?: string | null
          article_excerpt_ru?: string | null
          article_body_uk?: string | null
          article_body_en?: string | null
          article_body_ru?: string | null
          article_published?: boolean
        }
        Update: {
          id?: number
          country?: string
          name_en?: string
          name_uk?: string | null
          name_ru?: string | null
          slug?: string
          population?: number
          created_at?: string
          article_title_uk?: string | null
          article_title_en?: string | null
          article_title_ru?: string | null
          article_excerpt_uk?: string | null
          article_excerpt_en?: string | null
          article_excerpt_ru?: string | null
          article_body_uk?: string | null
          article_body_en?: string | null
          article_body_ru?: string | null
          article_published?: boolean
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          region: string
          is_active: boolean
          language_key: string | null
          currency: string | null
          climate_key: string | null
          cost_level: string | null
          residency_months: string | null
          tax_employee: string | null
          tax_corporate: string | null
          hero_image_url: string | null
          visa_info_uk: string | null
          visa_info_en: string | null
          visa_info_ru: string | null
          article_title_uk: string | null
          article_title_en: string | null
          article_title_ru: string | null
          article_excerpt_uk: string | null
          article_excerpt_en: string | null
          article_excerpt_ru: string | null
          article_body_uk: string | null
          article_body_en: string | null
          article_body_ru: string | null
          article_published: boolean
          updated_at: string
        }
        Insert: {
          code: string
          region?: string
          is_active?: boolean
          language_key?: string | null
          currency?: string | null
          climate_key?: string | null
          cost_level?: string | null
          residency_months?: string | null
          tax_employee?: string | null
          tax_corporate?: string | null
          hero_image_url?: string | null
          visa_info_uk?: string | null
          visa_info_en?: string | null
          visa_info_ru?: string | null
          article_title_uk?: string | null
          article_title_en?: string | null
          article_title_ru?: string | null
          article_excerpt_uk?: string | null
          article_excerpt_en?: string | null
          article_excerpt_ru?: string | null
          article_body_uk?: string | null
          article_body_en?: string | null
          article_body_ru?: string | null
          article_published?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          region?: string
          is_active?: boolean
          language_key?: string | null
          currency?: string | null
          climate_key?: string | null
          cost_level?: string | null
          residency_months?: string | null
          tax_employee?: string | null
          tax_corporate?: string | null
          hero_image_url?: string | null
          visa_info_uk?: string | null
          visa_info_en?: string | null
          visa_info_ru?: string | null
          article_title_uk?: string | null
          article_title_en?: string | null
          article_title_ru?: string | null
          article_excerpt_uk?: string | null
          article_excerpt_en?: string | null
          article_excerpt_ru?: string | null
          article_body_uk?: string | null
          article_body_en?: string | null
          article_body_ru?: string | null
          article_published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: AdminRole
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: AdminRole
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: AdminRole
          created_at?: string
        }
        Relationships: []
      }
      moderation_log: {
        Row: {
          id: string
          review_id: string | null
          admin_id: string | null
          action: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          review_id?: string | null
          admin_id?: string | null
          action: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string | null
          admin_id?: string | null
          action?: string
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          created_at: string
          source: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          source?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          source?: string
        }
        Relationships: []
      }
      country_stats: {
        Row: Record<string, Json | number | string | null>
        Insert: Record<string, Json | number | string | null>
        Update: Record<string, Json | number | string | null>
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

export type ReviewRow = Database['public']['Tables']['reviews']['Row']
export type CityRow = Database['public']['Tables']['cities']['Row']
export type CountryRow = Database['public']['Tables']['countries']['Row']
export type AdminUserRow = Database['public']['Tables']['admin_users']['Row']
