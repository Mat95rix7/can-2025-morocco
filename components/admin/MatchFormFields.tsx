import { Team } from "@/types/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { GROUPS, OFFICIAL_STADIUMS, PHASES, STATUSES } from "@/types/constants";
import Image from "next/image";
import { Database } from "@/lib/database.types";

type MatchInsert = Database['public']['Tables']['matches']['Insert'];

interface MatchFormFieldsProps {
  form: MatchInsert;
  setForm: React.Dispatch<React.SetStateAction<MatchInsert>>;
  teams: Team[];
}

// Form Fields Component
export const MatchFormFields: React.FC<MatchFormFieldsProps> = ({
  form,
  setForm,
  teams,
}) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label className="text-sm font-medium">Équipe domicile *</Label>
      <Select
        value={form.home_team_id || ''}
        onValueChange={(v) => setForm({ ...form, home_team_id: v })}
      >
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Sélectionner une équipe" />
        </SelectTrigger>

        <SelectContent>
          {teams.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              <div className="flex items-center gap-2">
                {t.flag_url && (
                  <div className="relative w-6 h-4">
                    <Image
                      src={t.flag_url}
                      alt={`Drapeau ${t.name}`}
                      fill
                      sizes="24px"
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <span>{t.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Équipe extérieure *</Label>
      <Select
        value={form.away_team_id || ''}
        onValueChange={(v) => setForm({ ...form, away_team_id: v })}
      >
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Sélectionner une équipe" />
        </SelectTrigger>

        <SelectContent>
          {teams.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              <div className="flex items-center gap-2">
                {t.flag_url && (
                  <div className="relative w-6 h-4">
                    <Image
                      src={t.flag_url}
                      alt={`Drapeau ${t.name}`}
                      fill
                      sizes="24px"
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <span>{t.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Score domicile</Label>
      <Input
        type="number"
        min="0"
        value={form.home_score || 0}
        onChange={(e) => setForm({ ...form, home_score: +e.target.value })}
        className="h-11"
      />
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Score extérieur</Label>
      <Input
        type="number"
        min="0"
        value={form.away_score || 0}
        onChange={(e) => setForm({ ...form, away_score: +e.target.value })}
        className="h-11"
      />
    </div>

    <div className="space-y-2 md:col-span-2">
      <Label className="text-sm font-medium">Date et heure *</Label>
      <Input
        type="datetime-local"
        value={form.match_date || ''}
        onChange={(e) => setForm({ ...form, match_date: e.target.value })}
        className="h-11"
      />
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Stade *</Label>
      <Select value={form.stadium || ''} onValueChange={(v) => setForm({ ...form, stadium: v })}>
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Sélectionner un stade" />
        </SelectTrigger>
        <SelectContent>
          {OFFICIAL_STADIUMS.map(s => (
            <SelectItem key={s.id} value={s.id}>
              <div className="flex flex-col">
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.city}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Phase *</Label>
      <Select value={form.phase || 'group'} onValueChange={(v) => setForm({ ...form, phase: v })}>
        <SelectTrigger className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PHASES.map(p => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Statut *</Label>
      <Select value={form.status || 'scheduled'} onValueChange={(v) => setForm({ ...form, status: v })}>
        <SelectTrigger className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map(s => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {form.phase === 'group' && (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Groupe</Label>
        <Select value={form.group_name || ''} onValueChange={(v) => setForm({ ...form, group_name: v })}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Sélectionner un groupe" />
          </SelectTrigger>
          <SelectContent>
            {GROUPS.map(g => (
              <SelectItem key={g} value={g}>Groupe {g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
  </div>
);