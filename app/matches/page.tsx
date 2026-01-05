import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';

async function getMatches() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(name, code, flag_url),
      away_team:teams!matches_away_team_id_fkey(name, code, flag_url)
    `)
    .order('match_date', { ascending: true });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data || [];
}

function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    group: 'Phase de groupes',
    round_16: '8èmes de finale',
    quarter: 'Quarts de finale',
    semi: 'Demi-finales',
    final: 'Finale'
  };
  return labels[phase] || phase;
}

function getStatusBadge(status: string) {
  const variants: Record<string, any> = {
    scheduled: { variant: 'secondary', label: 'À venir' },
    live: { variant: 'default', label: 'EN DIRECT' },
    finished: { variant: 'outline', label: 'Terminé' }
  };
  const config = variants[status] || variants.scheduled;
  return (
    <Badge 
      variant={config.variant} 
      className={status === 'live' ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white animate-pulse' : ''}
    >
      {config.label}
    </Badge>
  );
}

function MatchCard({ match }: { match: any }) {
  return (
    <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-card to-muted/50 border-2">
      <CardHeader className="pb-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="break-words">{new Date(match.match_date).toLocaleDateString('fr-FR', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
            <span className="font-medium text-primary">{new Date(match.match_date).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          {getStatusBadge(match.status)}
        </div>
        {match.stadium && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{match.stadium}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 items-center">
          {/* Équipe domicile */}
          <div className="text-center space-y-1 sm:space-y-2">
            <div className="text-3xl sm:text-4xl lg:text-5xl">
              {match.home_team?.flag_url ? (
                <Image
                  src={match.home_team.flag_url}
                  alt={`${match.home_team.name} flag`}
                  width={48}
                  height={48}
                  className="inline w-8 h-6 sm:w-12 sm:h-8 lg:w-14 lg:h-12 rounded-sm border-2 border-primary/20 shadow-lg object-cover"
                />
              ) : (
                '🏳️'
              )}
            </div>   
            <p className="font-semibold text-xs sm:text-sm lg:text-base truncate px-1">{match.home_team?.name || 'TBD'}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted/50 rounded px-1 py-0.5 inline-block">{match.home_team?.code || ''}</p>
          </div>

          {/* Score / VS */}
          <div className="text-center">
            {match.status === 'finished' || match.status === 'live' ? (
              <div className="space-y-1 sm:space-y-2">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  {match.home_score} - {match.away_score}
                </div>
                {match.status === 'live' && (
                  <Badge variant="destructive" className="animate-pulse text-[10px] sm:text-xs">
                    LIVE
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-muted-foreground">VS</div>
            )}
          </div>

          {/* Équipe extérieure */}
          <div className="text-center space-y-1 sm:space-y-2">
            <div className="text-3xl sm:text-4xl lg:text-5xl">
              {match.away_team?.flag_url ? (
                <Image
                  src={match.away_team.flag_url}
                  alt={`${match.away_team.name} flag`}
                  width={48}
                  height={48}
                  className="inline w-8 h-6 sm:w-12 sm:h-8 lg:w-14 lg:h-12 rounded-sm border-2 border-primary/20 shadow-lg object-cover"
                />
              ) : (
                '🏳️'
              )}
            </div>           
            <p className="font-semibold text-xs sm:text-sm lg:text-base truncate px-1">{match.away_team?.name || 'TBD'}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted/50 rounded px-1 py-0.5 inline-block">{match.away_team?.code || ''}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function MatchesPage() {
  const matches = await getMatches();

  const groupedByPhase = matches.reduce((acc: any, match: any) => {
    if (!acc[match.phase]) {
      acc[match.phase] = [];
    }
    acc[match.phase].push(match);
    return acc;
  }, {});

  const phases = ['group', 'round_16', 'quarter', 'semi', 'final'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header avec gradient moderne */}
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Calendrier des matchs
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Tous les matchs de la CAN 2025 🏆
          </p>
        </div>

        {/* Tabs responsive */}
        <Tabs defaultValue="group" className="space-y-4 sm:space-y-6 lg:space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 h-auto p-1 sm:p-2 bg-muted/50">
            {phases.map((phase) => (
              <TabsTrigger 
                key={phase} 
                value={phase}
                className="text-xs sm:text-sm lg:text-base py-2 sm:py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white transition-all duration-300"
              >
                <span className="hidden sm:inline">{getPhaseLabel(phase)}</span>
                <span className="sm:hidden">
                  {phase === 'group' ? 'Groupes' : 
                   phase === 'round_16' ? '8èmes' : 
                   phase === 'quarter' ? 'Quarts' : 
                   phase === 'semi' ? 'Demi' : 
                   'Finale'}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {phases.map((phase) => (
            <TabsContent 
              key={phase} 
              value={phase} 
              className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-10 mt-4 sm:mt-6 max-w-7xl mx-auto"
            >
              {groupedByPhase[phase] && groupedByPhase[phase].length > 0 ? (
                groupedByPhase[phase].map((match: any) => (
                  <MatchCard key={match.id} match={match} />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="py-8 sm:py-12 lg:py-16">
                    <div className="text-center space-y-2 sm:space-y-4">
                      <div className="text-4xl sm:text-5xl lg:text-6xl">⚽</div>
                      <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                        Aucun match dans cette phase pour le moment
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}