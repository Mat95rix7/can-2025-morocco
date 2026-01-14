import { Match, TeamWithRankings, WorldTeam } from "@/types/types";
import { supabaseServer } from "./supabase/server";
import { CAF_COEFFICIENT, PHASE_IMPORTANCE } from "@/types/constants";

export async function getTeamsWithMatches() {
  const supabase = await supabaseServer();
  const { data: teams, error: teamsError } = await supabase
    .from('teams_with_fifa_ranking')
    .select('*')
    .order('fifa_rank_before', { ascending: true });

  if (teamsError) {
    console.error('Error fetching teams:', teamsError);
    return { teams: [], matches: [], worldRankings: [] };
  }

  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      match_date,
      phase,
      stadium,
      status,
      group_name,
      home_team:teams!matches_home_team_id_fkey(
        id,
        name,
        code,
        group_name,
        flag_url,
        fifa_points_before,
        fifa_rank_before
      ),
      away_team:teams!matches_away_team_id_fkey(
        id,
        name,
        code,
        group_name,
        flag_url,
        fifa_points_before,
        fifa_rank_before
      )
    `)
    .in('status', ['finished', 'live'])
    .returns<Match[]>();

  if (matchesError) {
    console.error('Error fetching matches:', matchesError);
    return { teams: teams || [], matches: [], worldRankings: [] };
  }

  const { data: worldRankings, error: worldError } = await supabase
    .from('fifa_world_rankings')
    .select('id,rank, name, country_code, points, previous_points, confederation, flag_url, previous_rank')
    .order('rank', { ascending: true });

  if (worldError) console.error('Error fetching world rankings:', worldError);

  const safeMatches: Match[] = (matches || []).map((m) => ({
    ...m,
    home_score: m.home_score ?? 0,
    away_score: m.away_score ?? 0,
    phase: m.phase ?? '',
    status: m.status ?? 'unknown',
  }));

  return {
    teams: (teams || []) as TeamWithRankings[],
    matches: safeMatches,
    worldRankings: (worldRankings || []) as WorldTeam[],
  };
}

export function calculateCurrentPoints(
  team: TeamWithRankings,
  matches: Match[]
): { currentPoints: number; pointsGained: number; matchesPlayed: number } {
  let pointsGained = 0;
  let matchesPlayed = 0;
  let currentPoints = team.fifa_points_before;

  const sortedMatches = matches
    .filter(match => match.home_team_id === team.id || match.away_team_id === team.id)
    .slice()
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  sortedMatches.forEach((match) => {
    const isHome = match.home_team_id === team.id;
    const isAway = match.away_team_id === team.id;
    if (!isHome && !isAway) return;
    if (match.home_score === null || match.away_score === null) return;

    matchesPlayed++;

    let result: 'win' | 'draw' | 'loss';
    if (isHome) {
      if (match.home_score > match.away_score) result = 'win';
      else if (match.home_score === match.away_score) result = 'draw';
      else result = 'loss';
    } else {
      if (match.away_score > match.home_score) result = 'win';
      else if (match.away_score === match.home_score) result = 'draw';
      else result = 'loss';
    }

    const opponentPoints = isHome
      ? match.away_team?.fifa_points_before || 1500
      : match.home_team?.fifa_points_before || 1500;

    const W_actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    const I = PHASE_IMPORTANCE[match.phase] || 35;
    const W_expected = 1 / (10 ** ((opponentPoints - currentPoints) / 600) + 1);
    let matchPoints = I * (W_actual - W_expected) * CAF_COEFFICIENT;

    matchPoints = Math.round(matchPoints * 100) / 100;
    pointsGained += matchPoints;
    currentPoints = Math.round((currentPoints + matchPoints) * 100) / 100;
  });

  return {
    currentPoints,
    pointsGained: Math.round(pointsGained * 100) / 100,
    matchesPlayed
  };
}

export function calculateWorldRank(
  teamCode: string,
  currentPoints: number,
  worldRankings: WorldTeam[]
): { worldRank: number; initialWorldRank: number } {
  const initialTeam = worldRankings.find((t) => t.country_code === teamCode);
  const initialWorldRank = initialTeam?.rank || 0;

  let worldRank = 1;
  for (const team of worldRankings) {
    if (team.country_code === teamCode) continue;
    if (currentPoints >= team.points) break;
    worldRank++;
  }

  return { worldRank, initialWorldRank };
}




