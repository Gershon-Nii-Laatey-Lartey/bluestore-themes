export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_analytics: {
        Row: {
          boost_level: string | null
          clicks: number | null
          created_at: string | null
          date: string
          featured: boolean | null
          id: string
          interactions: Json | null
          messages: number | null
          package_id: string | null
          priority_score: number | null
          product_id: string
          updated_at: string | null
          urgent: boolean | null
          user_id: string
          views: number | null
        }
        Insert: {
          boost_level?: string | null
          clicks?: number | null
          created_at?: string | null
          date?: string
          featured?: boolean | null
          id?: string
          interactions?: Json | null
          messages?: number | null
          package_id?: string | null
          priority_score?: number | null
          product_id: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id: string
          views?: number | null
        }
        Update: {
          boost_level?: string | null
          clicks?: number | null
          created_at?: string | null
          date?: string
          featured?: boolean | null
          id?: string
          interactions?: Json | null
          messages?: number | null
          package_id?: string | null
          priority_score?: number | null
          product_id?: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_packages: {
        Row: {
          active: boolean | null
          ads_allowed: number | null
          best_for: string
          color: string
          created_at: string
          duration: string
          features: string[]
          icon: string
          id: string
          name: string
          popular: boolean | null
          price: number
          recommended: boolean | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          ads_allowed?: number | null
          best_for: string
          color?: string
          created_at?: string
          duration: string
          features?: string[]
          icon?: string
          id: string
          name: string
          popular?: boolean | null
          price?: number
          recommended?: boolean | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          ads_allowed?: number | null
          best_for?: string
          color?: string
          created_at?: string
          duration?: string
          features?: string[]
          icon?: string
          id?: string
          name?: string
          popular?: boolean | null
          price?: number
          recommended?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string | null
          cs_worker_id: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string | null
          cs_worker_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string | null
          cs_worker_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_cs_worker_id_fkey"
            columns: ["cs_worker_id"]
            isOneToOne: false
            referencedRelation: "cs_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      case_updates: {
        Row: {
          case_number: string
          case_type: string
          created_at: string | null
          id: string
          message: string
          update_type: string
          updated_by: string | null
        }
        Insert: {
          case_number: string
          case_type: string
          created_at?: string | null
          id?: string
          message: string
          update_type: string
          updated_by?: string | null
        }
        Update: {
          case_number?: string
          case_type?: string
          created_at?: string | null
          id?: string
          message?: string
          update_type?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          parent_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          id: string
          message_text: string
          read: boolean
          receiver_id: string
          room_id: string
          sender_id: string
          sent_at: string
        }
        Insert: {
          id?: string
          message_text: string
          read?: boolean
          receiver_id: string
          room_id: string
          sender_id: string
          sent_at?: string
        }
        Update: {
          id?: string
          message_text?: string
          read?: boolean
          receiver_id?: string
          room_id?: string
          sender_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message: string | null
          last_updated: string
          product_id: string
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message?: string | null
          last_updated?: string
          product_id: string
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message?: string | null
          last_updated?: string
          product_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_chat_queues: {
        Row: {
          assigned_at: string | null
          chat_room_id: string
          created_at: string
          cs_worker_id: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          initial_message: string | null
          priority: number | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          chat_room_id: string
          created_at?: string
          cs_worker_id?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          initial_message?: string | null
          priority?: number | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          chat_room_id?: string
          created_at?: string
          cs_worker_id?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          initial_message?: string | null
          priority?: number | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cs_chat_queues_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cs_chat_queues_cs_worker_id_fkey"
            columns: ["cs_worker_id"]
            isOneToOne: false
            referencedRelation: "cs_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_work_assignments: {
        Row: {
          assigned_at: string
          completed_at: string | null
          cs_worker_id: string
          id: string
          notes: string | null
          status: string | null
          work_item_id: string
          work_type: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          cs_worker_id: string
          id?: string
          notes?: string | null
          status?: string | null
          work_item_id: string
          work_type: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          cs_worker_id?: string
          id?: string
          notes?: string | null
          status?: string | null
          work_item_id?: string
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_work_assignments_cs_worker_id_fkey"
            columns: ["cs_worker_id"]
            isOneToOne: false
            referencedRelation: "cs_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_worker_roles: {
        Row: {
          assigned_at: string
          assigned_by: string
          cs_worker_id: string
          id: string
          role: Database["public"]["Enums"]["cs_worker_role"]
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          cs_worker_id: string
          id?: string
          role: Database["public"]["Enums"]["cs_worker_role"]
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          cs_worker_id?: string
          id?: string
          role?: Database["public"]["Enums"]["cs_worker_role"]
        }
        Relationships: [
          {
            foreignKeyName: "cs_worker_roles_cs_worker_id_fkey"
            columns: ["cs_worker_id"]
            isOneToOne: false
            referencedRelation: "cs_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_worker_sessions: {
        Row: {
          cs_worker_id: string
          id: string
          last_activity: string | null
          login_at: string
          logout_at: string | null
          status: string | null
        }
        Insert: {
          cs_worker_id: string
          id?: string
          last_activity?: string | null
          login_at?: string
          logout_at?: string | null
          status?: string | null
        }
        Update: {
          cs_worker_id?: string
          id?: string
          last_activity?: string | null
          login_at?: string
          logout_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cs_worker_sessions_cs_worker_id_fkey"
            columns: ["cs_worker_id"]
            isOneToOne: false
            referencedRelation: "cs_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_workers: {
        Row: {
          created_at: string
          email: string
          employee_id: string | null
          full_name: string
          generated_password: string | null
          hire_date: string | null
          id: string
          phone: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          employee_id?: string | null
          full_name: string
          generated_password?: string | null
          hire_date?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          employee_id?: string | null
          full_name?: string
          generated_password?: string | null
          hire_date?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_reviews: {
        Row: {
          business_user_id: string
          created_at: string | null
          id: string
          product_id: string | null
          rating: number
          review_text: string | null
          reviewer_id: string
          status: string | null
          updated_at: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          business_user_id: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating: number
          review_text?: string | null
          reviewer_id: string
          status?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          business_user_id?: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          status?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          address: string
          agree_terms: boolean
          confirm_info: boolean
          email: string
          full_name: string
          id: string
          id_document_back_url: string | null
          id_document_url: string | null
          location: string
          phone_number: string
          product_category: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_with_id_url: string | null
          status: string | null
          store_description: string
          store_name: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          address: string
          agree_terms?: boolean
          confirm_info?: boolean
          email: string
          full_name: string
          id?: string
          id_document_back_url?: string | null
          id_document_url?: string | null
          location: string
          phone_number: string
          product_category: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_with_id_url?: string | null
          status?: string | null
          store_description: string
          store_name: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          address?: string
          agree_terms?: boolean
          confirm_info?: boolean
          email?: string
          full_name?: string
          id?: string
          id_document_back_url?: string | null
          id_document_url?: string | null
          location?: string
          phone_number?: string
          product_category?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_with_id_url?: string | null
          status?: string | null
          store_description?: string
          store_name?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          parent_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      package_features: {
        Row: {
          created_at: string
          feature_name: string
          feature_value: Json | null
          id: string
          package_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature_name: string
          feature_value?: Json | null
          id?: string
          package_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature_name?: string
          feature_value?: Json | null
          id?: string
          package_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_provider: string
          provider_payment_id: string | null
          provider_reference: string | null
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_provider?: string
          provider_payment_id?: string | null
          provider_reference?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_provider?: string
          provider_payment_id?: string | null
          provider_reference?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_subscription"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reports: {
        Row: {
          assigned_worker_id: string | null
          case_number: string | null
          created_at: string | null
          description: string | null
          id: string
          product_id: string
          report_type: string
          reporter_id: string | null
          resolved_at: string | null
          status: string | null
          transferred_to_admin: boolean | null
          updated_at: string | null
        }
        Insert: {
          assigned_worker_id?: string | null
          case_number?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          product_id: string
          report_type: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string | null
          transferred_to_admin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          assigned_worker_id?: string | null
          case_number?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          product_id?: string
          report_type?: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string | null
          transferred_to_admin?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reports_assigned_worker_id_fkey"
            columns: ["assigned_worker_id"]
            isOneToOne: false
            referencedRelation: "cs_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_submissions: {
        Row: {
          boost_level: string | null
          category: string
          condition: string
          created_at: string
          description: string
          edited: boolean | null
          id: string
          images: string[] | null
          location: string
          main_image_index: number | null
          negotiable: boolean | null
          original_price: number | null
          package: Json | null
          package_price: number | null
          phone: string
          previous_price: number | null
          price: number
          rejection_reason: string | null
          status: string | null
          suggestions: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          boost_level?: string | null
          category: string
          condition: string
          created_at?: string
          description: string
          edited?: boolean | null
          id?: string
          images?: string[] | null
          location: string
          main_image_index?: number | null
          negotiable?: boolean | null
          original_price?: number | null
          package?: Json | null
          package_price?: number | null
          phone: string
          previous_price?: number | null
          price: number
          rejection_reason?: string | null
          status?: string | null
          suggestions?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          boost_level?: string | null
          category?: string
          condition?: string
          created_at?: string
          description?: string
          edited?: boolean | null
          id?: string
          images?: string[] | null
          location?: string
          main_image_index?: number | null
          negotiable?: boolean | null
          original_price?: number | null
          package?: Json | null
          package_price?: number | null
          phone?: string
          previous_price?: number | null
          price?: number
          rejection_reason?: string | null
          status?: string | null
          suggestions?: string | null
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
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          location: string | null
          results_count: number | null
          search_query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          results_count?: number | null
          search_query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          results_count?: number | null
          search_query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      storefront_chats: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          storefront_id: string
          updated_at: string
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          storefront_id: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          storefront_id?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          payment_provider: string
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          payment_provider?: string
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          payment_provider?: string
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_chat_messages: {
        Row: {
          id: string
          message_text: string
          sender_id: string | null
          sender_type: string
          sent_at: string | null
          session_id: string
        }
        Insert: {
          id?: string
          message_text: string
          sender_id?: string | null
          sender_type: string
          sent_at?: string | null
          session_id: string
        }
        Update: {
          id?: string
          message_text?: string
          sender_id?: string | null
          sender_type?: string
          sent_at?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "support_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_chat_sessions: {
        Row: {
          assigned_worker_id: string | null
          case_number: string | null
          created_at: string | null
          id: string
          priority: number | null
          resolved_at: string | null
          status: string | null
          transferred_to_admin: boolean | null
          updated_at: string | null
          user_id: string | null
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          assigned_worker_id?: string | null
          case_number?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          resolved_at?: string | null
          status?: string | null
          transferred_to_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          assigned_worker_id?: string | null
          case_number?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          resolved_at?: string | null
          status?: string | null
          transferred_to_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_chat_sessions_assigned_worker_id_fkey"
            columns: ["assigned_worker_id"]
            isOneToOne: false
            referencedRelation: "cs_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      terms_content: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_plan_features: {
        Row: {
          created_at: string | null
          feature_name: string
          feature_value: Json | null
          id: string
          subscription_id: string
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          feature_value?: Json | null
          id?: string
          subscription_id: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          feature_value?: Json | null
          id?: string
          subscription_id?: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_plan_features_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_plan_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plan_subscriptions: {
        Row: {
          ads_allowed: number | null
          ads_used: number | null
          auto_renew: boolean | null
          created_at: string | null
          duration_days: number
          end_date: string
          features: Json | null
          id: string
          plan_name: string
          plan_price: number
          plan_type: Database["public"]["Enums"]["plan_type"]
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ads_allowed?: number | null
          ads_used?: number | null
          auto_renew?: boolean | null
          created_at?: string | null
          duration_days: number
          end_date: string
          features?: Json | null
          id?: string
          plan_name: string
          plan_price: number
          plan_type: Database["public"]["Enums"]["plan_type"]
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ads_allowed?: number | null
          ads_used?: number | null
          auto_renew?: boolean | null
          created_at?: string | null
          duration_days?: number
          end_date?: string
          features?: Json | null
          id?: string
          plan_name?: string
          plan_price?: number
          plan_type?: Database["public"]["Enums"]["plan_type"]
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_storefronts: {
        Row: {
          active: boolean | null
          banner_image: string | null
          business_name: string
          contact_info: Json | null
          created_at: string | null
          description: string | null
          id: string
          logo_image: string | null
          settings: Json | null
          storefront_url: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          banner_image?: string | null
          business_name: string
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_image?: string | null
          settings?: Json | null
          storefront_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          banner_image?: string | null
          business_name?: string
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_image?: string | null
          settings?: Json | null
          storefront_url?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          business_name: string
          categories: string[] | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          location: string | null
          phone: string | null
          return_policy: string | null
          settings: Json | null
          shipping_policy: string | null
          storefront_enabled: boolean | null
          storefront_url: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
          warranty_info: string | null
        }
        Insert: {
          business_name: string
          categories?: string[] | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          return_policy?: string | null
          settings?: Json | null
          shipping_policy?: string | null
          storefront_enabled?: boolean | null
          storefront_url?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          warranty_info?: string | null
        }
        Update: {
          business_name?: string
          categories?: string[] | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          return_policy?: string | null
          settings?: Json | null
          shipping_policy?: string | null
          storefront_enabled?: boolean | null
          storefront_url?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          warranty_info?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          processed: boolean
          processed_at: string | null
          provider: string
        }
        Insert: {
          created_at?: string
          event_data: Json
          event_type: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          provider: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          provider?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_product_to_cs_worker: {
        Args: { product_id: string }
        Returns: boolean
      }
      auto_expire_plans: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_priority_score: {
        Args: { package_price: number; created_at: string }
        Returns: number
      }
      calculate_priority_score_with_boost: {
        Args: {
          package_price: number
          created_at: string
          boost_level?: string
        }
        Returns: number
      }
      calculate_subscription_end_date: {
        Args: { plan_id: string; start_date?: string }
        Returns: string
      }
      can_user_post_ad: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      expire_free_ads: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_case_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_cs_worker_roles: {
        Args: { worker_user_id: string }
        Returns: Database["public"]["Enums"]["cs_worker_role"][]
      }
      get_next_available_cs_worker: {
        Args: {
          work_type: string
          required_role: Database["public"]["Enums"]["cs_worker_role"]
        }
        Returns: string
      }
      get_package_features: {
        Args: { pkg_id: string }
        Returns: {
          feature_name: string
          feature_value: Json
        }[]
      }
      get_user_active_plan: {
        Args: { user_uuid: string }
        Returns: {
          ads_allowed: number | null
          ads_used: number | null
          auto_renew: boolean | null
          created_at: string | null
          duration_days: number
          end_date: string
          features: Json | null
          id: string
          plan_name: string
          plan_price: number
          plan_type: Database["public"]["Enums"]["plan_type"]
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_user_ads_used: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_cs_worker: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_user_id?: string
          p_cs_worker_id?: string
          p_action_type?: string
          p_action_description?: string
          p_entity_type?: string
          p_entity_id?: string
          p_old_values?: Json
          p_new_values?: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { p_room_id: string; p_user_id: string }
        Returns: undefined
      }
      package_has_feature: {
        Args: { pkg_id: string; feature_name: string }
        Returns: boolean
      }
      renew_free_ad: {
        Args: { ad_id: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "cs_worker" | "cs_supervisor"
      cs_worker_role:
        | "customer_service_chat"
        | "complaints_reports_manager"
        | "product_review"
        | "general_access"
      plan_type:
        | "free"
        | "starter"
        | "standard"
        | "rising"
        | "pro"
        | "business"
        | "premium"
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
      app_role: ["admin", "moderator", "user", "cs_worker", "cs_supervisor"],
      cs_worker_role: [
        "customer_service_chat",
        "complaints_reports_manager",
        "product_review",
        "general_access",
      ],
      plan_type: [
        "free",
        "starter",
        "standard",
        "rising",
        "pro",
        "business",
        "premium",
      ],
    },
  },
} as const
