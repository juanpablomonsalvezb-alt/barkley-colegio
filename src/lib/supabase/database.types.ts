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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          icon_url: string
          id: string
          is_active: boolean
          slug: string
          title: string
          xp_reward: number
        }
        Insert: {
          category: string
          condition_type: string
          condition_value: number
          created_at?: string
          description: string
          icon_url: string
          id?: string
          is_active?: boolean
          slug: string
          title: string
          xp_reward?: number
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          icon_url?: string
          id?: string
          is_active?: boolean
          slug?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      adaptive_rules: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          max_score_percent: number
          min_score_percent: number
          next_action: Json
          path: Database["public"]["Enums"]["adaptive_path"]
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          max_score_percent: number
          min_score_percent: number
          next_action: Json
          path: Database["public"]["Enums"]["adaptive_path"]
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          max_score_percent?: number
          min_score_percent?: number
          next_action?: Json
          path?: Database["public"]["Enums"]["adaptive_path"]
        }
        Relationships: [
          {
            foreignKeyName: "adaptive_rules_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      content_generation_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          generation_time_ms: number | null
          id: string
          input_params: Json
          model_used: string | null
          output_content: Json | null
          requested_by: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["content_gen_status"]
          target_course_id: string | null
          target_lesson_id: string | null
          target_type: string
          tokens_used: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          generation_time_ms?: number | null
          id?: string
          input_params: Json
          model_used?: string | null
          output_content?: Json | null
          requested_by: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_gen_status"]
          target_course_id?: string | null
          target_lesson_id?: string | null
          target_type: string
          tokens_used?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          generation_time_ms?: number | null
          id?: string
          input_params?: Json
          model_used?: string | null
          output_content?: Json | null
          requested_by?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_gen_status"]
          target_course_id?: string | null
          target_lesson_id?: string | null
          target_type?: string
          tokens_used?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_generation_jobs_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_generation_jobs_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_generation_jobs_target_course_id_fkey"
            columns: ["target_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_generation_jobs_target_lesson_id_fkey"
            columns: ["target_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed_at: string | null
          completed_lessons: number
          completion_percent: number
          course_id: string
          created_at: string
          id: string
          last_accessed_at: string | null
          started_at: string
          student_id: string
          total_lessons: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_lessons?: number
          completion_percent?: number
          course_id: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          started_at?: string
          student_id: string
          total_lessons?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_lessons?: number
          completion_percent?: number
          course_id?: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          started_at?: string
          student_id?: string
          total_lessons?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          grade_level: Database["public"]["Enums"]["grade_level"]
          id: string
          is_published: boolean
          slug: string
          subject_id: string
          thumbnail_url: string | null
          title: string
          total_lessons: number
          total_units: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade_level: Database["public"]["Enums"]["grade_level"]
          id?: string
          is_published?: boolean
          slug: string
          subject_id: string
          thumbnail_url?: string | null
          title: string
          total_lessons?: number
          total_units?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade_level?: Database["public"]["Enums"]["grade_level"]
          id?: string
          is_published?: boolean
          slug?: string
          subject_id?: string
          thumbnail_url?: string | null
          title?: string
          total_lessons?: number
          total_units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_activity: {
        Row: {
          activity_date: string
          created_at: string
          id: string
          lessons_completed: number
          quizzes_completed: number
          student_id: string
          time_spent_seconds: number
          updated_at: string
          xp_earned: number
        }
        Insert: {
          activity_date: string
          created_at?: string
          id?: string
          lessons_completed?: number
          quizzes_completed?: number
          student_id: string
          time_spent_seconds?: number
          updated_at?: string
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          created_at?: string
          id?: string
          lessons_completed?: number
          quizzes_completed?: number
          student_id?: string
          time_spent_seconds?: number
          updated_at?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_activity_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          academic_year: number
          approved_at: string | null
          approved_by: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          documents: Json | null
          enrolled_at: string | null
          grade_level: Database["public"]["Enums"]["grade_level"]
          id: string
          notes: string | null
          plan_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year: number
          approved_at?: string | null
          approved_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          documents?: Json | null
          enrolled_at?: string | null
          grade_level: Database["public"]["Enums"]["grade_level"]
          id?: string
          notes?: string | null
          plan_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: number
          approved_at?: string | null
          approved_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          documents?: Json | null
          enrolled_at?: string | null
          grade_level?: Database["public"]["Enums"]["grade_level"]
          id?: string
          notes?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          assigned_path: Database["public"]["Enums"]["adaptive_path"] | null
          challenge_completed: boolean
          completed_at: string | null
          content_read: boolean
          created_at: string
          id: string
          lesson_id: string
          quiz_best_score: number | null
          quiz_completed: boolean
          reinforcement_completed: boolean
          started_at: string
          student_id: string
          time_spent_seconds: number
          updated_at: string
          video_watch_percent: number
          video_watched: boolean
        }
        Insert: {
          assigned_path?: Database["public"]["Enums"]["adaptive_path"] | null
          challenge_completed?: boolean
          completed_at?: string | null
          content_read?: boolean
          created_at?: string
          id?: string
          lesson_id: string
          quiz_best_score?: number | null
          quiz_completed?: boolean
          reinforcement_completed?: boolean
          started_at?: string
          student_id: string
          time_spent_seconds?: number
          updated_at?: string
          video_watch_percent?: number
          video_watched?: boolean
        }
        Update: {
          assigned_path?: Database["public"]["Enums"]["adaptive_path"] | null
          challenge_completed?: boolean
          completed_at?: string | null
          content_read?: boolean
          created_at?: string
          id?: string
          lesson_id?: string
          quiz_best_score?: number | null
          quiz_completed?: boolean
          reinforcement_completed?: boolean
          started_at?: string
          student_id?: string
          time_spent_seconds?: number
          updated_at?: string
          video_watch_percent?: number
          video_watched?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_resources: {
        Row: {
          created_at: string
          display_order: number
          id: string
          lesson_id: string
          resource_type: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          lesson_id: string
          resource_type: string
          title: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          lesson_id?: string
          resource_type?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          challenge_content_html: string | null
          challenge_project_description: string | null
          content_html: string | null
          created_at: string
          difficulty_level: number
          display_order: number
          estimated_minutes: number
          id: string
          is_published: boolean
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          prerequisites: Json | null
          reinforcement_content_html: string | null
          reinforcement_video_url: string | null
          slug: string
          summary_pdf_url: string | null
          title: string
          unit_id: string
          updated_at: string
          video_duration_seconds: number | null
          video_url: string | null
        }
        Insert: {
          challenge_content_html?: string | null
          challenge_project_description?: string | null
          content_html?: string | null
          created_at?: string
          difficulty_level?: number
          display_order: number
          estimated_minutes?: number
          id?: string
          is_published?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          prerequisites?: Json | null
          reinforcement_content_html?: string | null
          reinforcement_video_url?: string | null
          slug: string
          summary_pdf_url?: string | null
          title: string
          unit_id: string
          updated_at?: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Update: {
          challenge_content_html?: string | null
          challenge_project_description?: string | null
          content_html?: string | null
          created_at?: string
          difficulty_level?: number
          display_order?: number
          estimated_minutes?: number
          id?: string
          is_published?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          prerequisites?: Json | null
          reinforcement_content_html?: string | null
          reinforcement_video_url?: string | null
          slug?: string
          summary_pdf_url?: string | null
          title?: string
          unit_id?: string
          updated_at?: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_clp: number
          billing_period_end: string
          billing_period_start: string
          created_at: string
          due_date: string
          external_payment_url: string | null
          external_transaction_id: string | null
          id: string
          paid_at: string | null
          payer_id: string
          payment_metadata: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          plan_id: string
          receipt_url: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          amount_clp: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          due_date: string
          external_payment_url?: string | null
          external_transaction_id?: string | null
          id?: string
          paid_at?: string | null
          payer_id: string
          payment_metadata?: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          plan_id: string
          receipt_url?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          amount_clp?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          due_date?: string
          external_payment_url?: string | null
          external_transaction_id?: string | null
          id?: string
          paid_at?: string | null
          payer_id?: string
          payment_metadata?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          plan_id?: string
          receipt_url?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          grade_levels: Database["public"]["Enums"]["grade_level"][]
          id: string
          is_active: boolean
          monthly_price_clp: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          grade_levels: Database["public"]["Enums"]["grade_level"][]
          id?: string
          is_active?: boolean
          monthly_price_clp: number
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          grade_levels?: Database["public"]["Enums"]["grade_level"][]
          id?: string
          is_active?: boolean
          monthly_price_clp?: number
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          grade_level: Database["public"]["Enums"]["grade_level"] | null
          id: string
          is_active: boolean
          onboarding_completed: boolean
          parent_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          rut: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          grade_level?: Database["public"]["Enums"]["grade_level"] | null
          id: string
          is_active?: boolean
          onboarding_completed?: boolean
          parent_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          rut?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          grade_level?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          is_active?: boolean
          onboarding_completed?: boolean
          parent_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          rut?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: Json
          created_at: string
          difficulty_level: number
          display_order: number
          feedback_correct: string
          feedback_hint: string | null
          feedback_incorrect: string
          feedback_per_option: Json | null
          id: string
          options: Json
          points: number
          question_image_url: string | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: string
          topic_tag: string | null
          updated_at: string
        }
        Insert: {
          correct_answer: Json
          created_at?: string
          difficulty_level?: number
          display_order: number
          feedback_correct: string
          feedback_hint?: string | null
          feedback_incorrect: string
          feedback_per_option?: Json | null
          id?: string
          options: Json
          points?: number
          question_image_url?: string | null
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id: string
          topic_tag?: string | null
          updated_at?: string
        }
        Update: {
          correct_answer?: Json
          created_at?: string
          difficulty_level?: number
          display_order?: number
          feedback_correct?: string
          feedback_hint?: string | null
          feedback_incorrect?: string
          feedback_per_option?: Json | null
          id?: string
          options?: Json
          points?: number
          question_image_url?: string | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id?: string
          topic_tag?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          assigned_path: Database["public"]["Enums"]["adaptive_path"]
          attempt_number: number
          completed_at: string
          created_at: string
          id: string
          quiz_id: string
          score_earned: number
          score_percent: number
          score_total: number
          started_at: string
          student_id: string
          time_spent_seconds: number
        }
        Insert: {
          answers?: Json
          assigned_path: Database["public"]["Enums"]["adaptive_path"]
          attempt_number: number
          completed_at?: string
          created_at?: string
          id?: string
          quiz_id: string
          score_earned: number
          score_percent: number
          score_total: number
          started_at?: string
          student_id: string
          time_spent_seconds?: number
        }
        Update: {
          answers?: Json
          assigned_path?: Database["public"]["Enums"]["adaptive_path"]
          attempt_number?: number
          completed_at?: string
          created_at?: string
          id?: string
          quiz_id?: string
          score_earned?: number
          score_percent?: number
          score_total?: number
          started_at?: string
          student_id?: string
          time_spent_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          lesson_id: string
          max_attempts: number
          passing_score: number
          show_correct_after: boolean
          shuffle_options: boolean
          shuffle_questions: boolean
          time_limit_seconds: number | null
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          lesson_id: string
          max_attempts?: number
          passing_score?: number
          show_correct_after?: boolean
          shuffle_options?: boolean
          shuffle_questions?: boolean
          time_limit_seconds?: number | null
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          lesson_id?: string
          max_attempts?: number
          passing_score?: number
          show_correct_after?: boolean
          shuffle_options?: boolean
          shuffle_questions?: boolean
          time_limit_seconds?: number | null
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      reinforcement_questions: {
        Row: {
          correct_answer: Json
          created_at: string
          difficulty_level: number
          display_order: number
          feedback_correct: string
          feedback_incorrect: string
          id: string
          lesson_id: string
          options: Json
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          correct_answer: Json
          created_at?: string
          difficulty_level?: number
          display_order: number
          feedback_correct: string
          feedback_incorrect: string
          id?: string
          lesson_id: string
          options: Json
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          correct_answer?: Json
          created_at?: string
          difficulty_level?: number
          display_order?: number
          feedback_correct?: string
          feedback_incorrect?: string
          id?: string
          lesson_id?: string
          options?: Json
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reinforcement_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      review_cards: {
        Row: {
          created_at: string
          difficulty: number
          due_at: string
          elapsed_days: number
          id: string
          lapses: number
          last_reviewed_at: string | null
          question_id: string
          reps: number
          scheduled_days: number
          stability: number
          state: number
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty?: number
          due_at?: string
          elapsed_days?: number
          id?: string
          lapses?: number
          last_reviewed_at?: string | null
          question_id: string
          reps?: number
          scheduled_days?: number
          stability?: number
          state?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty?: number
          due_at?: string
          elapsed_days?: number
          id?: string
          lapses?: number
          last_reviewed_at?: string | null
          question_id?: string
          reps?: number
          scheduled_days?: number
          stability?: number
          state?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_cards_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_logs: {
        Row: {
          card_id: string
          difficulty_before: number
          elapsed_days: number
          id: string
          rating: Database["public"]["Enums"]["review_rating"]
          reviewed_at: string
          scheduled_days: number
          stability_before: number
          state_before: number
          student_id: string
        }
        Insert: {
          card_id: string
          difficulty_before: number
          elapsed_days: number
          id?: string
          rating: Database["public"]["Enums"]["review_rating"]
          reviewed_at?: string
          scheduled_days: number
          stability_before: number
          state_before: number
          student_id: string
        }
        Update: {
          card_id?: string
          difficulty_before?: number
          elapsed_days?: number
          id?: string
          rating?: Database["public"]["Enums"]["review_rating"]
          reviewed_at?: string
          scheduled_days?: number
          stability_before?: number
          state_before?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_logs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "review_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          student_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          student_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_stats: {
        Row: {
          average_quiz_score: number
          created_at: string
          current_level: number
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          student_id: string
          total_lessons_completed: number
          total_quizzes_completed: number
          total_time_seconds: number
          total_xp: number
          updated_at: string
        }
        Insert: {
          average_quiz_score?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          student_id: string
          total_lessons_completed?: number
          total_quizzes_completed?: number
          total_time_seconds?: number
          total_xp?: number
          updated_at?: string
        }
        Update: {
          average_quiz_score?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          student_id?: string
          total_lessons_completed?: number
          total_quizzes_completed?: number
          total_time_seconds?: number
          total_xp?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_stats_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string
          display_order: number
          icon_url: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon_url?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon_url?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_published: boolean
          slug: string
          title: string
          total_lessons: number
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          display_order: number
          id?: string
          is_published?: boolean
          slug: string
          title: string
          total_lessons?: number
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          total_lessons?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_streak: { Args: { p_student_id: string }; Returns: number }
      get_adaptive_path: {
        Args: { p_lesson_id: string; p_score_percent: number }
        Returns: Json
      }
    }
    Enums: {
      adaptive_path: "refuerzo" | "normal" | "desafio"
      content_gen_status:
        | "pendiente"
        | "generando"
        | "revision"
        | "aprobado"
        | "rechazado"
      enrollment_status:
        | "pendiente"
        | "activa"
        | "suspendida"
        | "cancelada"
        | "completada"
      grade_level:
        | "5_basico"
        | "6_basico"
        | "7_basico"
        | "8_basico"
        | "1_medio"
        | "2_medio"
        | "3_medio"
        | "4_medio"
      lesson_type: "video" | "texto" | "mixto"
      notification_type:
        | "pago_pendiente"
        | "pago_confirmado"
        | "pago_fallido"
        | "progreso_bajo"
        | "logro_obtenido"
        | "leccion_completada"
        | "quiz_completado"
        | "repaso_pendiente"
        | "matricula_aprobada"
      payment_method: "transbank" | "khipu" | "transferencia_manual"
      payment_status:
        | "pendiente"
        | "pagado"
        | "fallido"
        | "reembolsado"
        | "vencido"
      question_type:
        | "opcion_multiple"
        | "verdadero_falso"
        | "completar"
        | "ordenar"
        | "asociar"
      review_rating: "again" | "hard" | "good" | "easy"
      user_role: "estudiante" | "apoderado" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      adaptive_path: ["refuerzo", "normal", "desafio"],
      content_gen_status: [
        "pendiente",
        "generando",
        "revision",
        "aprobado",
        "rechazado",
      ],
      enrollment_status: [
        "pendiente",
        "activa",
        "suspendida",
        "cancelada",
        "completada",
      ],
      grade_level: [
        "5_basico",
        "6_basico",
        "7_basico",
        "8_basico",
        "1_medio",
        "2_medio",
        "3_medio",
        "4_medio",
      ],
      lesson_type: ["video", "texto", "mixto"],
      notification_type: [
        "pago_pendiente",
        "pago_confirmado",
        "pago_fallido",
        "progreso_bajo",
        "logro_obtenido",
        "leccion_completada",
        "quiz_completado",
        "repaso_pendiente",
        "matricula_aprobada",
      ],
      payment_method: ["transbank", "khipu", "transferencia_manual"],
      payment_status: [
        "pendiente",
        "pagado",
        "fallido",
        "reembolsado",
        "vencido",
      ],
      question_type: [
        "opcion_multiple",
        "verdadero_falso",
        "completar",
        "ordenar",
        "asociar",
      ],
      review_rating: ["again", "hard", "good", "easy"],
      user_role: ["estudiante", "apoderado", "admin"],
    },
  },
} as const
