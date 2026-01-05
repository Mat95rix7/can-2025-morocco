import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Trophy, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getTeam(teamId: string) {
  const supabase = await supabaseServer();
  
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getPlayers(teamId: string) {
  const supabase = await supabaseServer();
  
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }

  return data || [];
}

async function getTeamStats(teamId: string) {
  const supabase = await supabaseServer();
  
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq('status', 'finished');

  const stats = {
    played: matches?.length || 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0
  };

  matches?.forEach((match: any) => {
    const isHome = match.home_team_id === teamId;
    const teamScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;

    stats.goalsFor += teamScore;
    stats.goalsAgainst += opponentScore;

    if (teamScore > opponentScore) stats.wins++;
    else if (teamScore === opponentScore) stats.draws++;
    else stats.losses++;
  });

  return stats;
}

const positionColors: Record<string, string> = {
  'GK': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'DF': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'MF': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'FW': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const positionLabels: Record<string, string> = {
  'GK': 'Gardien',
  'DF': 'Défenseur',
  'MF': 'Milieu',
  'FW': 'Attaquant',
};

export default async function TeamDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const team = await getTeam(id);
  
  if (!team) {
    notFound();
  }

  const players = await getPlayers(id);
  const stats = await getTeamStats(id);

  const groupedPlayers = players.reduce((acc, player) => {
    const pos = player.position || 'Autres';
    if (!acc[pos]) {
      acc[pos] = [];
    }
    acc[pos].push(player);
    return acc;
  }, {} as Record<string, any[]>);

  const positionOrder = ['GK', 'DF', 'MF', 'FW', 'Autres'];
  const sortedPositions = positionOrder.filter(pos => groupedPlayers[pos]);

  const points = stats.wins * 3 + stats.draws;
  const goalDifference = stats.goalsFor - stats.goalsAgainst;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/teams">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux équipes
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">
            {team.flag_url ? (
              <Image
                src={team.flag_url}
                alt={`${team.name} flag`}
                width={64}
                height={64}
                className="inline"
              />
            ) : (
              '🏳️'
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">{team.name}</h1>
              {team.group_name && (
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Groupe {team.group_name}
                </Badge>
              )}
            </div>
            <p className="text-xl text-muted-foreground mt-1">{team.code}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classement FIFA</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{team.fifa_rank_before || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avant le tournoi
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points FIFA</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{team.fifa_points_before || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Points actuels
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matchs joués</CardTitle>
            <Trophy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.played}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.wins}V {stats.draws}N {stats.losses}D
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buts</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.goalsFor}:{stats.goalsAgainst}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Diff. {goalDifference > 0 ? '+' : ''}{goalDifference}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6" />
              Effectif complet
            </CardTitle>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {players.length} joueurs
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun joueur enregistré pour cette équipe
            </div>
          ) : (
            <div className="space-y-8">
              {sortedPositions.map((position) => (
                <div key={position}>
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b">
                    <h3 className="text-xl font-semibold">
                      {positionLabels[position] || position}
                    </h3>
                    <Badge variant="secondary">
                      {groupedPlayers[position].length} joueur{groupedPlayers[position].length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupedPlayers[position].map((player: any) => (
                      <Card key={player.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {player.number && (
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
                                {player.number}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{player.name}</p>
                              {player.position && (
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs mt-1 ${positionColors[player.position] || ''}`}
                                >
                                  {positionLabels[player.position] || player.position}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}