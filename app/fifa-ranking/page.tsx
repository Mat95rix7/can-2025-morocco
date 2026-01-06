import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Image from 'next/image';
import { Match } from '@/types/types';

type TeamWithRankings = {
  id: string;
  name: string;
  code: string;
  flag_url: string | null;
  group_name: string | null;
  fifa_rank_before: number | null;
  fifa_points_before: number;
  created_at: string;
  fifa_rankings: Array<{ points: number; rank: number; date: string }>;
};

// Coefficients FIFA pour la CAN 2025
const PHASE_IMPORTANCE: Record<string, number> = {
  'group': 35,          // Phase de groupes
  'round_of_16': 40,    // 8ème de finale
  'quarter_final': 40,  // Quart de finale
  'semi_final': 40,     // Demi-finale
  'third_place': 40,    // Match pour la 3ème place
  'final': 50,          // Finale
};

const CAF_COEFFICIENT = 1.0;

async function getTeamsWithMatches() {
  const supabase = await supabaseServer();
  
  // Récupérer toutes les équipes
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select(`
      *,
      fifa_rankings(points, rank, date)
    `)
    .order('fifa_rank_before', { ascending: true });

  if (teamsError) {
    console.error('Error fetching teams:', teamsError);
    return { teams: [], matches: [] };
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
      flag_url,
      group_name,
      fifa_rank_before,
      fifa_points_before
    ),
    away_team:teams!matches_away_team_id_fkey(
      id,
      name,
      code,
      flag_url,
      group_name,
      fifa_rank_before,
      fifa_points_before
    )
  `)
  .in('status', ['finished', 'live'])
  .returns<Match[]>();

  if (matchesError) {
    console.error('Error fetching matches:', matchesError);
    return { teams: teams || [], matches: [] };
  }

  const safeMatches: Match[] = (matches || []).map(m => ({
    ...m,
    home_score: m.home_score ?? 0,
    away_score: m.away_score ?? 0,
    phase: m.phase ?? '',
    status: m.status ?? 'unknown',
  }));

  return { 
    teams: (teams || []) as TeamWithRankings[], 
    matches: safeMatches
  };
}


function calculateCurrentPoints(
  team: TeamWithRankings,
  matches: Match[]
): { currentPoints: number; pointsGained: number; matchesPlayed: number } {
  let pointsGained = 0;
  let matchesPlayed = 0;

  // On commence avec les points FIFA initiaux de l'équipe
  let currentPoints = team.fifa_points_before;

  // Trier les matchs par date si tu as une colonne date
  const sortedMatches = matches
    .filter(match => match.home_team_id === team.id || match.away_team_id === team.id)
    .slice()
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  sortedMatches.forEach((match) => {
    if (match.home_score === null || match.away_score === null) return;;
  });

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

    // Points adversaire au moment du match
    const opponentPoints = isHome
      ? match.away_team?.fifa_points_before || 1500
      : match.home_team?.fifa_points_before || 1500;

    // Calcul officiel des points gagnés pour ce match
    const W_actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    const I = PHASE_IMPORTANCE[match.phase] || 35;
    const W_expected = 1 / (10 ** ((opponentPoints - currentPoints) / 600) + 1);
    let matchPoints = I * (W_actual - W_expected) * CAF_COEFFICIENT;

    // Arrondi à 2 décimales après chaque match
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


function RankingBadge({ change, type }: { change: number, type: string }) {
  if (type === 'up') {
    return (
      <Badge className="bg-green-600 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        +{change}
      </Badge>
    );
  } else if (type === 'down') {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <TrendingDown className="h-3 w-3" />
        -{change}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Minus className="h-3 w-3" />
      =
    </Badge>
  );
}

export default async function FifaRankingPage() {
  const { teams, matches } = await getTeamsWithMatches();

  // Calculer les points actuels pour chaque équipe
  const teamsWithCurrentPoints = teams.map(team => ({
    ...team,
    ...calculateCurrentPoints(team, matches)
  }));

  // Trier par points actuels (classement live)
  const sortedTeams = [...teamsWithCurrentPoints].sort(
    (a, b) => b.currentPoints - a.currentPoints
  );

  const africaRanksBefore = [...teams]
  .sort((a, b) => (a.fifa_rank_before ?? Infinity) - (b.fifa_rank_before ?? Infinity))
  .reduce<Record<string, number>>((acc, team, i) => {
    acc[team.id] = i + 1;
    return acc;
  }, {});

  const teamsWithNewRank = sortedTeams.map((team, index) => ({
    ...team,
    newAfricaRank: index + 1,
    rankChange: africaRanksBefore[team.id]
      ? africaRanksBefore[team.id] - (index + 1)
      : 0
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Classement FIFA Live</h1>
        <p className="text-muted-foreground">
          Impact en temps réel de la CAN 2025 sur le classement mondial FIFA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progressions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {teamsWithNewRank.filter(t => t.rankChange > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Équipes en hausse
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stables</CardTitle>
            <Minus className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {teamsWithNewRank.filter(t => t.rankChange === 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sans changement
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Régressions</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {teamsWithNewRank.filter(t => t.rankChange < 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Équipes en baisse
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classement mondial FIFA - Live CAN 2025</CardTitle>
          <CardDescription>
            Classement mis à jour en temps réel selon les résultats de la CAN • {matches.length} matchs comptabilisés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamsWithNewRank.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Rang actuel</TableHead>
                    <TableHead className="w-20">Évolution</TableHead>
                    <TableHead>Équipe</TableHead>
                    <TableHead className="text-center">Points départ</TableHead>
                    <TableHead className="text-center">Points gagnés</TableHead>
                    <TableHead className="text-center">Points actuels</TableHead>
                    <TableHead className="text-center">Matchs</TableHead>
                    <TableHead>Groupe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamsWithNewRank.map((team) => {
                    const changeType = team.rankChange > 0 ? 'up' : team.rankChange < 0 ? 'down' : 'stable';
                    
                    return (
                      <TableRow key={team.id} className="hover:bg-muted/50">
                        <TableCell className="font-bold text-lg">
                          #{team.newAfricaRank}
                        </TableCell>
                        <TableCell>
                          <RankingBadge 
                            change={Math.abs(team.rankChange)} 
                            type={changeType}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 relative shrink-0">
                              {team?.flag_url ? (
                                <Image
                                  src={team.flag_url}
                                  alt={`${team.name} flag`}
                                  fill
                                  className="object-cover rounded"
                                />
                              ) : (
                                <span className="text-2xl">🏳️</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {team.code} • Rang initial: #{team.fifa_rank_before || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-muted-foreground">
                            {team.fifa_points_before.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {team.pointsGained > 0 ? (
                            <Badge className="bg-green-600">
                              +{team.pointsGained.toFixed(2)}
                            </Badge>
                          ) : team.pointsGained < 0 ? (
                            <Badge variant="destructive">
                              {team.pointsGained.toFixed(2)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-lg text-primary">
                            {team.currentPoints.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{team.matchesPlayed}</Badge>
                        </TableCell>
                        <TableCell>
                          {team.group_name ? (
                            <Badge variant="outline">Groupe {team.group_name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Les données FIFA seront disponibles prochainement
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Comment fonctionne le classement FIFA ?</CardTitle>
          <CardDescription>Calcul des points lors d&apos;une compétition continentale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Formule de calcul</h4>
              <p className="text-muted-foreground">
                Points gagnés = (Résultat × Importance × Opposition × Coefficient CAF)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Résultat du match</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Victoire : 3 points</li>
                  <li>• Match nul : 1 point</li>
                  <li>• Défaite : 0 point</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Importance CAN</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Phase de groupes : 35 points</li>
                  <li>• Phase à élimination : 40 points</li>
                  <li>• Finale : 50 points</li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Force de l&apos;opposition</h4>
              <p className="text-muted-foreground">
                La probabilité de victoire attendue est calculée avec la formule Elo : 
                W_expected = 1 / (10^((points_adversaire - points_équipe) / 600) + 1).
                Plus l&apos;adversaire a de points, plus la victoire rapporte de points.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Coefficient CAF</h4>
              <p className="text-muted-foreground">
                La Confédération Africaine de Football (CAF) a un coefficient de 1.0 dans le calcul FIFA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}