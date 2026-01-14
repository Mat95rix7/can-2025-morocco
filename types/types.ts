// ==================== TYPES ====================
export interface Match {
  id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  phase: string;
  stadium: string | null;
  status: string;
  group_name: string | null;
  home_team?: Team | null;
  away_team?: Team | null;
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
  firstname: string;
  lastname: string;
  team_id: string | null;
  position: string | null;
  number: number | null;
  team?: Team;
  club?: string | null;
  birth_date: string | null;
  birth_place: string | null;
  height: number | null;
  photo?: string | null;
}

export type TeamWithRankings = {
  id: string;
  name: string;
  code: string;
  group_name: string | null;
  fifa_points_before: number;
  fifa_rank_before: number | null;
  fifa_flag_url: string | null;
  fifa_rank: number | null;
  fifa_previous_rank: number | null;
  fifa_previous_points: number | null;
  fifa_confederation: string | null;
  created_at: string;
  flag_url?: string;
};

export type WorldTeam = {
  id: string;
  rank: number;
  name: string;
  country_code: string;
  points: number;
  confederation: string;
  flag_url: string | null;
  previous_rank: number;
  previous_points: number;
};

export type TeamWithCalculations = TeamWithRankings & {
  currentPoints: number;
  pointsGained: number;
  matchesPlayed: number;
  worldRank: number;
  initialWorldRank: number;
  newAfricaRank: number;
  africaRankChange: number;
  worldRankChange: number;
};