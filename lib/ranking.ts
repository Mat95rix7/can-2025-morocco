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

// export function calculateCurrentPoints(
//   team: TeamWithRankings,
//   matches: Match[]
// ): { currentPoints: number; pointsGained: number; matchesPlayed: number; debug: string[] } {
//   let pointsGained = 0;
//   let matchesPlayed = 0;
//   let currentPoints = team.fifa_points_before;
//   const debug: string[] = [];

//   debug.push(`=== CALCUL POUR ${team.name} ===`);
//   debug.push(`Points de départ: ${currentPoints}`);
//   debug.push('');

//   const sortedMatches = matches
//     .filter(match => match.home_team_id === team.id || match.away_team_id === team.id)
//     .slice()
//     .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

//   sortedMatches.forEach((match) => {
//     const isHome = match.home_team_id === team.id;
//     if (match.home_score === null || match.away_score === null) return;

//     matchesPlayed++;
//     debug.push(`--- Match ${matchesPlayed} (${match.phase}) ---`);

//     // Simple : tout ce qui n'est pas "group" est knockout
//     const isKnockout = match.phase !== 'group';
    
//     // Déterminer le résultat
//     const teamScore = isHome ? match.home_score : match.away_score;
//     const opponentScore = isHome ? match.away_score : match.home_score;
//     const opponentName = isHome ? match.away_team?.name : match.home_team?.name;
    
//     debug.push(`${team.name} ${teamScore}-${opponentScore} ${opponentName}`);
    
//     let result: 'win' | 'draw' | 'loss';
//     if (teamScore > opponentScore) {
//       result = 'win';
//     } else if (teamScore === opponentScore) {
//       result = 'draw';
//     } else {
//       result = 'loss';
//     }

//     debug.push(`Résultat: ${result.toUpperCase()}`);

//     // RÈGLE CAN : Pas de perte de points en élimination directe
//     if (isKnockout && result === 'loss') {
//       debug.push('⚠️ DÉFAITE EN KNOCKOUT → Pas de calcul de points');
//       debug.push(`Points inchangés: ${currentPoints}`);
//       debug.push('');
//       return;
//     }

//     const opponentPoints = isHome
//       ? (match.away_team?.fifa_points_before || 1500)
//       : (match.home_team?.fifa_points_before || 1500);

//     debug.push(`Points adversaire (before): ${opponentPoints}`);
//     debug.push(`Points ${team.name} (current): ${currentPoints}`);

//     // Formule FIFA
//     const W_actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
//     const I = PHASE_IMPORTANCE[match.phase] || 35;
    
//     const powerCalc = (opponentPoints - currentPoints) / 600;
//     const W_expected = 1 / (Math.pow(10, powerCalc) + 1);
    
//     debug.push(`W_actual: ${W_actual}`);
//     debug.push(`W_expected: ${W_expected.toFixed(4)}`);
//     debug.push(`I (importance): ${I}`);
//     debug.push(`CAF_COEFFICIENT: ${CAF_COEFFICIENT}`);
    
//     let matchPoints = I * (W_actual - W_expected) * CAF_COEFFICIENT;
//     matchPoints = Math.round(matchPoints * 100) / 100;
    
//     debug.push(`Calcul: ${I} × (${W_actual} - ${W_expected.toFixed(4)}) × ${CAF_COEFFICIENT} = ${matchPoints}`);
    
//     pointsGained += matchPoints;
//     currentPoints += matchPoints;
//     currentPoints = Math.round(currentPoints * 100) / 100;
    
//     debug.push(`Points gagnés ce match: ${matchPoints > 0 ? '+' : ''}${matchPoints}`);
//     debug.push(`Nouveau total: ${currentPoints}`);
//     debug.push('');
//   });

//   debug.push('=== RÉSUMÉ ===');
//   debug.push(`Points départ: ${team.fifa_points_before}`);
//   debug.push(`Points finaux: ${currentPoints}`);
//   debug.push(`Total gagné: ${pointsGained > 0 ? '+' : ''}${pointsGained}`);
//   debug.push(`Matchs joués: ${matchesPlayed}`);

//   return {
//     currentPoints,
//     pointsGained: Math.round(pointsGained * 100) / 100,
//     matchesPlayed,
//     debug
//   };
// }

