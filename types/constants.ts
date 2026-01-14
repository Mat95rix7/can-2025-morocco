import { Building2, Trophy, UserCircle, Users } from "lucide-react";

// ==================== CONSTANTS ====================
export const OFFICIAL_STADIUMS = [
  { id: "Adrar_Stadium", name: "Adrar Stadium", city: "Agadir", capacity: 45000 },
  { id: "Stade_Mohammed_V", name: "Stade Mohammed V", city: "Casablanca", capacity: 45000 },
  { id: "Fez_Stadium", name: "Fez Stadium", city: "Fez", capacity: 45000 },
  { id: "Marrakesh_Stadium", name: "Marrakesh Stadium", city: "Marrakesh", capacity: 45000 },
  { id: "Prince_Moulay_Abdellah_Stadium", name: "Prince Moulay Abdellah Stadium", city: "Rabat", capacity: 69500 },
  { id: "Moulay_Hassan_Stadium", name: "Moulay Hassan Stadium", city: "Rabat", capacity: 22000 },
  { id: "Rabat_Olympic_Stadium", name: "Rabat Olympic Stadium", city: "Rabat", capacity: 21000 },
  { id: "Al_Medina_Stadium", name: "Al Medina Stadium", city: "Rabat", capacity: 18000 },
  { id: "Tangier_Grand_Stadium", name: "Tangier Grand Stadium", city: "Tangier", capacity: 75000 }
];

export const PHASES = [
  { value: 'group', label: 'Phase de groupes', color: 'bg-blue-500' },
  { value: 'round_16', label: 'Huitièmes', color: 'bg-purple-500' },
  { value: 'quarter', label: 'Quarts', color: 'bg-pink-500' },
  { value: 'semi', label: 'Demi-finales', color: 'bg-orange-500' },
  { value: 'final', label: 'Finale', color: 'bg-red-500' }
];

export const STATUSES = [
  { value: 'scheduled', label: 'À venir', color: 'bg-slate-500' },
  { value: 'live', label: 'En direct', color: 'bg-green-500' },
  { value: 'finished', label: 'Terminé', color: 'bg-gray-500' }
];

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const POSITIONS = [
  { value: 'GK', label: 'Gardien (GK)' },
  { value: 'DEF', label: 'Défenseur (DEF)' },
  { value: 'MID', label: 'Milieu (MID)' },
  { value: 'FWD', label: 'Attaquant (FWD)' }
];

export const TABS = [
  { value: 'matches', label: 'Matchs', icon: Trophy, gradient: 'from-blue-500 to-purple-600' },
  { value: 'teams', label: 'Équipes', icon: Users, gradient: 'from-purple-500 to-pink-600' },
  { value: 'players', label: 'Joueurs', icon: UserCircle, gradient: 'from-pink-500 to-orange-600' },
  { value: 'stadiums', label: 'Stades', icon: Building2, gradient: 'from-orange-500 to-red-600' }
];

export const PHASE_IMPORTANCE: Record<string, number> = {
  group: 35,
  round_of_16: 40,
  quarter_final: 40,
  semi_final: 40,
  third_place: 40,
  final: 50,
};

export const CAF_COEFFICIENT = 1.0;