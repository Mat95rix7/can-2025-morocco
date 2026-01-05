import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Image from 'next/image';

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

async function getTeamsWithRankings(): Promise<TeamWithRankings[]> {
  const supabase = await supabaseServer();
  const { data: teams, error } = await supabase
    .from('teams')
    .select(`
      *,
      fifa_rankings(points, rank, date)
    `)
    .order('fifa_rank_before', { ascending: true });

  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  return (teams as any) || [];
}

function getRankingChange(team: TeamWithRankings) {
  const rankings = team.fifa_rankings || [];
  if (rankings.length < 2) {
    return { change: 0, type: 'stable' };
  }

  const latest = rankings[rankings.length - 1];
  const previous = rankings[rankings.length - 2];

  const change = previous.rank - latest.rank;
  const type = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

  return { change: Math.abs(change), type };
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
      0
    </Badge>
  );
}

export default async function FifaRankingPage() {
  const teams = await getTeamsWithRankings();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Classement FIFA</h1>
        <p className="text-muted-foreground">
          Impact de la CAN 2025 sur le classement mondial FIFA
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
              {teams.filter(t => getRankingChange(t).type === 'up').length}
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
              {teams.filter(t => getRankingChange(t).type === 'stable').length}
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
              {teams.filter(t => getRankingChange(t).type === 'down').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Équipes en baisse
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classement mondial FIFA</CardTitle>
          <CardDescription>
            Classement des équipes participantes à la CAN 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teams.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rang</TableHead>
                    <TableHead>Équipe</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead className="text-center">Évolution</TableHead>
                    <TableHead>Groupe CAN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team, index) => {
                    const rankChange = getRankingChange(team);
                    return (
                      <TableRow key={team.id} className="hover:bg-muted/50">
                        <TableCell className="font-bold text-lg">
                          {team.fifa_rank_before || index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 relative flex-shrink-0">
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
                              <p className="text-xs text-muted-foreground">{team.code}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-lg">{team.fifa_points_before}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <RankingBadge change={rankChange.change} type={rankChange.type} />
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
          <CardDescription>Calcul des points lors d'une compétition continentale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Formule de calcul</h4>
              <p className="text-muted-foreground">
                Points = Points avant + (Résultat × Importance × Opposition × Coefficient régional)
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
                  <li>• Phase de groupes : 25 points</li>
                  <li>• Phase à élimination : 35 points</li>
                  <li>• Finale : 40 points</li>
                </ul>
              </div>
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
