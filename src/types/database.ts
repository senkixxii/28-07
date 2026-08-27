// Generated from the live Supabase project schema via the Supabase MCP
// `generate_typescript_types` tool. Re-generate this file after any schema
// change (see supabase/schema.sql) instead of hand-editing it.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.17'
  }
  public: {
    Tables: {
      anniversaries: {
        Row: {
          anniversary_date: string
          cover_image_url: string | null
          created_at: string
          id: string
          message: string | null
          month_number: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anniversary_date: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          month_number: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anniversary_date?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          month_number?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      anniversary_images: {
        Row: {
          anniversary_id: string
          created_at: string
          id: string
          image_url: string
          sort_order: number
          storage_path: string
          user_id: string
        }
        Insert: {
          anniversary_id: string
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          storage_path: string
          user_id: string
        }
        Update: {
          anniversary_id?: string
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'anniversary_images_anniversary_id_fkey'
            columns: ['anniversary_id']
            isOneToOne: false
            referencedRelation: 'anniversaries'
            referencedColumns: ['id']
          },
        ]
      }
      couple_settings: {
        Row: {
          couple_photo_url: string | null
          created_at: string
          id: string
          my_avatar_url: string | null
          my_name: string
          partner_avatar_url: string | null
          partner_name: string
          relationship_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          couple_photo_url?: string | null
          created_at?: string
          id?: string
          my_avatar_url?: string | null
          my_name?: string
          partner_avatar_url?: string | null
          partner_name?: string
          relationship_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          couple_photo_url?: string | null
          created_at?: string
          id?: string
          my_avatar_url?: string | null
          my_name?: string
          partner_avatar_url?: string | null
          partner_name?: string
          relationship_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          storage_path: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          storage_path: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      letters: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          letter_date: string
          message: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          letter_date?: string
          message: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          letter_date?: string
          message?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
