import { POSITIONS } from "@/types/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player, Team } from "@/types/types";
import Image from "next/image";



interface PlayerFormFieldsProps {
  form: Player;
  setForm: React.Dispatch<React.SetStateAction<Player>>;
  teams: Team[];
}

export const PlayerFormFields: React.FC<PlayerFormFieldsProps> = ({
  form,
  setForm,
  teams,
}) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-2 md:col-span-2">
      <Label className="text-sm font-medium">Nom du joueur *</Label>
      <Input
        value={form.firstname || ''}
        onChange={(e) => setForm({ ...form, firstname: e.target.value })}
        placeholder="Ex: Mohamed Salah"
        className="h-11"
      />
    </div>
    <div className="space-y-2 md:col-span-2">
      <Label className="text-sm font-medium">Prénom du joueur *</Label>
      <Input
        value={form.lastname || ''}
        onChange={(e) => setForm({ ...form, lastname: e.target.value })}
        placeholder="Ex: Mohamed Salah"
        className="h-11"
      />
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Équipe *</Label>
      <Select
        value={form.team_id || ''}
        onValueChange={(v) => setForm({ ...form, team_id: v })}
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
      <Label className="text-sm font-medium">Position</Label>
      <Select value={form.position || ''} onValueChange={(v) => setForm({ ...form, position: v })}>
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Sélectionner une position" />
        </SelectTrigger>
        <SelectContent>
          {POSITIONS.map(p => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium">Numéro de maillot</Label>
      <Input
        type="number"
        min="1"
        max="99"
        value={form.number || ''}
        onChange={(e) => setForm({ ...form, number: +e.target.value })}
        placeholder="Ex: 10"
        className="h-11"
      />
    </div>
  </div>
);
