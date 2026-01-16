import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trophy, MapPin, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Match } from '@/types/types';

interface FinalMatchCardProps {
  match: Match;
}

export function FinalMatchCard({ match }: FinalMatchCardProps) {
  const matchDate = new Date(match.match_date);
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/30 bg-linear-to-br from-background via-muted/30 to-background shadow-2xl">
      {/* Header avec trophée */}
      <CardHeader className="bg-linear-to-r from-sky-500/90 via-sky-700 to-primary/90 text-primary-foreground pb-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <Trophy className="h-16 w-16 sm:h-20 sm:w-20" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center">
              <span className="text-primary text-xs font-bold">🏆</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              FINALE
            </h2>
            <p className="text-primary-foreground/80 text-sm sm:text-base font-medium">
              CAN 2025
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 md:p-10">
        {/* Équipes et score */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-center mb-8">
          {/* Équipe domicile */}
          <div className="flex flex-col items-center space-y-3">
            {match.home_team?.flag_url ? (
              <div className="relative w-24 h-16 sm:w-32 sm:h-20 md:w-40 md:h-28">
                <Image
                  src={match.home_team.flag_url}
                  alt={`${match.home_team.name} flag`}
                  fill
                  className="rounded-lg border-4 border-primary/20 shadow-2xl object-cover"
                />
              </div>
            ) : (
              <span className="text-6xl sm:text-7xl md:text-8xl">🏴</span>
            )}
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center">
              {match.home_team?.name || 'TBD'}
            </h3>
            {match.home_team?.code && (
              <span className="text-xs sm:text-sm text-muted-foreground font-semibold">
                {match.home_team.code}
              </span>
            )}
          </div>

          {/* Score ou VS */}
          <div className="flex flex-col items-center space-y-2">
            {isFinished || isLive ? (
              <>
                <div className="flex items-center gap-2 sm:gap-4 text-4xl sm:text-5xl md:text-6xl font-bold">
                  <span className={match.home_score !== null && match.away_score !== null && match.home_score > match.away_score ? 'text-green-600' : ''}>
                    {match.home_score ?? '-'}
                  </span>
                  <span className="text-muted-foreground">:</span>
                  <span className={match.home_score !== null && match.away_score !== null && match.away_score > match.home_score ? 'text-green-600' : ''}>
                    {match.away_score ?? '-'}
                  </span>
                </div>
                {isLive && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full animate-pulse">
                    EN DIRECT
                  </span>
                )}
              </>
            ) : (
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-muted-foreground">
                VS
              </div>
            )}
          </div>

          {/* Équipe extérieur */}
          <div className="flex flex-col items-center space-y-3">
            {match.away_team?.flag_url ? (
              <div className="relative w-24 h-16 sm:w-32 sm:h-20 md:w-40 md:h-28">
                <Image
                  src={match.away_team.flag_url}
                  alt={`${match.away_team.name} flag`}
                  fill
                  className="rounded-lg border-4 border-primary/20 shadow-2xl object-cover"
                />
              </div>
            ) : (
              <span className="text-6xl sm:text-7xl md:text-8xl">🏴</span>
            )}
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center">
              {match.away_team?.name || 'TBD'}
            </h3>
            {match.away_team?.code && (
              <span className="text-xs sm:text-sm text-muted-foreground font-semibold">
                {match.away_team.code}
              </span>
            )}
          </div>
        </div>

        {/* Informations du match */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t-2 border-border">
          <div className="flex items-center space-x-3 text-sm sm:text-base">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-semibold">
                {formatDate(matchDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm sm:text-base">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Heure</p>
              <p className="font-semibold">
                {formatTime(matchDate)}
              </p>
            </div>
          </div>

          {match.stadium && (
            <div className="flex items-center space-x-3 text-sm sm:text-base sm:col-span-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Stade</p>
                <p className="font-semibold">{match.stadium}</p>
              </div>
            </div>
          )}
        </div>

        {/* Badge statut si terminé */}
        {isFinished && (
          <div className="mt-6 text-center">
            <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm font-semibold">
              ✓ Match terminé
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}