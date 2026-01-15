import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { TeamWithCalculations, WorldTeam } from "@/types/types";

function RankingBadge({ change, type }: { change: number; type: string }) {
  if (type === 'up') {
    return (
      <Badge className="bg-green-600  gap-1 text-xs">
        <TrendingUp className="h-3 w-3" />
        <span className="hidden xs:inline">+{change}</span>
        <span className="xs:hidden">+{change}</span>
      </Badge>
    );
  } else if (type === 'down') {
    return (
      <Badge variant="destructive" className="gap-1 text-xs">
        <TrendingDown className="h-3 w-3" />
        <span className="hidden xs:inline">-{change}</span>
        <span className="xs:hidden">-{change}</span>
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 text-xs">
      <Minus className="h-3 w-3" />
      =
    </Badge>
  );
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  colorClass 
}: { 
  title: string; 
  value: number; 
  description: string; 
  icon: React.ComponentType<{ className?: string }>; 
  colorClass: string;
}) {
  return (
    <Card className={colorClass}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export function TeamRow({ 
  team, 
  view,
  africaRanksBefore
}: { 
  team: TeamWithCalculations; 
  view: 'africa' | 'world' | 'world-full';
  africaRanksBefore: Record<string, number>;
}) {
  const changeType = view === 'africa' 
    ? (team.africaRankChange > 0 ? 'up' : team.africaRankChange < 0 ? 'down' : 'stable')
    : (team.worldRankChange > 0 ? 'up' : team.worldRankChange < 0 ? 'down' : 'stable');
  
  const change = view === 'africa' ? team.africaRankChange : team.worldRankChange;
  const rank = view === 'africa' ? team.newAfricaRank : team.worldRank;

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-bold text-base sm:text-lg py-3 sm:py-4 ">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <span>#{rank}</span>
        </div>
      </TableCell>
      {view === 'world' && (
        <TableCell className="text-center py-3 sm:py-4 hidden lg:table-cell">
          <Badge variant="outline" className="text-xs sm:text-sm">#{team.newAfricaRank}</Badge>
        </TableCell>
      )}
      <TableCell className="py-3 sm:py-4 text-center">
        <RankingBadge change={Math.abs(change)} type={changeType} />
      </TableCell>
      <TableCell className="py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-6 sm:w-12 sm:h-8 relative shrink-0">
            {team?.flag_url ? (
              <Image
                src={team.flag_url}
                alt={`${team.name} flag`}
                fill
                className="object-cover rounded"
              />
            ) : (
              <span className="text-xl sm:text-2xl">🏳️</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm sm:text-base truncate">{team.name}</p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {team.code} • Rang initial {view === 'africa' ? 'CAF' : 'FIFA'}: #{view === 'africa' ? africaRanksBefore[team.id] : team.initialWorldRank}
            </p>
            <p className="text-xs text-muted-foreground sm:hidden">
              {team.code}
            </p>
          </div>
        </div>
      </TableCell>      
      <TableCell className="text-center py-3 sm:py-4">
        <span className="font-bold text-base sm:text-lg text-primary">
          {team.currentPoints.toFixed(2)}
        </span>
      </TableCell>
      <TableCell className="text-center py-3 sm:py-4">
        {team.pointsGained > 0 ? (
          <Badge className="bg-green-600 text-xs sm:text-sm">
            +{team.pointsGained.toFixed(2)}
          </Badge>
        ) : team.pointsGained < 0 ? (
          <Badge variant="destructive" className="text-xs sm:text-sm">
            {team.pointsGained.toFixed(2)}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell className="text-center py-3 sm:py-4 hidden md:table-cell">
        <span className="font-medium text-muted-foreground text-sm sm:text-base">
          {team.fifa_points_before.toFixed(2)}
        </span>
      </TableCell>
      <TableCell className="text-center py-3 sm:py-4 hidden sm:table-cell">
        <Badge variant="outline" className="text-xs sm:text-sm">{team.matchesPlayed}</Badge>
      </TableCell>
      {view === 'africa' && (
        <TableCell className="py-3 sm:py-4 hidden lg:table-cell text-center">
          {team.group_name ? (
            <Badge variant="outline" className="text-xs sm:text-sm">{team.group_name}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}

export function TeamRowWorld({ 
  team, 
  view,
  africaRanksBefore
}: { 
  team: WorldTeam; 
  view: 'africa' | 'world' | 'world-full';
  africaRanksBefore: Record<string, number>;
}) {

  const previousRank = team.previous_rank ?? team.rank
  const change = Math.abs(team.rank - previousRank)

  const type =
  team.rank < previousRank
    ? 'up'
    : team.rank > previousRank
    ? 'down'
    : 'stable'


  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-bold text-base sm:text-lg py-3 sm:py-4 ">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <span>#{team.rank}</span>
        </div>
      </TableCell>
      <TableCell className="py-3 sm:py-4 text-center">
        <RankingBadge change={change} type={type} />
      </TableCell>
      <TableCell className="py-3 sm:py-4 max-w-20 sm:max-w-30 lg:max-w-45 xl:max-w-65">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-6 sm:w-12 sm:h-8 relative shrink-0">
            {team?.flag_url ? (
              <Image
                src={team.flag_url}
                alt={`${team.name} flag`}
                fill
                className="object-cover rounded"
                unoptimized
              />
            ) : (
              <span className="text-xl sm:text-2xl">🏳️</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm sm:text-base truncate">{team.name}</p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {team.country_code} • Rang initial {view === 'africa' ? 'CAF' : 'FIFA'}: #{view === 'africa' ? africaRanksBefore[team.id] : team.previous_rank}
            </p>
            <p className="text-xs text-muted-foreground sm:hidden">
              {team.country_code}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center py-3 sm:py-4 hidden md:table-cell">
          <Badge className="bg-green-600 text-xs sm:text-sm">
            {team.confederation}
          </Badge>
      </TableCell>    
      <TableCell className="text-center py-3 sm:py-4">
        <span className="font-bold text-base sm:text-lg text-primary">
          {team.points.toFixed(2)}
        </span>
      </TableCell>
      <TableCell className="text-center py-3 sm:py-4 hidden lg:table-cell">
        <span className="font-medium text-muted-foreground text-sm sm:text-base">
          {team.previous_points.toFixed(2)}
        </span>
      </TableCell>
      <TableCell className="text-center py-3 sm:py-4 hidden lg:table-cell">
        <Badge variant="outline" className="text-xs sm:text-sm">#{team.previous_rank}</Badge>
      </TableCell>
    </TableRow>
  );
}
