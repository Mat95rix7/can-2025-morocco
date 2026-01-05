// ==================== TYPES ====================
export interface Match {
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
  home_team?: Team;
  away_team?: Team;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  flag_url: string | null;
  group_name: string | null;
  fifa_rank_before: number | null;
  fifa_points_before: number | null;
}

export interface Player {
  id: string;
  name: string;
  team_id: string | null;
  position: string | null;
  number: number | null;
  team?: Team;
}