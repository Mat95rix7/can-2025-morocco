import { supabaseBrowser} from '@/lib/supabase/browser';
import type { Database } from '@/lib/database.types';

const getClient = () => supabaseBrowser();

type PlayerInsert = Database['public']['Tables']['players']['Insert'];
type PlayerUpdate = Database['public']['Tables']['players']['Update'];

export const playerService = {
  async getAll() {
    const { data, error } = await getClient()
      .from('players')
      .select(`
        *,
        team:teams(id, name, code, flag_url)
      `)
      .order('firstname', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByTeam(teamId: string) {
    const { data, error } = await getClient()
      .from('players')
      .select(`
        *,
        team:teams(id, name, code, flag_url)
      `)
      .eq('team_id', teamId)
      .order('number', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(player: PlayerInsert) {
    const { data, error } = await getClient()
      .from('players')
      .insert([player])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, player: PlayerUpdate) {
    const { data, error } = await getClient()
      .from('players')
      .update(player)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await getClient()
      .from('players')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};