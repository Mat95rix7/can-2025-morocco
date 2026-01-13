import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Calendar, MapPin, Pencil, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OFFICIAL_STADIUMS, PHASES, STATUSES } from '@/types/constants';
import { Match, Player, Team } from '@/types/types';

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
      
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          
          {/* DESKTOP : Section supérieure avec toutes les infos sur une ligne */}
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Date et heure */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
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

          {/* MOBILE : Infos en colonnes */}
          <div className="flex sm:hidden flex-col gap-2">
            {/* Première ligne : Date / Phase et Statut */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-start flex-col gap-2">
              {/* Date à gauche */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
              {/* Deuxième ligne : Stade */}
              {match.stadium && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{stadium?.name || match.stadium}</span>
                </div>
              )} 
              </div>            
              
              {/* Phase et Statut à droite */}
              <div className="flex items-center flex-col gap-2">
                <Badge variant="outline" className="text-xs">{phaseInfo?.label}</Badge>
                <Badge className={`${statusInfo?.color} text-white bg-slate-600 border-0 text-xs`}>
                  {statusInfo?.label}
                </Badge>
              </div>
            </div>
          </div>
            
             


          {/* DESKTOP : Match horizontal avec score au centre */}
          <div className="hidden sm:flex sm:items-center justify-between gap-4 bg-linear-to-r from-slate-50 to-transparent dark:from-slate-800 dark:to-transparent rounded-xl p-4">
            {/* Équipe domicile */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
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
              <span className="font-bold text-base lg:text-lg truncate">
                {match.home_team?.name || 'TBD'}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg px-6 py-3 shadow-lg shrink-0">
              <span className="text-2xl lg:text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {match.home_score ?? '-'}
              </span>
              <span className="text-xl lg:text-2xl font-bold text-muted-foreground">-</span>
              <span className="text-2xl lg:text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {match.away_score ?? '-'}
              </span>
            </div>

            {/* Équipe extérieure */}
            <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
              <span className="font-bold text-base lg:text-lg text-right truncate">
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

          {/* MOBILE : Équipes côte à côte en haut, score en bas */}
          <div className="flex sm:hidden flex-col gap-3 bg-linear-to-r from-slate-50 to-transparent dark:from-slate-800 dark:to-transparent rounded-xl p-3">
            {/* Équipes côte à côte */}
            <div className="flex items-center justify-between gap-2">
              {/* Équipe domicile */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {match.home_team?.flag_url && (
                  <div className="relative w-10 h-7 shrink-0">
                    <Image 
                      src={match.home_team.flag_url} 
                      alt={match.home_team.name} 
                      fill
                      className="object-cover rounded shadow" 
                    />
                  </div>
                )}
                <span className="font-bold text-sm truncate">
                  {match.home_team?.name || 'TBD'}
                </span>
              </div>

              {/* VS */}
              <span className="text-xs font-semibold text-muted-foreground px-2">VS</span>

              {/* Équipe extérieure */}
              <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                <span className="font-bold text-sm text-right truncate">
                  {match.away_team?.name || 'TBD'}
                </span>
                {match.away_team?.flag_url && (
                  <div className="relative w-10 h-7 shrink-0">
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

            {/* Score en bas */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 rounded-lg px-6 py-3 shadow-lg">
                <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {match.home_score ?? '-'}
                </span>
                <span className="text-xl font-bold text-muted-foreground">-</span>
                <span className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {match.away_score ?? '-'}
                </span>
              </div>
              
              {/* Groupe sous le score */}
              {match.group_name && (
                <Badge variant="outline" className="text-xs">{match.group_name}</Badge>
              )}
            </div>
          </div>

          {/* Section inférieure : Actions */}
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(match)}
              className="hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm w-full sm:w-auto"
            >
              <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(match.id)}
              className="hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 text-xs sm:text-sm w-full sm:w-auto"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Supprimer
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export const TeamCard: React.FC<{
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (id: string) => void;
  onClick: (team: Team) => void;
  playerCount: number;
}> = ({ team, onEdit, onDelete, onClick, playerCount }) => (
  <Card 
    className="bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
    onClick={() => onClick(team)}
  >
    <CardContent className="pt-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 w-full">
          <div className="text-4xl shrink-0">
            {team.flag_url ? (
              <Image src={team.flag_url} alt={team.name} width={48} height={32} className="w-12 h-8 object-cover rounded" />
            ) : '🏳️'}
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <div>
              <h3 className="font-bold truncate">{team.name}</h3>
              <p className="text-sm text-muted-foreground">{team.code}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {team.fifa_rank_before && <Badge variant="outline" className="text-xs">Rang: {team.fifa_rank_before}</Badge>}
              {team.fifa_points_before && <Badge variant="outline" className="text-xs">Points: {team.fifa_points_before}</Badge>}
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex flex-col items-start sm:items-end gap-2">
            {team.group_name && <Badge variant="outline" className="text-xs">{team.group_name}</Badge>}
            <Badge variant="secondary" className="gap-1 text-xs">
              <Users className="w-3 h-3" />
              {playerCount} joueurs
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onEdit(team); }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onDelete(team.id); }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const PlayerCard: React.FC<{
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
}> = ({ player, onEdit, onDelete }) => (
  <Card className="bg-slate-900">
    <CardContent className="pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
            {player.number || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold truncate">{player.firstname} {player.lastname}</h3>
            <p className="text-sm text-muted-foreground truncate">{player.team?.name || 'Sans équipe'}</p>
            {player.position && <Badge variant="outline" className="mt-1 text-xs">{player.position}</Badge>}
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={() => onEdit(player)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(player.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const StadiumCard: React.FC<{ stadium: typeof OFFICIAL_STADIUMS[0] }> = ({ stadium }) => (
  <Card className="bg-slate-900 hover:bg-slate-800 transition-all duration-300 overflow-hidden group border border-slate-700">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-2 truncate">{stadium.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{stadium.city}</span>
          </div>
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Users className="w-3 h-3" />
            {stadium.capacity.toLocaleString()} places
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);
