export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_suggestions: {
        Row: {
          applied: boolean | null
          created_at: string
          id: string
          improved_text: string | null
          original_text: string | null
          resume_id: string
          suggestion_type: string
          user_id: string
        }
        Insert: {
          applied?: boolean | null
          created_at?: string
          id?: string
          improved_text?: string | null
          original_text?: string | null
          resume_id: string
          suggestion_type?: string
          user_id: string
        }
        Update: {
          applied?: boolean | null
          created_at?: string
          id?: string
          improved_text?: string | null
          original_text?: string | null
          resume_id?: string
          suggestion_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_descriptions: {
        Row: {
          company: string | null
          created_at: string
          description: string
          id: string
          required_skills: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          description: string
          id?: string
          required_skills?: string[] | null
          title?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string
          id?: string
          required_skills?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      match_results: {
        Row: {
          created_at: string
          id: string
          job_description_id: string
          match_score: number | null
          matched_skills: string[] | null
          missing_skills: string[] | null
          recommendations: Json | null
          resume_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_description_id: string
          match_score?: number | null
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          recommendations?: Json | null
          resume_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_description_id?: string
          match_score?: number | null
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          recommendations?: Json | null
          resume_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_results_job_description_id_fkey"
            columns: ["job_description_id"]
            isOneToOne: false
            referencedRelation: "job_descriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          ats_score: number | null
          created_at: string
          file_name: string
          file_url: string | null
          id: string
          parsed_data: Json | null
          raw_text: string | null
          section_scores: Json | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ats_score?: number | null
          created_at?: string
          file_name: string
          file_url?: string | null
          id?: string
          parsed_data?: Json | null
          raw_text?: string | null
          section_scores?: Json | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ats_score?: number | null
          created_at?: string
          file_name?: string
          file_url?: string | null
          id?: string
          parsed_data?: Json | null
          raw_text?: string | null
          section_scores?: Json | null
          skills?: string[] | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
