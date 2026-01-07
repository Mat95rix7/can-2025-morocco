import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export function TeamCard({ team, playerCount }: { team: any; playerCount: number }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer h-full bg-slate-900 hover:bg-slate-800">
        <CardContent className="p-4">
          {/* Header avec drapeau et nom */}
          <div className="flex items-center gap-3 mb-3">
            {team.flag_url ? (
              <Image
                src={team.flag_url}
                alt={`${team.name} flag`}
                width={40}
                height={40}
                className="rounded"
              />
            ) : (
              <div className="text-3xl">🏳️</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{team.name}</h3>
              <p className="text-sm text-muted-foreground">{team.code}</p>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t my-3" />

          {/* Stats en ligne */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Rang FIFA</p>
              <p className="text-lg font-bold">{team.fifa_rank_before || 'N/A'}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Points FIFA</p>
              <p className="text-lg font-bold">{team.fifa_points_before.toFixed(0) || 0}</p>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{playerCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}