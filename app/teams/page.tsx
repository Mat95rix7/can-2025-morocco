import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, TrendingUp } from 'lucide-react';
import { TeamCard } from '@/components/TeamCard';
import { Team } from '@/types/types';

interface TeamWithPlayerCount extends Team {
  playerCount: number;
}

async function getTeams(): Promise<Team[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('group_name', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  return (data as Team[]) || [];
}

async function getPlayerCount(teamId: string): Promise<number> {
  const supabase = await supabaseServer();
  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId);

  return count || 0;
}

export default async function TeamsPage() {
  const teams = await getTeams();
  
  const teamsWithPlayerCount: TeamWithPlayerCount[] = await Promise.all(
    teams.map(async (team) => ({
      ...team,
      playerCount: await getPlayerCount(team.id)
    }))
  );

  const groupedTeams = teamsWithPlayerCount.reduce((acc: Record<string, TeamWithPlayerCount[]>, team) => {
    const group = team.group_name || 'Sans groupe';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(team);
    return acc;
  }, {});

  const groups = Object.keys(groupedTeams).sort();
  const totalPlayers = teamsWithPlayerCount.reduce((sum, team) => sum + team.playerCount, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Équipes participantes
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-2">
            Les nations de la CAN 2025
          </p>
          <p className="text-xs sm:text-sm md:text-base font-medium">
            {teams.length} équipes • {totalPlayers} joueurs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 lg:mb-10">
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total équipes</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold">{teams.length}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Nations africaines
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Groupes</CardTitle>
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold">{groups.length}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Phases de poules
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Équipes / groupe</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold">4</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Par groupe
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        {teams.length > 0 ? (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {groups.map((group) => (
              <div key={group}>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  {group === 'Sans groupe' ? group : `Groupe ${group}`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {groupedTeams[group].map((team) => (
                    <TeamCard key={team.id} team={team} playerCount={team.playerCount} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 sm:py-12 lg:py-16">
              <p className="text-center text-sm sm:text-base text-muted-foreground">
                Les équipes participantes seront disponibles prochainement
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}