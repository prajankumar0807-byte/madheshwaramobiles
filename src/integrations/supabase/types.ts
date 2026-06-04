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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          prev_hash: string | null
          row_hash: string | null
          seq: number
          target: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          prev_hash?: string | null
          row_hash?: string | null
          seq?: number
          target?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          prev_hash?: string | null
          row_hash?: string | null
          seq?: number
          target?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          name: string | null
          phone: string | null
          rating: number
          sentiment: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          name?: string | null
          phone?: string | null
          rating: number
          sentiment?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          name?: string | null
          phone?: string | null
          rating?: number
          sentiment?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      repair_jobs: {
        Row: {
          created_at: string
          customer_name: string
          device: string
          estimated_ready_at: string | null
          id: string
          issue: string | null
          job_code: string
          notes: string | null
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          device: string
          estimated_ready_at?: string | null
          id?: string
          issue?: string | null
          job_code: string
          notes?: string | null
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          device?: string
          estimated_ready_at?: string | null
          id?: string
          issue?: string | null
          job_code?: string
          notes?: string | null
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_scans: {
        Row: {
          auto_fixed_count: number
          created_at: string
          diff: Json
          findings: Json
          high_count: number
          id: string
          low_count: number
          medium_count: number
          new_count: number
          resolved_count: number
          run_by: string | null
          run_by_email: string | null
          total: number
          trigger: string
        }
        Insert: {
          auto_fixed_count?: number
          created_at?: string
          diff?: Json
          findings?: Json
          high_count?: number
          id?: string
          low_count?: number
          medium_count?: number
          new_count?: number
          resolved_count?: number
          run_by?: string | null
          run_by_email?: string | null
          total?: number
          trigger?: string
        }
        Update: {
          auto_fixed_count?: number
          created_at?: string
          diff?: Json
          findings?: Json
          high_count?: number
          id?: string
          low_count?: number
          medium_count?: number
          new_count?: number
          resolved_count?: number
          run_by?: string | null
          run_by_email?: string | null
          total?: number
          trigger?: string
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          id: number
          updated_at: string
          visits: number
        }
        Insert: {
          id?: number
          updated_at?: string
          visits?: number
        }
        Update: {
          id?: number
          updated_at?: string
          visits?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_site_visits: { Args: never; Returns: number }
      sec_enable_rls: { Args: { _table: string }; Returns: boolean }
      sec_tables_missing_service_grants: {
        Args: never
        Returns: {
          table_name: string
        }[]
      }
      sec_tables_without_rls: {
        Args: never
        Returns: {
          table_name: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
