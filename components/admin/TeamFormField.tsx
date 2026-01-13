import { GROUPS } from "@/types/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

import { Team } from "@/types/types";

// export interface TeamForm {
//   name: string;
//   code: string;
//   flag_url?: string | null;
//   group_name?: string | null;
//   fifa_rank_before?: number | null;
//   fifa_points_before?: number | null;
// }

interface TeamFormFieldsProps {
  form: Team;
  setForm: React.Dispatch<React.SetStateAction<Team>>;
}


export const TeamFormFields: React.FC<TeamFormFieldsProps> = ({ form, setForm }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label className="text-sm font-medium">Nom de l&apos;équipe *</Label>
      <Input
        value={form.name || ''}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Ex: Côte d'Ivoire"
        className="h-11"
      />
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Code (3 lettres) *</Label>
      <Input
        value={form.code || ''}
        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
        placeholder="CIV"
        maxLength={3}
        className="h-11"
      />
    </div>

    <div className="space-y-2 md:col-span-2">
      <Label className="text-sm font-medium">URL du drapeau</Label>
      <Input
        value={form.flag_url || ''}
        onChange={(e) => setForm({ ...form, flag_url: e.target.value })}
        placeholder="https://..."
        className="h-11"
      />

      {form.flag_url && (
        <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Aperçu :</p>
          <div className="relative w-16 h-10">
            <Image
              src={form.flag_url}
              alt="Drapeau"
              fill
              className="object-cover rounded shadow"
              sizes="64px"
            />
          </div>
        </div>
      )}
    </div>

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

    <div className="space-y-2">
      <Label className="text-sm font-medium">Rang FIFA</Label>
      <Input
        type="number"
        min="1"
        value={form.fifa_rank_before || ''}
        onChange={(e) => setForm({ ...form, fifa_rank_before: +e.target.value })}
        placeholder="Ex: 12"
        className="h-11"
      />
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Points FIFA</Label>
      <Input
        type="number"
        min="1"
        value={form.fifa_points_before || ''}
        onChange={(e) => setForm({ ...form, fifa_points_before: +e.target.value })}
        placeholder="Ex: 1500"
        className="h-11"
      />
    </div>
  </div>
);