import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Trophy, Target, Shield, MapPin, Calendar, Ruler, Calendar1 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Player } from '@/types/types';

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

const positionConfig = {
  'GK': { 
    label: 'Gardiens', 
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    badgeColor: 'bg-amber-500 text-white',
    icon: Shield
  },
  'DF': { 
    label: 'Défenseurs', 
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    badgeColor: 'bg-blue-500 text-white',
    icon: Shield
  },
  'MF': { 
    label: 'Milieux', 
    color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    badgeColor: 'bg-green-500 text-white',
    icon: Target
  },
  'FW': { 
    label: 'Attaquants', 
    color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    badgeColor: 'bg-red-500 text-white',
    icon: Target
  },
};

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

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

  const positionOrder = ['GK', 'DF', 'MF', 'FW'];
  const sortedPositions = positionOrder.filter(pos => groupedPlayers[pos]);
  const goalDifference = stats.goalsFor - stats.goalsAgainst;

//   return (
//     <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
//       <div className="container mx-auto px-4 py-6 max-w-7xl">
//         <Link href="/teams">
//           <Button variant="ghost" size="sm" className="mb-4">
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Retour
//           </Button>
//         </Link>

//         {/* Header moderne avec gradient */}
//         <Card className="mb-6 overflow-hidden border-2">
//           <div className="bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
//             <div className="flex items-start gap-6">
//               <div className="relative">
//                 {team.flag_url ? (
//                   <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg ring-4 ring-background">
//                     <Image
//                       src={team.flag_url}
//                       alt={`${team.name} flag`}
//                       fill
//                       className="object-cover"
//                     />
//                   </div>
//                 ) : (
//                   <div className="text-6xl">🏳️</div>
//                 )}
//               </div>
              
//               <div className="flex-1">
//                 <div className="flex flex-wrap items-center gap-3 mb-2">
//                   <h1 className="text-3xl font-bold">{team.name}</h1>
//                   <Badge variant="outline" className="text-sm">
//                     {team.code}
//                   </Badge>
//                   {team.group_name && (
//                     <Badge className="bg-primary text-sm">
//                       Groupe {team.group_name}
//                     </Badge>
//                   )}
//                 </div>
                
//                 {/* Stats inline */}
//                 <div className="flex flex-wrap gap-6 mt-4 text-sm">
//                   <div className="flex items-center gap-2">
//                     <Trophy className="h-4 w-4 text-muted-foreground" />
//                     <span className="text-muted-foreground">Rang FIFA:</span>
//                     <span className="font-bold">{team.fifa_rank_before || 'N/A'}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Target className="h-4 w-4 text-muted-foreground" />
//                     <span className="text-muted-foreground">Points:</span>
//                     <span className="font-bold">{team.fifa_points_before || 0}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-muted-foreground">Bilan:</span>
//                     <span className="font-bold">
//                       {stats.wins}V-{stats.draws}N-{stats.losses}D
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-muted-foreground">Buts:</span>
//                     <span className="font-bold">
//                       {stats.goalsFor}:{stats.goalsAgainst}
//                       <span className="text-xs ml-1 text-muted-foreground">
//                         ({goalDifference > 0 ? '+' : ''}{goalDifference})
//                       </span>
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className="flex items-center gap-2 text-muted-foreground mb-1">
//                   <Users className="h-4 w-4" />
//                   <span className="text-sm">Effectif</span>
//                 </div>
//                 <div className="text-3xl font-bold">{players.length}</div>
//               </div>
//             </div>
//           </div>
//         </Card>

//         {/* Liste des joueurs par position */}
//         {players.length === 0 ? (
//           <Card>
//             <CardContent className="py-12 text-center text-muted-foreground">
//               Aucun joueur enregistré pour cette équipe
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="space-y-6">
//             {sortedPositions.map((position) => {
//               const config = positionConfig[position as keyof typeof positionConfig];
//               const Icon = config?.icon || Users;
              
//               return (
//                 <Card key={position} className="overflow-hidden">
//                   <div className={`px-6 py-3 border-b flex items-center justify-between ${config?.color}`}>
//                     <div className="flex items-center gap-3">
//                       <Icon className="h-5 w-5" />
//                       <h2 className="text-lg font-bold">
//                         {config?.label || position}
//                       </h2>
//                     </div>
//                     <Badge variant="secondary">
//                       {groupedPlayers[position].length}
//                     </Badge>
//                   </div>
                  
