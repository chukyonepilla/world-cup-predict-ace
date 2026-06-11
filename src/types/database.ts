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
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          is_admin: boolean
          timezone: string
          notification_preferences: Json | null
        }
        Insert: {
          id: string
          email: string
          display_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          timezone?: string
          notification_preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          timezone?: string
          notification_preferences?: Json | null
        }
      }
      leagues: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          max_members: number
          created_by: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          max_members?: number
          created_by: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          max_members?: number
          created_by?: string
          created_at?: string
          is_active?: boolean
        }
      }
      league_members: {
        Row: {
          id: string
          league_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          league_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          league_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
          is_active?: boolean
        }
      }
      matches: {
        Row: {
          id: string
          fifa_match_id: string | null
          home_team: string
          away_team: string
          home_team_flag: string | null
          away_team_flag: string | null
          kickoff_time: string
          stage: 'group' | 'round16' | 'quarter' | 'semi' | 'third_place' | 'final'
          group_label: string | null
          venue: string | null
          status: 'scheduled' | 'live' | 'finished' | 'postponed'
          prediction_window_open: string
          prediction_window_close: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fifa_match_id?: string | null
          home_team: string
          away_team: string
          home_team_flag?: string | null
          away_team_flag?: string | null
          kickoff_time: string
          stage: 'group' | 'round16' | 'quarter' | 'semi' | 'third_place' | 'final'
          group_label?: string | null
          venue?: string | null
          status?: 'scheduled' | 'live' | 'finished' | 'postponed'
          prediction_window_open: string
          prediction_window_close: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fifa_match_id?: string | null
          home_team?: string
          away_team?: string
          home_team_flag?: string | null
          away_team_flag?: string | null
          kickoff_time?: string
          stage?: 'group' | 'round16' | 'quarter' | 'semi' | 'third_place' | 'final'
          group_label?: string | null
          venue?: string | null
          status?: 'scheduled' | 'live' | 'finished' | 'postponed'
          prediction_window_open?: string
          prediction_window_close?: string
          created_at?: string
          updated_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          match_id: string
          user_id: string
          league_id: string
          home_score: number
          away_score: number
          bonus_type: 'penalty' | 'red_card'
          bonus_prediction: boolean
          extra_time_prediction: boolean | null
          penalty_shootout_prediction: boolean | null
          eventual_winner: 'home' | 'away' | null
          submitted_at: string
          is_locked: boolean
          points_earned: number
          points_breakdown: Json | null
        }
        Insert: {
          id?: string
          match_id: string
          user_id: string
          league_id: string
          home_score: number
          away_score: number
          bonus_type: 'penalty' | 'red_card'
          bonus_prediction: boolean
          extra_time_prediction?: boolean | null
          penalty_shootout_prediction?: boolean | null
          eventual_winner?: 'home' | 'away' | null
          submitted_at?: string
          is_locked?: boolean
          points_earned?: number
          points_breakdown?: Json | null
        }
        Update: {
          id?: string
          match_id?: string
          user_id?: string
          league_id?: string
          home_score?: number
          away_score?: number
          bonus_type?: 'penalty' | 'red_card'
          bonus_prediction?: boolean
          extra_time_prediction?: boolean | null
          penalty_shootout_prediction?: boolean | null
          eventual_winner?: 'home' | 'away' | null
          submitted_at?: string
          is_locked?: boolean
          points_earned?: number
          points_breakdown?: Json | null
        }
      }
      match_results: {
        Row: {
          id: string
          match_id: string
          home_score: number
          away_score: number
          penalty_occurred: boolean
          red_card_occurred: boolean
          extra_time_played: boolean
          penalty_shootout_occurred: boolean
          eventual_winner: 'home' | 'away' | 'draw' | null
          entered_by: string
          entered_at: string
          scoring_completed: boolean
        }
        Insert: {
          id?: string
          match_id: string
          home_score: number
          away_score: number
          penalty_occurred?: boolean
          red_card_occurred?: boolean
          extra_time_played?: boolean
          penalty_shootout_occurred?: boolean
          eventual_winner?: 'home' | 'away' | 'draw' | null
          entered_by: string
          entered_at?: string
          scoring_completed?: boolean
        }
        Update: {
          id?: string
          match_id?: string
          home_score?: number
          away_score?: number
          penalty_occurred?: boolean
          red_card_occurred?: boolean
          extra_time_played?: boolean
          penalty_shootout_occurred?: boolean
          eventual_winner?: 'home' | 'away' | 'draw' | null
          entered_by?: string
          entered_at?: string
          scoring_completed?: boolean
        }
      }
      rankings: {
        Row: {
          id: string
          league_id: string
          user_id: string
          total_points: number
          group_stage_points: number
          knockout_points: number
          current_rank: number
          previous_rank: number | null
          exact_scores_count: number
          correct_outcomes_count: number
          correct_bonus_count: number
          correct_extra_time_count: number
          correct_shootout_count: number
          highest_round_score: number
          current_streak: number
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          user_id: string
          total_points?: number
          group_stage_points?: number
          knockout_points?: number
          current_rank?: number
          previous_rank?: number | null
          exact_scores_count?: number
          correct_outcomes_count?: number
          correct_bonus_count?: number
          correct_extra_time_count?: number
          correct_shootout_count?: number
          highest_round_score?: number
          current_streak?: number
          updated_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          user_id?: string
          total_points?: number
          group_stage_points?: number
          knockout_points?: number
          current_rank?: number
          previous_rank?: number | null
          exact_scores_count?: number
          correct_outcomes_count?: number
          correct_bonus_count?: number
          correct_extra_time_count?: number
          correct_shootout_count?: number
          highest_round_score?: number
          current_streak?: number
          updated_at?: string
        }
      }
      statistics: {
        Row: {
          id: string
          user_id: string
          league_id: string
          total_predictions: number
          prediction_accuracy: number | null
          exact_score_rate: number | null
          bonus_accuracy: number | null
          average_points_per_match: number | null
          best_match_score: number
          worst_match_score: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          league_id: string
          total_predictions?: number
          prediction_accuracy?: number | null
          exact_score_rate?: number | null
          bonus_accuracy?: number | null
          average_points_per_match?: number | null
          best_match_score?: number
          worst_match_score?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          league_id?: string
          total_predictions?: number
          prediction_accuracy?: number | null
          exact_score_rate?: number | null
          bonus_accuracy?: number | null
          average_points_per_match?: number | null
          best_match_score?: number
          worst_match_score?: number
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          changes: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}
