import Link from 'next/link';
import { Calendar, Trophy, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseServer } from '@/lib/supabase/server';

async function getOverviewData() {
  const supabase = await supabaseServer();
  const [teamsResult, matchesResult, upcomingResult] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact' }),
    supabase.from('matches').select('*', { count: 'exact' }).eq('status', 'finished'),
    supabase.from('matches').select('*, home_team:teams!matches_home_team_id_fkey(name, code), away_team:teams!matches_away_team_id_fkey(name, code)').in('status', ['scheduled', 'live']).order('match_date', { ascending: true }).limit(4),
  ]);

  return {
    totalTeams: teamsResult.count || 0,
    matchesPlayed: matchesResult.count || 0,
    upcomingMatches: upcomingResult.data || []
  };
}

export default async function Home() {
  const { totalTeams, matchesPlayed, upcomingMatches } = await getOverviewData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
          CAN 2025
        </h1>
        <p className="text-xl text-muted-foreground">
          Coupe d&apos;Afrique des Nations - Maroc 2025
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Équipes</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTeams}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nations participantes
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matchs joués</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{matchesPlayed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Rencontres disputées
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phase actuelle</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Huitièmes</div>
            <p className="text-xs text-muted-foreground mt-1">
              En cours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Prochains matchs
            </CardTitle>
            <CardDescription>Les rencontres à venir</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((match: any) => (
                  <div key={match.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-right flex-1">
                        <p className="font-medium">{match.home_team?.name || 'TBD'}</p>
                        <p className="text-sm text-muted-foreground">{match.home_team?.code || ''}</p>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-xs text-muted-foreground">
                          {match.status === 'live' ? 'EN DIRECT' : new Date(match.match_date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-lg font-bold">VS</p>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium">{match.away_team?.name || 'TBD'}</p>
                        <p className="text-sm text-muted-foreground">{match.away_team?.code || ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun match à venir pour le moment</p>
            )}
            <Link href="/matches">
              <Button variant="outline" className="w-full mt-4">
                Voir tous les matchs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Accès rapide
            </CardTitle>
            <CardDescription>Explorez la compétition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/standings">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-950">
                  <Trophy className="h-6 w-6 text-green-600" />
                  <span>Classements</span>
                </Button>
              </Link>
              <Link href="/teams">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-yellow-50 dark:hover:bg-yellow-950">
                  <Users className="h-6 w-6 text-yellow-600" />
                  <span>Équipes</span>
                </Button>
              </Link>
              <Link href="/fifa-ranking">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                  <span>FIFA</span>
                </Button>
              </Link>
              <Link href="/matches">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <span>Calendrier</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
