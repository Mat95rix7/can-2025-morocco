import { supabase as supabaseClient } from '@/lib/supabase/browser';

export interface Stadium {
  name: string;
  city: string;
  capacity: number;
}

// Note: Si vous n'avez pas de table "stadiums" dédiée,
// cette approche extrait les stades uniques depuis la table matches
export const stadiumService = {
  // GET ALL - Extraction depuis la table matches
  async getAll(): Promise<Stadium[]> {
    const { data, error } = await supabaseClient
      .from('matches')
      .select('stadium')
      .not('stadium', 'is', null);

    if (error) throw error;

    // Extraire les stades uniques
    const uniqueStadiums = [...new Set(data?.map(m => m.stadium) || [])];
    
    // Retourner avec des données fictives (à compléter manuellement)
    return uniqueStadiums.map(name => ({
      name: name || '',
      city: this.getCityForStadium(name || ''),
      capacity: this.getCapacityForStadium(name || '')
    }));
  },

  // Helper pour associer ville au stade (à personnaliser)
  getCityForStadium(stadiumName: string): string {
    const stadiumCityMap: Record<string, string> = {
      'Stade Alassane Ouattara': 'Abidjan',
      'Stade Félix Houphouët-Boigny': 'Abidjan',
      'Stade de la Paix': 'Bouaké',
      'Stade Laurent Pokou': 'San-Pédro',
      'Stade Charles Konan Banny': 'Yamoussoukro',
      'Stade Robert Champroux': 'Abengourou'
    };
    return stadiumCityMap[stadiumName] || 'Côte d\'Ivoire';
  },

  // Helper pour associer capacité au stade (à personnaliser)
  getCapacityForStadium(stadiumName: string): number {
    const stadiumCapacityMap: Record<string, number> = {
      'Stade Alassane Ouattara': 60000,
      'Stade Félix Houphouët-Boigny': 45000,
      'Stade de la Paix': 40000,
      'Stade Laurent Pokou': 15000,
      'Stade Charles Konan Banny': 20000,
      'Stade Robert Champroux': 5000
    };
    return stadiumCapacityMap[stadiumName] || 30000;
  },

  // GET stadiums utilisés dans les matchs à venir
  async getUpcoming(): Promise<string[]> {
    const { data, error } = await supabaseClient
      .from('matches')
      .select('stadium')
      .gte('match_date', new Date().toISOString())
      .not('stadium', 'is', null)
      .order('match_date', { ascending: true });

    if (error) throw error;

    return [...new Set(data?.map(m => m.stadium) || [])].filter(Boolean) as string[];
  },

  // CREATE - Pas d'insertion directe, mais peut être utilisé pour valider
  async validate(stadium: Stadium): Promise<boolean> {
    return !!(stadium.name && stadium.city && stadium.capacity > 0);
  },

  // Liste prédéfinie des stades officiels de la CAN 2025
  getOfficialStadiums(): Stadium[] {
    return [
      { name: 'Stade Alassane Ouattara', city: 'Abidjan', capacity: 60000 },
      { name: 'Stade Félix Houphouët-Boigny', city: 'Abidjan', capacity: 45000 },
      { name: 'Stade de la Paix', city: 'Bouaké', capacity: 40000 },
      { name: 'Stade Laurent Pokou', city: 'San-Pédro', capacity: 15000 },
      { name: 'Stade Charles Konan Banny', city: 'Yamoussoukro', capacity: 20000 },
      { name: 'Stade Robert Champroux', city: 'Abengourou', capacity: 5000 }
    ];
  }
};