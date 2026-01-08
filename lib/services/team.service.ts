import { supabaseBrowser } from '@/lib/supabase/browser';
import type { Database } from '@/lib/database.types';

const getClient = () => supabaseBrowser();

type TeamInsert = Database['public']['Tables']['teams']['Insert'];
type TeamUpdate = Database['public']['Tables']['teams']['Update'];

export const teamService = {
  async getAll() {
    const { data, error } = await getClient()
      .from('teams')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await getClient()
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByGroup(groupName: string) {
    const { data, error } = await getClient()
      .from('teams')
      .select('*')
      .eq('group_name', groupName)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(team: TeamInsert) {
    const { data, error } = await getClient()
      .from('teams')
      .insert([team])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, team: TeamUpdate) {
    const { data, error } = await getClient()
      .from('teams')
      .update(team)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await getClient()
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};