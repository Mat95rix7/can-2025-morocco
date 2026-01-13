import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Team } from "@/types/types";

interface TeamCardProps {
  team: Team;
  playerCount: number;
}

export function TeamCard({ team, playerCount }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.id}`} className="block">
      <Card className="hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer h-full bg-slate-900 hover:bg-slate-800 border-slate-700">
        <CardContent className="p-3 sm:p-4 md:p-5">
          {/* Header avec drapeau et nom */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {team.flag_url ? (
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                <Image
                  src={team.flag_url}
                  alt={`${team.name} flag`}
                  fill
                  className="rounded object-cover"
                />
              </div>
            ) : (
              <div className="text-2xl sm:text-3xl">🏳️</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">
                {team.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                {team.code}
              </p>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-slate-700/50 my-2 sm:my-3" />

          {/* Stats - Layout adaptatif */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
            {/* Rang FIFA */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 truncate">
                Rang FIFA
              </p>
              <p className="text-base sm:text-lg md:text-xl font-bold truncate">
                {team.fifa_rank_before ?? 'N/A'}
              </p>
            </div>

            {/* Points FIFA */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 truncate">
                Points FIFA
              </p>
              <p className="text-base sm:text-lg md:text-xl font-bold truncate">
                {team.fifa_points_before ? team.fifa_points_before.toFixed(0) : '0'}
              </p>
            </div>

            {/* Joueurs */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 text-muted-foreground shrink-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">{playerCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}