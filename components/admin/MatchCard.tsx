import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OFFICIAL_STADIUMS, PHASES, STATUSES } from '@/types/constants';
import { Match } from '@/types/types';

// ==================== UTILITY FUNCTIONS ====================
const getStadiumInfo = (stadiumId: string) => {
  return OFFICIAL_STADIUMS.find(s => s.id === stadiumId);
};

// ==================== MATCH CARD COMPONENT ====================
export const MatchCard: React.FC<{
  match: Match;
  onEdit: (match: Match) => void;
  onDelete: (id: string) => void;
}> = ({ match, onEdit, onDelete }) => {
  const phaseInfo = PHASES.find(p => p.value === match.phase);
  const statusInfo = STATUSES.find(s => s.value === match.status);
  const stadium = getStadiumInfo(match.stadium || '');

  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden group">
      {/* Bande colorée selon la phase */}
      <div className={`h-1 ${phaseInfo?.color || 'bg-gray-500'}`} />
      
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6">
          
          {/* Section supérieure : Informations et badges */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Date et heure */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{new Date(match.match_date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
                <span className="font-medium text-primary">
                  {new Date(match.match_date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {/* Stade */}
              {match.stadium && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">{stadium?.name || match.stadium}</span>
                </div>
              )}
            </div>

            {/* Badges et statut */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline">{phaseInfo?.label}</Badge>
              {match.group_name && <Badge variant="outline">{match.group_name}</Badge>}
              <Badge className={`${statusInfo?.color} text-white bg-slate-600 border-0`}>
                {statusInfo?.label}
              </Badge>
            </div>
          </div>

          {/* Section principale : Match */}
          <div className="flex items-center justify-between gap-4 bg-linear-to-r from-slate-50 to-transparent dark:from-slate-800 dark:to-transparent rounded-xl p-4">
            {/* Équipe domicile */}
            <div className="flex items-center gap-3 flex-1">
              {match.home_team?.flag_url && (
                <div className="relative w-12 h-8 shrink-0">
                  <Image 
                    src={match.home_team.flag_url} 
                    alt={match.home_team.name} 
                    fill
                    className="object-cover rounded shadow" 
                  />
                </div>
              )}
              <span className="font-bold text-base sm:text-lg truncate">
                {match.home_team?.name || 'TBD'}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg px-4 sm:px-6 py-2 sm:py-3 shadow-lg shrink-0">
              <span className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {match.home_score ?? '-'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-muted-foreground">-</span>
              <span className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {match.away_score ?? '-'}
              </span>
            </div>

            {/* Équipe extérieure */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              <span className="font-bold text-base sm:text-lg text-right truncate">
                {match.away_team?.name || 'TBD'}
              </span>
              {match.away_team?.flag_url && (
                <div className="relative w-12 h-8 shrink-0">
                  <Image 
                    src={match.away_team.flag_url} 
                    alt={match.away_team.name} 
                    fill
                    className="object-cover rounded shadow" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section inférieure : Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(match)}
              className="hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(match.id)}
              className="hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};