import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

type StandingWithTeam = {
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
  team: { name: string; code: string; flag_url: string | null } | null;
};

async function getStandings(): Promise<StandingWithTeam[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
  .from('standings')
    .select(`
      *,
      teams!inner(name, code, flag_url)
    `)
    .order('group_name', { ascending: true })
    .order('position', { ascending: true });

  if (error) {
    console.error('❌ Error fetching standings:', error);
    return [];
  }

  // Transformer les données pour correspondre à votre type
  const transformedData = data?.map(item => ({
    ...item,
    team: item.teams
  })) || [];

  return transformedData as StandingWithTeam[];
}
function getQualificationBadge(position: number) {
  if (position <= 2) {
    return <Badge className="bg-green-600">Qualifié</Badge>;
  } else if (position === 3) {
    return <Badge variant="secondary">Repêchable</Badge>;
  }
  return <Badge variant="outline">Éliminé</Badge>;
}

function StandingsTable({ standings, groupName }: { standings: StandingWithTeam[], groupName: string }) {
  const groupStandings = standings.filter(s => s.group_name === groupName);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Groupe {groupName}</span>
          <Trophy className="h-5 w-5 text-yellow-600" />
        </CardTitle>
        <CardDescription>Classement et statistiques</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Pos</TableHead>
                <TableHead className="min-w-45">Équipe</TableHead>
                <TableHead className="text-center w-16">Pts</TableHead>
                <TableHead className="text-center w-12">J</TableHead>
                <TableHead className="text-center w-12">G</TableHead>
                <TableHead className="text-center w-12">N</TableHead>
                <TableHead className="text-center w-12">P</TableHead>
                <TableHead className="text-center w-12">BP</TableHead>
                <TableHead className="text-center w-12">BC</TableHead>
                <TableHead className="text-center w-16">Diff</TableHead>
                <TableHead className="w-28">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupStandings.map((standing) => (
                <TableRow key={standing.id} className="hover:bg-muted/50">
                  <TableCell className="font-bold">{standing.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* <span className="text-2xl">{standing.team?.flag_url || '🏳️'}</span> */}
                      <div className="w-12 h-8 relative shrink-0">
                          {standing.team?.flag_url ? (
                            <Image
                              src={standing.team.flag_url}
                              alt={`${standing.team.name} flag`}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <span className="text-2xl">🏳️</span>
                          )}
                        </div>
                      <div>
                        <p className="font-medium">{standing.team?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{standing.team?.code || ''}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-lg">{standing.points}</TableCell>
                  <TableCell className="text-center">{standing.played}</TableCell>
                  <TableCell className="text-center">{standing.wins}</TableCell>
                  <TableCell className="text-center">{standing.draws}</TableCell>
                  <TableCell className="text-center">{standing.losses}</TableCell>
                  <TableCell className="text-center">{standing.goals_for}</TableCell>
                  <TableCell className="text-center">{standing.goals_against}</TableCell>
                  <TableCell className="text-center">
                    <span className={standing.goal_difference > 0 ? 'text-green-600 font-medium' : standing.goal_difference < 0 ? 'text-red-600 font-medium' : ''}>
                      {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                    </span>
                  </TableCell>
                  <TableCell>{getQualificationBadge(standing.position)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Badge className="bg-green-600">Qualifié</Badge>
            <span>Les 2 premiers de chaque groupe</span>
          </p>
          <p className="flex items-center gap-2">
            <Badge variant="secondary">Repêchable</Badge>
            <span>4 meilleurs 3èmes qualifiés</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function StandingsPage() {
  const standings = await getStandings();
  const groups = Array.from(new Set(standings.map(s => s.group_name))).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Classements</h1>
        <p className="text-muted-foreground">Classement de tous les groupes de la CAN 2025</p>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
          {groups.map((group) => (
            <StandingsTable key={group} standings={standings} groupName={group} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Les classements seront disponibles dès le début de la compétition
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Règles de classement CAF</CardTitle>
          <CardDescription>En cas d&apos;égalité de points</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Plus grand nombre de points obtenus</li>
            <li>Meilleure différence de buts</li>
            <li>Plus grand nombre de buts marqués</li>
            <li>Confrontation directe entre les équipes à égalité</li>
            <li>Fair-play (cartons jaunes et rouges)</li>
            <li>Tirage au sort</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
