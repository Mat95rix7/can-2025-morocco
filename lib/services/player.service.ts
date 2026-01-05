import { supabase as supabaseClient } from '@/lib/supabase/browser';
import type { Database } from '@/lib/database.types';

type Player = Database['public']['Tables']['players']['Row'];
type PlayerInsert = Database['public']['Tables']['players']['Insert'];
type PlayerUpdate = Database['public']['Tables']['players']['Update'];

export const playerService = {
  async getAll() {
    const { data, error } = await supabaseClient
      .from('players')
      .select(`
        *,
        team:teams(id, name, code, flag_url)
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByTeam(teamId: string) {
    const { data, error } = await supabaseClient
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
    const { data, error } = await supabaseClient
      .from('players')
      .insert([player])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, player: PlayerUpdate) {
    const { data, error } = await supabaseClient
      .from('players')
      .update(player)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseClient
      .from('players')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};