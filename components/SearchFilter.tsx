// Search and Filter Bar Component
import { Filter, Plus, Search } from "lucide-react";
import { Card, CardContent,  } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { PHASES, STATUSES } from "@/types/constants";
export const SearchFilterBar: React.FC<{
  search: string;
  onSearchChange: (value: string) => void;
  filterPhase?: string;
  onFilterPhaseChange?: (value: string) => void;
  filterStatus?: string;
  onFilterStatusChange?: (value: string) => void;
  onCreateClick: () => void;
  createLabel: string;
  showFilters?: boolean;
}> = ({
  search,
  onSearchChange,
  filterPhase,
  onFilterPhaseChange,
  filterStatus,
  onFilterStatusChange,
  onCreateClick,
  createLabel,
  showFilters = false
}) => (
  <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
    <CardContent className="pt-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 border-slate-200 dark:border-slate-700"
          />
        </div>
        {showFilters && (
          <>
            <Select value={filterPhase} onValueChange={onFilterPhaseChange}>
              <SelectTrigger className="w-full md:w-48 h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les phases</SelectItem>
                {PHASES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-full md:w-48 h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        )}
        <Button onClick={onCreateClick} className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30">
          <Plus className="w-4 h-4 mr-2" />{createLabel}
        </Button>
      </div>
    </CardContent>
  </Card>
);