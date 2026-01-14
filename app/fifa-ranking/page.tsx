// app/fifa-ranking/page.tsx
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, Globe, MapPin } from 'lucide-react';
import { TeamWithCalculations } from '@/types/types';
import { StatsCard, TeamRow, TeamRowWorld } from '@/components/Ranking';
import { calculateCurrentPoints, calculateWorldRank, getTeamsWithMatches } from '@/lib/ranking';

export default async function FifaRankingPage() {
  const { teams, matches, worldRankings } = await getTeamsWithMatches();

  const teamsWithCurrentPoints = teams.map((team) => {
    const calculated = calculateCurrentPoints(team, matches);
    const worldRankInfo = calculateWorldRank(team.code, calculated.currentPoints, worldRankings);

    return {
      ...team,
      ...calculated,
      worldRank: worldRankInfo.worldRank,
      initialWorldRank: worldRankInfo.initialWorldRank,
    };
  });

  const sortedTeams = [...teamsWithCurrentPoints].sort((a, b) => b.currentPoints - a.currentPoints);

  const africaRanksBefore = [...teams]
    .sort((a, b) => (a.fifa_rank_before ?? Infinity) - (b.fifa_rank_before ?? Infinity))
    .reduce<Record<string, number>>((acc, team, i) => {
      acc[team.id] = i + 1;
      return acc;
    }, {});

  const teamsWithNewRank: TeamWithCalculations[] = sortedTeams.map((team, index) => ({
    ...team,
    newAfricaRank: index + 1,
    africaRankChange: africaRanksBefore[team.id] ? africaRanksBefore[team.id] - (index + 1) : 0,
    worldRankChange: team.initialWorldRank - team.worldRank,
  }));

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Classement FIFA Live</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Impact en temps réel de la CAN 2025 sur le classement mondial FIFA
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Progressions"
          value={teamsWithNewRank.filter((t) => t.africaRankChange > 0).length}
          description="Équipes en hausse"
          icon={TrendingUp}
          colorClass="border-green-200 dark:border-green-900"
        />
        <StatsCard
          title="Stables"
          value={teamsWithNewRank.filter((t) => t.africaRankChange === 0).length}
          description="Sans changement"
          icon={Minus}
          colorClass="border-yellow-200 dark:border-yellow-900"
        />
        <StatsCard
          title="Régressions"
          value={teamsWithNewRank.filter((t) => t.africaRankChange < 0).length}
          description="Équipes en baisse"
          icon={TrendingDown}
          colorClass="border-red-200 dark:border-red-900"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">Classement FIFA - Live CAN 2025</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Classement mis à jour en temps réel selon les résultats de la CAN • {matches.length} matchs comptabilisés
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Tabs defaultValue="africa" className="w-full">
            <TabsList className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 mb-4 sm:mb-6 w-full sm:w-4/5 lg:w-1/2 mx-auto">
              <TabsTrigger value="africa" className="flex items-center gap-1 sm:gap-2 bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Classement Africain</span>
                <span className="xs:hidden">Live CAF</span>
              </TabsTrigger>
              <TabsTrigger value="world" className="flex items-center gap-1 sm:gap-2 bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Rang Mondial</span>
                <span className="xs:hidden">Live FIFA</span>
              </TabsTrigger>
              <TabsTrigger value="world-full" className="flex items-center gap-1 sm:gap-2 bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Classement Mondial</span>
                <span className="xs:hidden">FIFA</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="africa">
              {teamsWithNewRank.length > 0 ? (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 sm:w-20 text-xs sm:text-sm text-center">Rang</TableHead>
                        <TableHead className="w-16 sm:w-20 text-xs sm:text-sm text-center">Évol.</TableHead>
                        <TableHead className="text-xs sm:text-sm">Équipe</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">
                          <span className="hidden sm:inline">Pts actuels</span>
                          <span className="sm:hidden">Total</span>
                        </TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">
                          <span className="hidden sm:inline">Pts gagnés</span>
                          <span className="sm:hidden">+/-</span>
                        </TableHead>
                        <TableHead className="text-center text-xs sm:text-sm hidden md:table-cell">Pts départ</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm hidden sm:table-cell">M</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell text-center">Groupe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamsWithNewRank.map((team) => (
                        <TeamRow key={team.id} team={team} view="africa" africaRanksBefore={africaRanksBefore} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 sm:py-12 text-sm sm:text-base">
                  Les données FIFA seront disponibles prochainement
                </p>
              )}
            </TabsContent>

            <TabsContent value="world">
              {teamsWithNewRank.length > 0 ? (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20 sm:w-24 text-xs sm:text-sm text-center">Rang</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell text-center">CAF</TableHead>
                        <TableHead className="w-16 sm:w-20 text-xs sm:text-sm text-center">Évol.</TableHead>
                        <TableHead className="text-xs sm:text-sm">Équipe</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">
                          <span className="hidden sm:inline text-center">Pts actuels</span>
                          <span className="sm:hidden">Total</span>
                        </TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">
                          <span className="hidden sm:inline">Pts gagnés</span>
                          <span className="sm:hidden">+/-</span>
                        </TableHead>
                        <TableHead className="text-center text-xs sm:text-sm hidden md:table-cell">Pts départ</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm hidden sm:table-cell">M</TableHead>  
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamsWithNewRank.map((team) => (
                        <TeamRow key={team.id} team={team} view="world" africaRanksBefore={africaRanksBefore} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 sm:py-12 text-sm sm:text-base">
                  Les données FIFA seront disponibles prochainement
                </p>
              )}
            </TabsContent>
            {/* NOUVEL Onglet 3: World Full */}
            <TabsContent value="world-full">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 sm:w-20 text-xs sm:text-sm text-center">Rang</TableHead>
                      <TableHead className="w-16 sm:w-20 text-xs sm:text-sm text-center">Évol.</TableHead>
                      <TableHead className="text-xs sm:text-sm">Équipe</TableHead>

                      <TableHead className="text-center text-xs sm:text-sm hidden md:table-cell">Confédération</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm">Points</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm hidden lg:table-cell">Points Précédents</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm hidden lg:table-cell">Rang Prédents</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {worldRankings.map((team) => (
                        <TeamRowWorld key={team.name} team={team} view="world-full" africaRanksBefore={africaRanksBefore} />
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-6 sm:mt-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">Comment fonctionne le classement FIFA ?</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Calcul des points lors d&apos;une compétition continentale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Formule de calcul</h4>
              <p className="text-muted-foreground">
                Points gagnés = I × (W_actual - W_expected) × Coefficient CAF
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Résultat du match (W_actual)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Victoire : 1.0</li>
                  <li>• Match nul : 0.5</li>
                  <li>• Défaite : 0.0</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Importance CAN (I)</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Phase de groupes : 35 points</li>
                  <li>• Phase à élimination : 40 points</li>
                  <li>• Finale : 50 points</li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Force de l&apos;opposition (W_expected)</h4>
              <p className="text-muted-foreground">
                La probabilité de victoire attendue est calculée avec la formule Elo : 
                W_expected = 1 / (10^((points_adversaire - points_équipe) / 600) + 1).
                Plus l&apos;adversaire a de points, plus la victoire rapporte de points.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Coefficient CAF</h4>
              <p className="text-muted-foreground">
                La Confédération Africaine de Football (CAF) a un coefficient de 1.0 dans le calcul FIFA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}