// Fonction pour afficher le debug
export function logDebugInfo(result: ReturnType<typeof calculateCurrentPoints>) {
  console.log(result.debug.join('\n'));
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

// Dates officielles du tournoi et du classement FIFA
const TOURNAMENT_END_DATE = "2026-01-18";  // Finale de la CAN 2025
const NEXT_FIFA_RANKING_DATE = "2026-01-19"; // Publication du classement FIFA post-CAN

export function calculateCurrentPoints(
  team: TeamWithRankings,
  matches: Match[]
): { currentPoints: number; pointsGained: number; matchesPlayed: number; debug: string[] } {
  let pointsGained = 0;
  let matchesPlayed = 0;
  let currentPoints = team.fifa_points_before;
  const debug: string[] = [];

  debug.push(`=== CALCUL POUR ${team.name} ===`);
  debug.push(`Points FIFA de départ (avant CAN): ${currentPoints}`);
  debug.push(`Période du tournoi: jusqu'au ${TOURNAMENT_END_DATE}`);
  debug.push(`Prochain classement FIFA: ${NEXT_FIFA_RANKING_DATE}`);
  debug.push('');

  const tournamentEnd = new Date(TOURNAMENT_END_DATE);
  tournamentEnd.setHours(23, 59, 59, 999); // Inclure toute la journée

  const sortedMatches = matches
    .filter(match => {
      const matchDate = new Date(match.match_date);
      const isTeamMatch = match.home_team_id === team.id || match.away_team_id === team.id;
      
      // Ne comptabiliser que les matchs jusqu'à la fin du tournoi
      return isTeamMatch && matchDate <= tournamentEnd;
    })
    .slice()
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  debug.push(`⚠️ Calcul limité aux matchs jusqu'au ${TOURNAMENT_END_DATE}`);
  debug.push(`Nombre de matchs considérés: ${sortedMatches.length}`);
  debug.push('');

  sortedMatches.forEach((match) => {
    const isHome = match.home_team_id === team.id;
    if (match.home_score === null || match.away_score === null) return;

    matchesPlayed++;
    debug.push(`--- Match ${matchesPlayed} (${match.phase}) - ${new Date(match.match_date).toLocaleDateString('fr-FR')} ---`);

    // Simple : tout ce qui n'est pas "group" est knockout
    const isKnockout = match.phase !== 'group';
    
    // Déterminer le résultat
    const teamScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;
    const opponentName = isHome ? match.away_team?.name : match.home_team?.name;
    
    debug.push(`${team.name} ${teamScore}-${opponentScore} ${opponentName}`);
    
    let result: 'win' | 'draw' | 'loss';
    if (teamScore > opponentScore) {
      result = 'win';
    } else if (teamScore === opponentScore) {
      result = 'draw';
    } else {
      result = 'loss';
    }

    debug.push(`Résultat: ${result.toUpperCase()}`);

    // RÈGLE CAN : Pas de perte de points en élimination directe
    if (isKnockout && result === 'loss') {
      debug.push('⚠️ DÉFAITE EN KNOCKOUT → Pas de calcul de points');
      debug.push(`Points inchangés: ${currentPoints}`);
      debug.push('');
      return;
    }

    const opponentPoints = isHome
      ? (match.away_team?.fifa_points_before || 1500)
      : (match.home_team?.fifa_points_before || 1500);

    debug.push(`Points adversaire (before): ${opponentPoints}`);
    debug.push(`Points ${team.name} (current): ${currentPoints}`);

    // Formule FIFA
    const W_actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    const I = PHASE_IMPORTANCE[match.phase] || 35;
    
    const powerCalc = (opponentPoints - currentPoints) / 600;
    const W_expected = 1 / (Math.pow(10, powerCalc) + 1);
    
    debug.push(`W_actual: ${W_actual}`);
    debug.push(`W_expected: ${W_expected.toFixed(4)}`);
    debug.push(`I (importance): ${I}`);
    debug.push(`CAF_COEFFICIENT: ${CAF_COEFFICIENT}`);
    
    let matchPoints = I * (W_actual - W_expected) * CAF_COEFFICIENT;
    matchPoints = Math.round(matchPoints * 100) / 100;
    
    debug.push(`Calcul: ${I} × (${W_actual} - ${W_expected.toFixed(4)}) × ${CAF_COEFFICIENT} = ${matchPoints}`);
    
    pointsGained += matchPoints;
    currentPoints += matchPoints;
    currentPoints = Math.round(currentPoints * 100) / 100;
    
    debug.push(`Points gagnés ce match: ${matchPoints > 0 ? '+' : ''}${matchPoints}`);
    debug.push(`Nouveau total: ${currentPoints}`);
    debug.push('');
  });

  debug.push('=== RÉSUMÉ ===');
  debug.push(`Points FIFA avant le tournoi: ${team.fifa_points_before}`);
  debug.push(`Points FIFA calculés après le tournoi: ${currentPoints}`);
  debug.push(`Variation totale: ${pointsGained > 0 ? '+' : ''}${pointsGained}`);
  debug.push(`Matchs comptabilisés: ${matchesPlayed}`);
  debug.push('');
  debug.push(`📅 Ces points seront officialisés dans le classement FIFA du ${NEXT_FIFA_RANKING_DATE}`);
  debug.push(`💡 Jusqu'à cette date, les points "before" (${team.fifa_points_before}) restent la référence officielle`);

  return {
    currentPoints,
    pointsGained: Math.round(pointsGained * 100) / 100,
    matchesPlayed,
    debug
  };
}



