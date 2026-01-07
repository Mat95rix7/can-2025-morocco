import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, TrendingUp } from 'lucide-react';
import { TeamCard } from '@/components/TeamCard';
async function getTeams() {
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

  return data || [];
}

async function getPlayerCount(teamId: string) {
  const supabase = await supabaseServer();
  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId);

  return count || 0;
}

export default async function TeamsPage() {
  const teams = await getTeams();
  
  const teamsWithPlayerCount = await Promise.all(
    teams.map(async (team) => ({
      ...team,
      playerCount: await getPlayerCount(team.id)
    }))
  );
  const groupedTeams = teamsWithPlayerCount.reduce((acc: any, team: any) => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Équipes participantes</h1>
        <p className="text-muted-foreground">Les nations de la CAN 2025</p>
            <p>{teams.length} équipes • {totalPlayers} joueurs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total équipes</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nations africaines
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groupes</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Phases de poules
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Équipes / groupe</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">
              Par groupe
            </p>
          </CardContent>
        </Card>
      </div>

      {teams.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                {group === 'Sans groupe' ? group : `Groupe ${group}`}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto">
                {groupedTeams[group].map((team: any) => (
                  <TeamCard key={team.id} team={team} playerCount={team.playerCount} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Les équipes participantes seront disponibles prochainement
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
