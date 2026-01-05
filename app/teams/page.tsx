// import { supabaseServer } from '@/lib/supabase/server';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Users, Trophy, TrendingUp } from 'lucide-react';
// import Image from 'next/image';
//   const supabase = await supabaseServer();


// async function getTeams() {
//   const { data, error } = await supabase
//     .from('teams')
//     .select('*')
//     .order('group_name', { ascending: true })
//     .order('name', { ascending: true });

//   if (error) {
//     console.error('Error fetching teams:', error);
//     return [];
//   }

//   return data || [];
// }

// async function getTeamStats(teamId: string) {
//   const { data: matches } = await supabase
//     .from('matches')
//     .select('*')
//     .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
//     .eq('status', 'finished');

//   const stats = {
//     played: matches?.length || 0,
//     wins: 0,
//     draws: 0,
//     losses: 0,
//     goalsFor: 0,
//     goalsAgainst: 0
//   };

//   matches?.forEach((match: any) => {
//     const isHome = match.home_team_id === teamId;
//     const teamScore = isHome ? match.home_score : match.away_score;
//     const opponentScore = isHome ? match.away_score : match.home_score;

//     stats.goalsFor += teamScore;
//     stats.goalsAgainst += opponentScore;

//     if (teamScore > opponentScore) stats.wins++;
//     else if (teamScore === opponentScore) stats.draws++;
//     else stats.losses++;
//   });

//   return stats;
// }

// function TeamCard({ team }: { team: any }) {
//   return (
//     <Card className="hover:shadow-lg transition-all hover:scale-[1.02]">
//       <CardHeader>
//         <div className="flex items-start justify-between">
//           <div className="flex items-center gap-3">
//             <div className="text-5xl">
//               {team.flag_url ? (
//                 <Image
//                   src={team.flag_url}
//                   alt={`${team.name} flag`}
//                   width={48}   // équivalent w-12
//                   height={48}  // équivalent h-12
//                   className="inline"
//                 />
//               ) : (
//                 '🏳️'
//               )}
//             </div>
//             <div>
//               <CardTitle className="text-xl">{team.name}</CardTitle>
//               <CardDescription className="text-lg font-medium mt-1">{team.code}</CardDescription>
//             </div>
//           </div>
//           {team.group_name && (
//             <Badge variant="outline" className="text-sm">
//               Groupe {team.group_name}
//             </Badge>
//           )}
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <p className="text-muted-foreground">Classement FIFA</p>
//             <p className="text-2xl font-bold">{team.fifa_rank_before || 'N/A'}</p>
//           </div>
//           <div>
//             <p className="text-muted-foreground">Points FIFA</p>
//             <p className="text-2xl font-bold">{team.fifa_points_before || 0}</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export default async function TeamsPage() {
//   const teams = await getTeams();
//   const groupedTeams = teams.reduce((acc: any, team: any) => {
//     const group = team.group_name || 'Sans groupe';
//     if (!acc[group]) {
//       acc[group] = [];
//     }
//     acc[group].push(team);
//     return acc;
//   }, {});

//   const groups = Object.keys(groupedTeams).sort();

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold mb-2">Équipes participantes</h1>
//         <p className="text-muted-foreground">Les 24 nations de la CAN 2025</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <Card className="border-green-200 dark:border-green-900">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total équipes</CardTitle>
//             <Users className="h-4 w-4 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">{teams.length}</div>
//             <p className="text-xs text-muted-foreground mt-1">
//               Nations africaines
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="border-yellow-200 dark:border-yellow-900">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Groupes</CardTitle>
//             <Trophy className="h-4 w-4 text-yellow-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">{groups.length}</div>
//             <p className="text-xs text-muted-foreground mt-1">
//               Phases de poules
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="border-red-200 dark:border-red-900">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Équipes / groupe</CardTitle>
//             <TrendingUp className="h-4 w-4 text-red-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">4</div>
//             <p className="text-xs text-muted-foreground mt-1">
//               Par groupe
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {teams.length > 0 ? (
//         <div className="space-y-8">
//           {groups.map((group) => (
//             <div key={group}>
//               <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//                 <Trophy className="h-6 w-6 text-yellow-600" />
//                 {group === 'Sans groupe' ? group : `Groupe ${group}`}
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                 {groupedTeams[group].map((team: any) => (
//                   <TeamCard key={team.id} team={team} />
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <Card>
//           <CardContent className="py-12">
//             <p className="text-center text-muted-foreground">
//               Les équipes participantes seront disponibles prochainement
//             </p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const supabase = await supabaseServer();

async function getTeams() {
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
  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId);

  return count || 0;
}

function TeamCard({ team, playerCount }: { team: any; playerCount: number }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-5xl">
                {team.flag_url ? (
                  <Image
                    src={team.flag_url}
                    alt={`${team.name} flag`}
                    width={48}
                    height={48}
                    className="inline"
                  />
                ) : (
                  '🏳️'
                )}
              </div>
              <div>
                <CardTitle className="text-xl">{team.name}</CardTitle>
                <CardDescription className="text-lg font-medium mt-1">{team.code}</CardDescription>
              </div>
            </div>
            {team.group_name && (
              <Badge variant="outline" className="text-sm">
                Groupe {team.group_name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Classement FIFA</p>
              <p className="text-2xl font-bold">{team.fifa_rank_before || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Points FIFA</p>
              <p className="text-2xl font-bold">{team.fifa_points_before || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{playerCount} joueurs</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Équipes participantes</h1>
        <p className="text-muted-foreground">Les 24 nations de la CAN 2025</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
