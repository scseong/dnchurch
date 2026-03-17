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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bulletin_images: {
        Row: {
          bulletin_id: number
          cloudinary_id: string
          created_at: string
          id: number
          order_index: number
          url: string
        }
        Insert: {
          bulletin_id: number
          cloudinary_id: string
          created_at?: string
          id?: never
          order_index?: number
          url: string
        }
        Update: {
          bulletin_id?: number
          cloudinary_id?: string
          created_at?: string
          id?: never
          order_index?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulletin_images_bulletin_id_fkey"
            columns: ["bulletin_id"]
            isOneToOne: false
            referencedRelation: "bulletins"
            referencedColumns: ["id"]
          },
        ]
      }
      bulletins: {
        Row: {
          author_id: string
          content: string | null
          created_at: string
          deleted_at: string | null
          id: number
          sunday_date: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id: string
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: never
          sunday_date: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: never
          sunday_date?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      notices: {
        Row: {
          attachment_url: string | null
          author_id: string | null
          category: Database["public"]["Enums"]["notice_category_enum"]
          content: string
          created_at: string
          deleted_at: string | null
          id: number
          is_pinned: boolean
          is_public: boolean
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          attachment_url?: string | null
          author_id?: string | null
          category?: Database["public"]["Enums"]["notice_category_enum"]
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: never
          is_pinned?: boolean
          is_public?: boolean
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          attachment_url?: string | null
          author_id?: string | null
          category?: Database["public"]["Enums"]["notice_category_enum"]
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: never
          is_pinned?: boolean
          is_public?: boolean
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          dept_id: number | null
          display_name: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["role_enum"]
          status: Database["public"]["Enums"]["profile_status_enum"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          dept_id?: number | null
          display_name?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["role_enum"]
          status?: Database["public"]["Enums"]["profile_status_enum"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          dept_id?: number | null
          display_name?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["role_enum"]
          status?: Database["public"]["Enums"]["profile_status_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          contact: string | null
          created_at: string
          education: string[]
          experience: string[]
          id: number
          image_url: string | null
          is_active: boolean
          name: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          education?: string[]
          experience?: string[]
          id?: number
          image_url?: string | null
          is_active?: boolean
          name: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          education?: string[]
          experience?: string[]
          id?: number
          image_url?: string | null
          is_active?: boolean
          name?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      worship_schedules: {
        Row: {
          category: Database["public"]["Enums"]["worship_category"]
          created_at: string
          id: number
          is_active: boolean
          location: string
          name: string
          order_index: number
          time: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["worship_category"]
          created_at?: string
          id?: number
          is_active?: boolean
          location: string
          name: string
          order_index?: number
          time: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["worship_category"]
          created_at?: string
          id?: number
          is_active?: boolean
          location?: string
          name?: string
          order_index?: number
          time?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_bulletin: {
        Args: {
          p_author_id: string
          p_images?: Json
          p_sunday_date: string
          p_title: string
        }
        Returns: {
          author_id: string
          content: string | null
          created_at: string
          deleted_at: string | null
          id: number
          sunday_date: string
          title: string
          updated_at: string
          view_count: number
        }[]
        SetofOptions: {
          from: "*"
          to: "bulletins"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_adjacent_bulletins: {
        Args: { target_id: number }
        Returns: {
          next_id: number
          next_title: string
          prev_id: number
          prev_title: string
        }[]
      }
      update_bulletin: {
        Args: {
          p_bulletin_id: number
          p_image_ids_to_delete?: number[]
          p_images_to_add?: Json
          p_sunday_date?: string
          p_title?: string
        }
        Returns: {
          author_id: string
          content: string | null
          created_at: string
          deleted_at: string | null
          id: number
          sunday_date: string
          title: string
          updated_at: string
          view_count: number
        }[]
        SetofOptions: {
          from: "*"
          to: "bulletins"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      notice_category_enum:
        | "예배"
        | "행사"
        | "교육"
        | "모집"
        | "교인소식"
        | "선교"
        | "행정"
        | "긴급"
        | "기타"
      profile_status_enum: "pending" | "approved" | "rejected"
      role_enum: "admin" | "dept_manager" | "member"
      worship_category: "main" | "church_school"
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
      notice_category_enum: [
        "예배",
        "행사",
        "교육",
        "모집",
        "교인소식",
        "선교",
        "행정",
        "긴급",
        "기타",
      ],
      profile_status_enum: ["pending", "approved", "rejected"],
      role_enum: ["admin", "dept_manager", "member"],
      worship_category: ["main", "church_school"],
    },
  },
} as const
