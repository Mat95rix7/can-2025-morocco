import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { OFFICIAL_STADIUMS } from "@/types/constants";
import { Match } from "@/types/types";

interface StatusConfig {
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  label: string;
  className?: string;
}

function getStatusBadge(status: string) {
  const variants: Record<string, StatusConfig> = {
    scheduled: { variant: 'secondary', label: 'À venir' },
    live: { 
      variant: 'default', 
      label: 'EN DIRECT',
      className: 'bg-gradient-to-r from-red-500 to-pink-600 text-white animate-pulse'
    },
    finished: { variant: 'outline', label: 'Terminé' }
  };
  
  const config = variants[status] || variants.scheduled;
  
  return (
    <Badge 
      variant={config.variant} 
      className={config.className || ''}
    >
      {config.label}
    </Badge>
  );
}

const getStadiumInfo = (stadiumId: string) => {
  return OFFICIAL_STADIUMS.find(s => s.id === stadiumId);
};

export function MatchCard({ match }: { match: Match }) {
  const stadium = getStadiumInfo(match.stadium || '');
  
  return (
    <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-linear-to-br from-card to-muted/50 border-2 bg-slate-900 hover:bg-slate-800 border-slate-700">
      <CardHeader className="pb-2 sm:pb-3 space-y-2 px-3 sm:px-6 pt-3 sm:pt-6">
        {/* DESKTOP : Info sur une ligne */}
        <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(match.match_date).toLocaleDateString('fr-FR', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span className="font-medium text-primary">
              {new Date(match.match_date).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          {getStatusBadge(match.status)}
        </div>

        {/* MOBILE : Date et statut sur la même ligne, stade en dessous */}
        <div className="flex sm:hidden flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            {/* Date */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="whitespace-nowrap">
                {new Date(match.match_date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
              <span className="font-medium text-primary whitespace-nowrap">
                {new Date(match.match_date).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {/* Statut */}
            {getStatusBadge(match.status)}
          </div>

          {/* Stade */}
          {match.stadium && stadium && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{stadium.name}, {stadium.city}</span>
            </div>
          )}
        </div>

        {/* DESKTOP : Stade */}
        {match.stadium && stadium && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{stadium.name}, {stadium.city}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 items-center">
          {/* Équipe domicile */}
          <div className="text-center space-y-1 sm:space-y-2">
            <div className="flex justify-center">
              {match.home_team?.flag_url ? (
                <div className="relative w-10 h-7 sm:w-12 sm:h-8 lg:w-16 lg:h-12">
                  <Image
                    src={match.home_team.flag_url}
                    alt={`${match.home_team.name} flag`}
                    fill
                    className="rounded-sm border-2 border-primary/20 shadow-lg object-cover"
                  />
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl lg:text-4xl">🏳️</span>
              )}
            </div>   
            <p className="font-semibold text-xs sm:text-sm lg:text-base truncate px-1">
              {match.home_team?.name || 'TBD'}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted/50 rounded px-1 py-0.5 inline-block">
              {match.home_team?.code || ''}
            </p>
          </div>

          {/* Score / VS */}
          <div className="text-center">
            {match.status === 'finished' || match.status === 'live' ? (
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  {match.home_score ?? '-'} - {match.away_score ?? '-'}
                </div>
                {match.status === 'live' && (
                  <Badge variant="destructive" className="animate-pulse text-[10px] sm:text-xs">
                    LIVE
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-muted-foreground">
                VS
              </div>
            )}
          </div>

          {/* Équipe extérieure */}
          <div className="text-center space-y-1 sm:space-y-2">
            <div className="flex justify-center">
              {match.away_team?.flag_url ? (
                <div className="relative w-10 h-7 sm:w-12 sm:h-8 lg:w-16 lg:h-12">
                  <Image
                    src={match.away_team.flag_url}
                    alt={`${match.away_team.name} flag`}
                    width={48}
                    height={48}
                    className="rounded-sm border-2 border-primary/20 shadow-lg object-cover"
                  />
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl lg:text-4xl">🏳️</span>
              )}
            </div>           
            <p className="font-semibold text-xs sm:text-sm lg:text-base truncate px-1">
              {match.away_team?.name || 'TBD'}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted/50 rounded px-1 py-0.5 inline-block">
              {match.away_team?.code || ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}