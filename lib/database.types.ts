export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          code: string;
          flag_url: string | null;
          group_name: string | null;
          fifa_points_before: number;
          fifa_rank_before: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          flag_url?: string | null;
          group_name?: string | null;
          fifa_points_before?: number;
          fifa_rank_before?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          flag_url?: string | null;
          group_name?: string | null;
          fifa_points_before?: number;
          fifa_rank_before?: number | null;
          created_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          home_team_id: string | null;
          away_team_id: string | null;
          home_score: number;
          away_score: number;
          match_date: string;
          phase: string;
          stadium: string | null;
          status: string;
          group_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          home_team_id?: string | null;
          away_team_id?: string | null;
          home_score?: number;
          away_score?: number;
          match_date: string;
          phase?: string;
          stadium?: string | null;
          status?: string;
          group_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          home_team_id?: string | null;
          away_team_id?: string | null;
          home_score?: number;
          away_score?: number;
          match_date?: string;
          phase?: string;
          stadium?: string | null;
          status?: string;
          group_name?: string | null;
          created_at?: string;
        };
      };
      standings: {
        Row: {
          id: string;
          team_id: string | null;
          group_name: string;
          played: number;
          wins: number;
          draws: number;
          losses: number;
          goals_for: number;
          goals_against: number;
          goal_difference: number;
          points: number;
          position: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id?: string | null;
          group_name: string;
          played?: number;
          wins?: number;
          draws?: number;
          losses?: number;
          goals_for?: number;
          goals_against?: number;
          goal_difference?: number;
          points?: number;
          position?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string | null;
          group_name?: string;
          played?: number;
          wins?: number;
          draws?: number;
          losses?: number;
          goals_for?: number;
          goals_against?: number;
          goal_difference?: number;
          points?: number;
          position?: number;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          firstname: string;
          lastname: string;
          team_id: string | null;
          position: string | null;
          number: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          firstname: string;
          lastname: string; 
          team_id?: string | null;
          position?: string | null;
          number?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          firstname?: string; 
          lastname?: string;
          team_id?: string | null;
          position?: string | null;
          number?: number | null;
          created_at?: string;
        };
      };
      match_stats: {
        Row: {
          id: string;
          match_id: string | null;
          team_id: string | null;
          possession: number;
          shots: number;
          shots_on_target: number;
          yellow_cards: number;
          red_cards: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id?: string | null;
          team_id?: string | null;
          possession?: number;
          shots?: number;
          shots_on_target?: number;
          yellow_cards?: number;
          red_cards?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string | null;
          team_id?: string | null;
          possession?: number;
          shots?: number;
          shots_on_target?: number;
          yellow_cards?: number;
          red_cards?: number;
          created_at?: string;
        };
      };
      player_stats: {
        Row: {
          id: string;
          match_id: string | null;
          player_id: string | null;
          goals: number;
          assists: number;
          yellow_card: boolean;
          red_card: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id?: string | null;
          player_id?: string | null;
          goals?: number;
          assists?: number;
          yellow_card?: boolean;
          red_card?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string | null;
          player_id?: string | null;
          goals?: number;
          assists?: number;
          yellow_card?: boolean;
          red_card?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
