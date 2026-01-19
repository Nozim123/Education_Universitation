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
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      arena_answers: {
        Row: {
          answer_time_ms: number
          created_at: string | null
          id: string
          is_correct: boolean
          points_earned: number | null
          question_id: string
          selected_option_id: string
          session_id: string
          user_id: string
        }
        Insert: {
          answer_time_ms: number
          created_at?: string | null
          id?: string
          is_correct: boolean
          points_earned?: number | null
          question_id: string
          selected_option_id: string
          session_id: string
          user_id: string
        }
        Update: {
          answer_time_ms?: number
          created_at?: string | null
          id?: string
          is_correct?: boolean
          points_earned?: number | null
          question_id?: string
          selected_option_id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arena_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "arena_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arena_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "arena_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arena_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      arena_participants: {
        Row: {
          best_streak: number | null
          correct_answers: number | null
          current_streak: number | null
          id: string
          joined_at: string | null
          rank: number | null
          score: number | null
          session_id: string
          user_id: string
          wrong_answers: number | null
        }
        Insert: {
          best_streak?: number | null
          correct_answers?: number | null
          current_streak?: number | null
          id?: string
          joined_at?: string | null
          rank?: number | null
          score?: number | null
          session_id: string
          user_id: string
          wrong_answers?: number | null
        }
        Update: {
          best_streak?: number | null
          correct_answers?: number | null
          current_streak?: number | null
          id?: string
          joined_at?: string | null
          rank?: number | null
          score?: number | null
          session_id?: string
          user_id?: string
          wrong_answers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "arena_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "arena_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arena_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      arena_questions: {
        Row: {
          correct_option_id: string
          created_at: string | null
          id: string
          options: Json
          order_index: number
          points: number | null
          question_text: string
          session_id: string
        }
        Insert: {
          correct_option_id: string
          created_at?: string | null
          id?: string
          options: Json
          order_index: number
          points?: number | null
          question_text: string
          session_id: string
        }
        Update: {
          correct_option_id?: string
          created_at?: string | null
          id?: string
          options?: Json
          order_index?: number
          points?: number | null
          question_text?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arena_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "arena_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      arena_sessions: {
        Row: {
          category_id: string | null
          created_at: string | null
          current_question: number | null
          description: string | null
          ended_at: string | null
          host_id: string | null
          id: string
          max_participants: number | null
          question_time_seconds: number | null
          started_at: string | null
          status: string
          title: string
          total_questions: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          current_question?: number | null
          description?: string | null
          ended_at?: string | null
          host_id?: string | null
          id?: string
          max_participants?: number | null
          question_time_seconds?: number | null
          started_at?: string | null
          status?: string
          title: string
          total_questions?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          current_question?: number | null
          description?: string | null
          ended_at?: string | null
          host_id?: string | null
          id?: string
          max_participants?: number | null
          question_time_seconds?: number | null
          started_at?: string | null
          status?: string
          title?: string
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "arena_sessions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arena_sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          category_id: string | null
          comment_count: number | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_featured: boolean | null
          is_research: boolean | null
          like_count: number | null
          points_value: number | null
          read_time: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          comment_count?: number | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_research?: boolean | null
          like_count?: number | null
          points_value?: number | null
          read_time?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          comment_count?: number | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          is_research?: boolean | null
          like_count?: number | null
          points_value?: number | null
          read_time?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
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
      challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          points_reward: number
          start_date: string
          target_value: number
          title: string
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          points_reward: number
          start_date: string
          target_value: number
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          points_reward?: number
          start_date?: string
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string | null
          content: string
          created_at: string | null
          id: string
          like_count: number | null
          parent_id: string | null
          updated_at: string | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          article_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          article_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          is_group: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      directions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          university_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          university_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directions_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      duel_rounds: {
        Row: {
          challenger_answer: string | null
          challenger_time_ms: number | null
          correct_option_id: string
          created_at: string | null
          duel_id: string
          id: string
          opponent_answer: string | null
          opponent_time_ms: number | null
          options: Json
          question_text: string
          round_number: number
          round_winner_id: string | null
        }
        Insert: {
          challenger_answer?: string | null
          challenger_time_ms?: number | null
          correct_option_id: string
          created_at?: string | null
          duel_id: string
          id?: string
          opponent_answer?: string | null
          opponent_time_ms?: number | null
          options: Json
          question_text: string
          round_number: number
          round_winner_id?: string | null
        }
        Update: {
          challenger_answer?: string | null
          challenger_time_ms?: number | null
          correct_option_id?: string
          created_at?: string | null
          duel_id?: string
          id?: string
          opponent_answer?: string | null
          opponent_time_ms?: number | null
          options?: Json
          question_text?: string
          round_number?: number
          round_winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duel_rounds_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "skill_duels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_rounds_round_winner_id_fkey"
            columns: ["round_winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      duel_spectators: {
        Row: {
          duel_id: string
          id: string
          joined_at: string | null
          user_id: string
          vote_for: string | null
        }
        Insert: {
          duel_id: string
          id?: string
          joined_at?: string | null
          user_id: string
          vote_for?: string | null
        }
        Update: {
          duel_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
          vote_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duel_spectators_duel_id_fkey"
            columns: ["duel_id"]
            isOneToOne: false
            referencedRelation: "skill_duels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_spectators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duel_spectators_vote_for_fkey"
            columns: ["vote_for"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          answers: Json | null
          band_score: number | null
          cefr_level: string | null
          completed_at: string | null
          created_at: string
          id: string
          max_score: number | null
          score: number | null
          started_at: string
          status: string | null
          test_id: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          band_score?: number | null
          cefr_level?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          score?: number | null
          started_at?: string
          status?: string | null
          test_id: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          band_score?: number | null
          cefr_level?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          score?: number | null
          started_at?: string
          status?: string | null
          test_id?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "exam_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_progress: {
        Row: {
          created_at: string
          current_band: number | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          last_activity_at: string | null
          listening_score: number | null
          math_score: number | null
          reading_score: number | null
          speaking_score: number | null
          target_band: number | null
          tests_completed: number | null
          total_study_minutes: number | null
          updated_at: string
          user_id: string
          writing_score: number | null
        }
        Insert: {
          created_at?: string
          current_band?: number | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id?: string
          last_activity_at?: string | null
          listening_score?: number | null
          math_score?: number | null
          reading_score?: number | null
          speaking_score?: number | null
          target_band?: number | null
          tests_completed?: number | null
          total_study_minutes?: number | null
          updated_at?: string
          user_id: string
          writing_score?: number | null
        }
        Update: {
          created_at?: string
          current_band?: number | null
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          last_activity_at?: string | null
          listening_score?: number | null
          math_score?: number | null
          reading_score?: number | null
          speaking_score?: number | null
          target_band?: number | null
          tests_completed?: number | null
          total_study_minutes?: number | null
          updated_at?: string
          user_id?: string
          writing_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          audio_url: string | null
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          image_url: string | null
          options: Json | null
          order_index: number | null
          points: number | null
          question_text: string
          question_type: string
          test_id: string
        }
        Insert: {
          audio_url?: string | null
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text: string
          question_type?: string
          test_id: string
        }
        Update: {
          audio_url?: string | null
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text?: string
          question_type?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "exam_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_tests: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          is_mock_exam: boolean | null
          points_value: number | null
          section: string
          title: string
          total_questions: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_mock_exam?: boolean | null
          points_value?: number | null
          section: string
          title: string
          total_questions?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_mock_exam?: boolean | null
          points_value?: number | null
          section?: string
          title?: string
          total_questions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          article_id: string | null
          comment_id: string | null
          created_at: string | null
          id: string
          user_id: string
          video_id: string | null
        }
        Insert: {
          article_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          user_id: string
          video_id?: string | null
        }
        Update: {
          article_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_queue: {
        Row: {
          accepted_at: string | null
          category_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          estimated_wait_minutes: number | null
          id: string
          mentor_id: string | null
          priority: number | null
          queue_position: number | null
          started_at: string | null
          status: string
          student_id: string
          topic: string
        }
        Insert: {
          accepted_at?: string | null
          category_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_wait_minutes?: number | null
          id?: string
          mentor_id?: string | null
          priority?: number | null
          queue_position?: number | null
          started_at?: string | null
          status?: string
          student_id: string
          topic: string
        }
        Update: {
          accepted_at?: string | null
          category_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_wait_minutes?: number | null
          id?: string
          mentor_id?: string | null
          priority?: number | null
          queue_position?: number | null
          started_at?: string | null
          status?: string
          student_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_queue_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_queue_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_queue_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          file_url: string | null
          id: string
          message_type: string | null
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string
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
      profiles: {
        Row: {
          account_number: string | null
          article_points: number | null
          avatar_url: string | null
          bio: string | null
          challenge_points: number | null
          created_at: string | null
          direction_id: string | null
          email: string | null
          first_name: string | null
          id: string
          is_online: boolean | null
          last_name: string | null
          last_seen: string | null
          project_points: number | null
          referral_balance: number | null
          referral_code: string | null
          referred_by: string | null
          total_points: number | null
          university_id: string | null
          updated_at: string | null
          video_points: number | null
          wallet_balance: number | null
        }
        Insert: {
          account_number?: string | null
          article_points?: number | null
          avatar_url?: string | null
          bio?: string | null
          challenge_points?: number | null
          created_at?: string | null
          direction_id?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_online?: boolean | null
          last_name?: string | null
          last_seen?: string | null
          project_points?: number | null
          referral_balance?: number | null
          referral_code?: string | null
          referred_by?: string | null
          total_points?: number | null
          university_id?: string | null
          updated_at?: string | null
          video_points?: number | null
          wallet_balance?: number | null
        }
        Update: {
          account_number?: string | null
          article_points?: number | null
          avatar_url?: string | null
          bio?: string | null
          challenge_points?: number | null
          created_at?: string | null
          direction_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_online?: boolean | null
          last_name?: string | null
          last_seen?: string | null
          project_points?: number | null
          referral_balance?: number | null
          referral_code?: string | null
          referred_by?: string | null
          total_points?: number | null
          university_id?: string | null
          updated_at?: string | null
          video_points?: number | null
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      project_participants: {
        Row: {
          completed_at: string | null
          id: string
          joined_at: string | null
          points_earned: number | null
          project_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          points_earned?: number | null
          project_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          points_earned?: number | null
          project_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category_id: string | null
          created_at: string | null
          creator_id: string
          current_participants: number | null
          deadline: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          id: string
          max_participants: number | null
          points_value: number | null
          requirements: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          creator_id: string
          current_participants?: number | null
          deadline?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          id?: string
          max_participants?: number | null
          points_value?: number | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          creator_id?: string
          current_participants?: number | null
          deadline?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          id?: string
          max_participants?: number | null
          points_value?: number | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          rating: number
          user_id: string
          video_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          rating: number
          user_id: string
          video_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_duels: {
        Row: {
          category_id: string | null
          challenger_id: string
          challenger_score: number | null
          created_at: string | null
          current_round: number | null
          ended_at: string | null
          id: string
          opponent_id: string | null
          opponent_score: number | null
          round_time_seconds: number | null
          stake_points: number | null
          started_at: string | null
          status: string
          total_rounds: number | null
          winner_id: string | null
        }
        Insert: {
          category_id?: string | null
          challenger_id: string
          challenger_score?: number | null
          created_at?: string | null
          current_round?: number | null
          ended_at?: string | null
          id?: string
          opponent_id?: string | null
          opponent_score?: number | null
          round_time_seconds?: number | null
          stake_points?: number | null
          started_at?: string | null
          status?: string
          total_rounds?: number | null
          winner_id?: string | null
        }
        Update: {
          category_id?: string | null
          challenger_id?: string
          challenger_score?: number | null
          created_at?: string | null
          current_round?: number | null
          ended_at?: string | null
          id?: string
          opponent_id?: string | null
          opponent_score?: number | null
          round_time_seconds?: number | null
          stake_points?: number | null
          started_at?: string | null
          status?: string
          total_rounds?: number | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_duels_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_duels_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_duels_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_duels_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          student_count: number | null
          total_points: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          student_count?: number | null
          total_points?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          student_count?: number | null
          total_points?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          current_activity: string | null
          current_page: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          session_started: string | null
          user_id: string
        }
        Insert: {
          current_activity?: string | null
          current_page?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          session_started?: string | null
          user_id: string
        }
        Update: {
          current_activity?: string | null
          current_page?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          session_started?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_views: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          user_id: string | null
          video_id: string
          watch_duration: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          user_id?: string | null
          video_id: string
          watch_duration?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          user_id?: string | null
          video_id?: string
          watch_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          author_id: string
          category_id: string | null
          comment_count: number | null
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          duration: number | null
          id: string
          is_featured: boolean | null
          like_count: number | null
          points_value: number | null
          rating_count: number | null
          rating_sum: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          duration?: number | null
          id?: string
          is_featured?: boolean | null
          like_count?: number | null
          points_value?: number | null
          rating_count?: number | null
          rating_sum?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          duration?: number | null
          id?: string
          is_featured?: boolean | null
          like_count?: number | null
          points_value?: number | null
          rating_count?: number | null
          rating_sum?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "mentor" | "admin"
      content_status: "draft" | "pending" | "published" | "rejected"
      difficulty_level: "beginner" | "intermediate" | "advanced" | "expert"
      exam_type: "ielts" | "sat" | "cefr" | "toefl" | "topik" | "jlpt"
      message_status: "sent" | "delivered" | "read"
      project_status: "open" | "in_progress" | "completed" | "cancelled"
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
      app_role: ["student", "mentor", "admin"],
      content_status: ["draft", "pending", "published", "rejected"],
      difficulty_level: ["beginner", "intermediate", "advanced", "expert"],
      exam_type: ["ielts", "sat", "cefr", "toefl", "topik", "jlpt"],
      message_status: ["sent", "delivered", "read"],
      project_status: ["open", "in_progress", "completed", "cancelled"],
    },
  },
} as const