//                   <CardContent className="p-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {groupedPlayers[position].map((player: any) => {
//                         const age = calculateAge(player.birth_date);
                        
//                         return (
//                           <Card
//                             key={player.id}
//                             className="group relative overflow-hidden hover:shadow-lg transition-all"
//                           >
//                             <CardContent className="p-0">
//                               {/* Header avec photo et numéro */}
//                               <div className="relative h-32 bg-linear-to-br from-primary/5 to-primary/10">
//                                 {player.photo ? (
//                                   <div className="absolute inset-0">
//                                     <Image
//                                       src={player.photo}
//                                       alt={player.name}
//                                       fill
//                                       className="object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity"
//                                     />
//                                     <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
//                                   </div>
//                                 ) : (
//                                   <div className="absolute inset-0 flex items-center justify-center">
//                                     <Users className="h-16 w-16 text-muted-foreground/20" />
//                                   </div>
//                                 )}
                                
//                                 {/* Numéro en haut à droite */}
//                                 {player.number && (
//                                   <div className={`absolute top-3 right-3 w-12 h-12 rounded-full ${config?.badgeColor} flex items-center justify-center font-bold text-xl shadow-lg`}>
//                                     {player.number}
//                                   </div>
//                                 )}
//                               </div>

//                               {/* Infos joueur */}
//                               <div className="p-4">
//                                 <h3 className="font-bold text-lg mb-1 truncate text-blue-400">
//                                   {player.firstname}{' '}{player.lastname}
//                                 </h3>
                                
//                                 {/* Club */}
//                                 {player.club && (
//                                   <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
//                                     <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                                     </svg>
//                                     <span className="truncate font-medium">{player.club}</span>
//                                   </div>
//                                 )}

//                                 {/* Infos détaillées */}
//                                 <div className="space-y-2 text-xs">
//                                   {age && (
//                                     <div className="flex items-center gap-2 text-muted-foreground">
//                                       <Calendar className="h-3.5 w-3.5 shrink-0" />
//                                       <span>{age} ans</span>{' - '}
//                                       {player.birth_date && (
//                                         <span className="text-muted-foreground/60">
//                                           {new Date(player.birth_date).toLocaleDateString('fr-FR', { 
//                                             day: '2-digit', 
//                                             month: '2-digit', 
//                                             year: 'numeric' 
//                                           })}
//                                         </span>
//                                       )}
//                                     </div>
//                                   )}
                                  
//                                   {player.birth_place && (
//                                     <div className="flex items-center gap-2 text-muted-foreground">
//                                       <MapPin className="h-3.5 w-3.5 shrink-0" />
//                                       <span className="truncate">{player.birth_place}</span>
//                                     </div>
//                                   )}
                                  
