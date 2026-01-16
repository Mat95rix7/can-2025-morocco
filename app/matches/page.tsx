import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from '@/components/MatchCard';
import { Match } from '@/types/types';
import { FinalMatchCard } from '@/components/FinalMatchCard';
import { Trophy } from 'lucide-react';

type PhaseType = 'group' | 'round_16' | 'quarter' | 'semi' | 'final';

async function getMatches(): Promise<Match[]> {
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

  return (data as Match[]) || [];
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

function getPhaseLabelShort(phase: string): string {
  const labels: Record<string, string> = {
    group: 'Groupes',
    round_16: '8èmes',
    quarter: 'Quarts',
    semi: 'Demi',
    final: 'Finale'
  };
  return labels[phase] || phase;
}

export default async function MatchesPage() {
  const matches = await getMatches();

  const groupedByPhase = matches.reduce((acc: Record<string, Match[]>, match: Match) => {
    if (!acc[match.phase]) {
      acc[match.phase] = [];
    }
    acc[match.phase].push(match);
    return acc;
  }, {});

  const phases: PhaseType[] = ['group', 'round_16', 'quarter', 'semi', 'final'];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Calendrier des matchs
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground">
            Tous les matchs de la CAN 2025 🏆
          </p>
        </div>

        {/* Tabs responsive */}
        <Tabs defaultValue="group" className="space-y-4 sm:space-y-6 lg:space-y-8">
          <TabsList className="grid w-full gap-1 sm:gap-2 h-auto p-1 sm:p-2 bg-muted/50 grid-cols-2 sm:grid-cols-6 lg:grid-cols-5">
              {phases.map((phase, index) => {
                const isLastOnMobile = index === phases.length - 1 && phases.length % 2 !== 0;
                const isInLastRowTablet = index >= phases.length - 2 && phases.length % 3 !== 0;
                
                return (
                  <TabsTrigger 
                    key={phase} 
                    value={phase}
                    className={`
                      text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 lg:py-3 
                      data-[state=active]:bg-linear-to-r data-[state=active]:from-primary 
                      data-[state=active]:to-accent data-[state=active]:text-white 
                      transition-all duration-300
                      ${isLastOnMobile ? 'col-span-2' : ''}
                      ${isInLastRowTablet ? 'sm:col-span-3' : 'sm:col-span-2'}
                      lg:col-span-1
                    `}
                  >
                    <span className="hidden sm:inline">{getPhaseLabel(phase)}</span>
                    <span className="sm:hidden">{getPhaseLabelShort(phase)}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {phases.map((phase) => (
            <TabsContent 
              key={phase} 
              value={phase} 
              className="mt-4 sm:mt-6"
            >
              {phase === 'final' ? (
                // Carte spéciale pour la finale
                <div className="max-w-4xl mx-auto">
                  {groupedByPhase[phase] && groupedByPhase[phase].length > 0 ? (
                    groupedByPhase[phase].map((match: Match) => (
                      <FinalMatchCard 
                        key={match.id} 
                        match={match}
                      />
                    ))
                  ) : (
                    <Card className="border-2 border-yellow-500/50">
                      <CardContent className="py-8 sm:py-12 lg:py-16">
                        <div className="text-center space-y-2 sm:space-y-4">
                          <Trophy className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-yellow-500" />
                          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                            La finale n&apos;est pas encore programmée
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                // Grille normale pour les autres phases
                <div className={`grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 mx-auto w-full ${
                  phase === 'group' 
                    ? 'lg:grid-cols-2 xl:grid-cols-3' 
                    : 'lg:grid-cols-2 max-w-5xl'
                }`}>
                  {groupedByPhase[phase] && groupedByPhase[phase].length > 0 ? (
                    groupedByPhase[phase].map((match: Match) => (
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
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}