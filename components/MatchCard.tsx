import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { OFFICIAL_STADIUMS } from "@/types/constants";

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
      className={status === 'live' ? 'bg-linear-to-r from-red-500 to-pink-600 text-white animate-pulse' : ''}
    >
      {config.label}
    </Badge>
  );
}

const getStadiumInfo = (stadiumId: string) => {
  return OFFICIAL_STADIUMS.find(s => s.id === stadiumId);
};

export function MatchCard({ match }: { match: any }) {
  const stadium = getStadiumInfo(match.stadium);
  return (
    <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-linear-to-br from-card to-muted/50 border-2">
      <CardHeader className="pb-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="wrap-break-words">{new Date(match.match_date).toLocaleDateString('fr-FR', {
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
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">{stadium?.name}, {stadium?.city}</span>
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
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
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
