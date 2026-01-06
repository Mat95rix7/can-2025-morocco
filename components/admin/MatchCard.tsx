// Match Card Component
import { OFFICIAL_STADIUMS, PHASES, STATUSES } from "@/types/constants";
import { Match } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ==================== UTILITY FUNCTIONS ====================
const getStadiumInfo = (stadiumId: string) => {
  return OFFICIAL_STADIUMS.find(s => s.id === stadiumId);
};

const formatMatchDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
};
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
      <div className={`h-1 ${phaseInfo?.color || 'bg-gray-500'}`} />
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex gap-3 flex-col">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{formatMatchDate(match.match_date)}</span>
                <span>{stadium?.name || match.stadium}</span>
                
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{phaseInfo?.label}</Badge>
                {match.group_name && <Badge variant="outline">{match.group_name}</Badge>}
                <Badge className={`${statusInfo?.color} text-white bg-slate-600 border-0 ml-auto`}>
                  {statusInfo?.label}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 bg-linear-to-r from-slate-50 to-transparent dark:from-slate-800 dark:to-transparent rounded-xl p-4">
              <div className="flex items-center gap-3 flex-1">
                {match.home_team?.flag_url && (
                  <img src={match.home_team.flag_url} alt="" className="w-12 h-8 object-cover rounded shadow" />
                )}
                <span className="font-bold text-lg">{match.home_team?.name || 'TBD'}</span>
              </div>

              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg px-6 py-3 shadow-lg">
                <span className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {match.home_score}
                </span>
                <span className="text-2xl font-bold text-muted-foreground">-</span>
                <span className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {match.away_score}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="font-bold text-lg text-right">{match.away_team?.name || 'TBD'}</span>
                {match.away_team?.flag_url && (
                  <img src={match.away_team.flag_url} alt="" className="w-12 h-8 object-cover rounded shadow" />
                )}
              </div>
            </div>
          </div>

          <div className="flex lg:flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(match)}
              className="flex-1 lg:flex-none hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(match.id)}
              className="flex-1 lg:flex-none hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
