import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from '@/components/MatchCard';

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
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header avec gradient moderne */}
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
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
                className="text-xs sm:text-sm lg:text-base py-2 sm:py-3 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white transition-all duration-300"
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
              className="grid grid-cols-[repeat(auto-fit,minmax(600px,1fr))] gap-3 sm:gap-4 lg:gap-10 mt-4 sm:mt-6 max-w-7xl mx-auto"
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