//                                   {player.height && (
//                                     <div className="flex items-center gap-2 text-muted-foreground">
//                                       <Ruler className="h-3.5 w-3.5 shrink-0" />
//                                       <span>{player.height.toFixed(2)} cm</span>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             </CardContent>
//                           </Card>
//                         );
//                       })}
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
return (
  <div className="min-h-screen bg-linear-to-b from-background via-muted/10 to-muted/30">
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Link href="/teams">
        <Button variant="ghost" size="sm" className="mb-4 hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </Link>

      {/* Header ultra-moderne */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border-2 border-primary/20 shadow-2xl">
        {/* Background avec effet */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Drapeau avec effet néon */}
            <div className="relative group">
              {team.flag_url ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <Image
                    src={team.flag_url}
                    alt={`${team.name} flag`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                </div>
              ) : (
                <div className="text-6xl">🏳️</div>
              )}
            </div>
            
            {/* Infos équipe */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {team.name}
                </h1>
                <Badge variant="outline" className="text-base font-bold border-2">
                  {team.code}
                </Badge>
                {team.group_name && (
                  <Badge className="bg-linear-to-r from-primary to-primary/80 text-base font-bold shadow-lg">
                    Groupe {team.group_name}
                  </Badge>
                )}
              </div>
              
              {/* Stats en cards compactes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">Rang FIFA</span>
                  </div>
                  <p className="text-xl font-bold">{team.fifa_rank_before || 'N/A'}</p>
                </div>
                
                <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Points</span>
                  </div>
                  <p className="text-xl font-bold">{team.fifa_points_before || 0}</p>
                </div>
                
                <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Bilan</span>
                  </div>
                  <p className="text-xl font-bold">
                    {stats.wins}V {stats.draws}N {stats.losses}D
                  </p>
                </div>
                
                <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-muted-foreground">Buts</span>
                  </div>
                  <p className="text-xl font-bold">
                    {stats.goalsFor}:{stats.goalsAgainst}
                    <span className="text-xs ml-1 text-muted-foreground">
                      ({goalDifference > 0 ? '+' : ''}{goalDifference})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Effectif total */}
            <div className="bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border-2 border-primary/30 shadow-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Effectif</span>
              </div>
              <div className="text-5xl font-black bg-linear-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                {players.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des joueurs par position */}
      {players.length === 0 ? (
        <Card className="bg-linear-to-br from-background to-muted/20">
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
            <p className="text-muted-foreground">Aucun joueur enregistré pour cette équipe</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedPositions.map((position) => {
            const config = positionConfig[position as keyof typeof positionConfig];
            const Icon = config?.icon || Users;
            
            return (
              <div key={position} className="space-y-4">
                {/* Header de position moderne */}
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-3 px-6 py-3 rounded-xl ${config?.color} border-2 ${config?.color.replace('bg-', 'border-').replace('/10', '/30')}`}>
                    <Icon className="h-6 w-6" />
                    <h2 className="text-xl font-bold">{config?.label || position}</h2>
                    <Badge variant="secondary" className="ml-2 font-bold">
                      {groupedPlayers[position].length}
                    </Badge>
                  </div>
                  <div className="flex-1 h-0.5 bg-linear-to-r from-border to-transparent" />
                </div>
                
                {/* Grid de cards joueurs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedPlayers[position].map((player: Player) => {
                    const age = calculateAge(player.birth_date);
                    
                    return (
                      <div
                        key={player.id}
                        className="group relative"
                      >
                        {/* Card style FIFA */}
                        <div className="relative h-full bg-linear-to-br from-card to-muted/20 rounded-2xl overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                          {/* Background pattern */}
                          <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
                          </div>
                          
                          {/* Numéro en filigrane */}
                          {player.number && (
                            <div className="absolute top-4 right-4 z-10">
                              <div className={`w-14 h-14 rounded-full ${config?.badgeColor} flex items-center justify-center font-black text-2xl shadow-xl ring-4 ring-background/50 group-hover:scale-110 transition-transform`}>
                                {player.number}
                              </div>
                            </div>
                          )}
                          
                          {/* Photo joueur */}
                          <div className="relative h-48 overflow-hidden">
                            {player.photo ? (
                              <>
                                <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent" />
                                <Image
                                  src={player.photo}
                                  alt={player.firstname}
                                  fill
                                  className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
                              </>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted to-muted/50">
                                <Users className="h-20 w-20 text-muted-foreground/20" />
                              </div>
                            )}
                          </div>

                          {/* Infos joueur */}
                          <div className="relative p-4 space-y-3">
                            {/* Nom */}
                            <div>
                              <h3 className="font-black text-lg leading-tight truncate">
                                {player.firstname}
                              </h3>
                              <h3 className="font-black text-xl leading-tight truncate bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                {player.lastname}
                              </h3>
                            </div>
                            
                            {/* Club */}
                            {player.club && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 bg-slate-900 rounded-lg border border-border/50">
                                <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="text-sm font-semibold truncate ">{player.club}</span>
                              </div>
                            )}

                            {/* Stats compactes */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                              {age && (
                                <div className="text-center">
                                  <Calendar className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-xs font-bold">{age} ans</p>
                                </div>
                              )}

                              {player.birth_date && (
                                <div className="text-center col-span">
                                  <Calendar1 className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-xs font-bold">{new Date(player.birth_date).toLocaleDateString('fr-FR', { 
                                            day: '2-digit', 
                                            month: '2-digit', 
                                            year: 'numeric' 
                                          })}</p>
                                </div>
                              )}

                              {player.birth_place && (
                                <div className="text-center col-span">
                                  <MapPin className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-xs font-bold truncate">{player.birth_place}</p>
                                </div>
                              )}
                              
                              {player.height && (
                                <div className="text-center col-span">
                                  <Ruler className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-xs font-bold">{player.height} cm</p>
                                </div>
                              )}

                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
); 
}


// return (
//   <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-purple-900/20 to-slate-950">
//     {/* Animated background orbs */}
//     <div className="fixed inset-0 overflow-hidden pointer-events-none">
//       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
//       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
//     </div>

//     <div className="relative container mx-auto px-4 py-4 max-w-400">
//       <Link href="/teams">
//         <Button variant="ghost" size="sm" className="mb-3 text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm">
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Retour
//         </Button>
//       </Link>

//       {/* Header premium */}
//       <div className="relative mb-6 group">
//         <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
//         <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/20 overflow-hidden">
//           {/* Shine effect */}
//           <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
//           <div className="relative p-6">
//             <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
//               {/* Flag with glow */}
//               <div className="relative">
//                 <div className="absolute inset-0 bg-linear-to-br from-purple-500/50 to-cyan-500/50 rounded-xl blur-lg animate-pulse" />
//                 {team.flag_url ? (
//                   <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/30 hover:ring-white/50 transition-all">
//                     <Image src={team.flag_url} alt={team.name} fill className="object-cover" />
//                   </div>
//                 ) : (
//                   <div className="text-5xl">🏳️</div>
//                 )}
//               </div>
              
//               {/* Team info */}
//               <div className="flex-1 space-y-3">
//                 <div className="flex flex-wrap items-center gap-3">
//                   <h1 className="text-3xl md:text-4xl font-black bg-linear-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
//                     {team.name}
//                   </h1>
//                   <Badge className="bg-linear-to-r from-purple-500 to-cyan-500 border-0 text-white font-bold shadow-lg">
//                     {team.code}
//                   </Badge>
//                   {team.group_name && (
//                     <Badge className="bg-white/10 backdrop-blur text-white border border-white/20 font-bold">
//                       Groupe {team.group_name}
//                     </Badge>
//                   )}
//                 </div>
                
//                 {/* Stats grid */}
//                 <div className="flex flex-wrap gap-3">
//                   <div className="px-3 py-1.5 bg-white/5 backdrop-blur rounded-lg border border-white/10">
//                     <div className="flex items-center gap-2 text-xs text-slate-400">
//                       <Trophy className="h-3.5 w-3.5 text-yellow-400" />
//                       FIFA <span className="text-white font-bold ml-1">{team.fifa_rank_before || 'N/A'}</span>
//                     </div>
//                   </div>
//                   <div className="px-3 py-1.5 bg-white/5 backdrop-blur rounded-lg border border-white/10">
//                     <div className="flex items-center gap-2 text-xs text-slate-400">
//                       <Target className="h-3.5 w-3.5 text-purple-400" />
//                       <span className="text-white font-bold">{team.fifa_points_before || 0}</span> pts
//                     </div>
//                   </div>
//                   <div className="px-3 py-1.5 bg-white/5 backdrop-blur rounded-lg border border-white/10">
//                     <span className="text-xs text-white font-bold">{stats.wins}V-{stats.draws}N-{stats.losses}D</span>
//                   </div>
//                   <div className="px-3 py-1.5 bg-white/5 backdrop-blur rounded-lg border border-white/10">
//                     <span className="text-xs text-white font-bold">{stats.goalsFor}:{stats.goalsAgainst}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Squad count */}
//               <div className="relative">
//                 <div className="absolute inset-0 bg-linear-to-br from-purple-500/30 to-cyan-500/30 rounded-xl blur" />
//                 <div className="relative bg-slate-900/80 backdrop-blur rounded-xl px-6 py-3 border border-white/20">
//                   <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
//                     <Users className="h-3.5 w-3.5" />
//                     Joueurs
//                   </div>
//                   <div className="text-3xl font-black bg-linear-to-br from-purple-400 to-cyan-400 bg-clip-text text-transparent">
//                     {players.length}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Players grid */}
//       {players.length === 0 ? (
//         <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-16 text-center">
//           <Users className="h-16 w-16 mx-auto mb-4 text-slate-700" />
//           <p className="text-slate-400">Aucun joueur enregistré</p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {sortedPositions.map((position) => {
//             const config = positionConfig[position as keyof typeof positionConfig];
//             const Icon = config?.icon || Users;
            
//             // Position ambient colors
//             const positionGlow = {
//               'GK': 'from-amber-500/30 to-orange-500/30',
//               'DF': 'from-blue-500/30 to-cyan-500/30',
//               'MF': 'from-green-500/30 to-emerald-500/30',
//               'FW': 'from-red-500/30 to-pink-500/30',
//             };

//             const positionAccent = {
//               'GK': 'from-amber-400 to-orange-400',
//               'DF': 'from-blue-400 to-cyan-400',
//               'MF': 'from-green-400 to-emerald-400',
//               'FW': 'from-red-400 to-pink-400',
//             };
            
//             return (
//               <div key={position} className="relative group/section">
//                 {/* Section glow */}
//                 <div className={`absolute -inset-4 bg-linear-to-r ${positionGlow[position as keyof typeof positionGlow] || 'from-purple-500/30 to-cyan-500/30'} rounded-3xl blur-2xl opacity-0 group-hover/section:opacity-100 transition-opacity duration-500`} />
                
//                 <div className="relative space-y-3">
//                   {/* Position header */}
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="relative group/badge">
//                       <div className={`absolute inset-0 bg-linear-to-r ${positionGlow[position as keyof typeof positionGlow]} rounded-lg blur`} />
//                       <div className="relative flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 backdrop-blur-xl rounded-lg border border-white/20">
//                         <Icon className="h-5 w-5 text-white" />
//                         <span className={`font-black text-base bg-linear-to-r ${positionAccent[position as keyof typeof positionAccent]} bg-clip-text text-transparent`}>
//                           {config?.label || position}
//                         </span>
//                         <Badge className="ml-1 bg-white/10 text-white border-0 font-bold">
//                           {groupedPlayers[position].length}
//                         </Badge>
//                       </div>
//                     </div>
//                     <div className="flex-1 h-px bg-linear-to-r from-white/20 via-white/5 to-transparent" />
//                   </div>
                  
//                   {/* Players cards */}
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
//                     {groupedPlayers[position].map((player: any) => {
//                       const age = calculateAge(player.birth_date);
                      
//                       return (
//                         <div key={player.id} className="group/card relative">
//                           {/* Card glow on hover */}
//                           <div className={`absolute -inset-1 bg-linear-to-r ${positionGlow[position as keyof typeof positionGlow]} rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`} />
                          
//                           <div className="relative h-full bg-slate-900/80 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 group-hover/card:border-white/30 transition-all duration-300 group-hover/card:scale-[1.02]">
//                             {/* Number badge */}
//                             {player.number && (
//                               <div className="absolute top-2 right-2 z-20">
//                                 <div className={`w-9 h-9 rounded-full bg-linear-to-br ${positionAccent[position as keyof typeof positionAccent]} flex items-center justify-center font-black text-white text-sm shadow-xl ring-2 ring-white/20 group-hover/card:ring-white/40 transition-all`}>
//                                   {player.number}
//                                 </div>
//                               </div>
//                             )}
                            
//                             {/* Photo */}
//                             <div className="relative h-36 overflow-hidden">
//                               {player.photo ? (
//                                 <>
//                                   <div className={`absolute inset-0 bg-linear-to-br ${positionGlow[position as keyof typeof positionGlow]} opacity-50`} />
//                                   <Image
//                                     src={player.photo}
//                                     alt={player.name}
//                                     fill
//                                     className="object-cover object-top group-hover/card:scale-110 transition-transform duration-700"
//                                   />
//                                   <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/70 to-transparent" />
//                                 </>
//                               ) : (
//                                 <div className={`absolute inset-0 flex items-center justify-center bg-linear-to-br ${positionGlow[position as keyof typeof positionGlow]}`}>
//                                   <Users className="h-14 w-14 text-white/20" />
//                                 </div>
//                               )}
//                             </div>

//                             {/* Player info */}
//                             <div className="relative p-3 space-y-2">
//                               {/* Name */}
//                               <div className="min-h-10">
//                                 <p className="text-[10px] text-slate-400 truncate uppercase tracking-wide">{player.firstname}</p>
//                                 <p className={`text-sm font-black truncate leading-tight bg-linear-to-r ${positionAccent[position as keyof typeof positionAccent]} bg-clip-text text-transparent`}>
//                                   {player.lastname}
//                                 </p>
//                               </div>
                              
//                               {/* Club */}
//                               {player.club && (
//                                 <div className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-white/5 backdrop-blur rounded px-2 py-1 border border-white/10">
//                                   <svg className="h-2.5 w-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                                   </svg>
//                                   <span className="truncate font-semibold">{player.club}</span>
//                                 </div>
//                               )}

//                               {/* Mini stats */}
//                               <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-white/5">
//                                 {age && (
//                                   <div className="flex items-center gap-1">
//                                     <Calendar className="h-2.5 w-2.5" />
//                                     <span className="font-semibold">{age}a</span>
//                                   </div>
//                                 )}
//                                 {player.height && (
//                                   <div className="flex items-center gap-1">
//                                     <Ruler className="h-2.5 w-2.5" />
//                                     <span className="font-semibold">{player.height}cm</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   </div>
// );
// }