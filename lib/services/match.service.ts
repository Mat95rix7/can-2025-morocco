import { supabaseBrowser } from '@/lib/supabase/browser';
import type { Database } from '@/lib/database.types';

type MatchInsert = Database['public']['Tables']['matches']['Insert'];
type MatchUpdate = Database['public']['Tables']['matches']['Update'];

const getClient = () => supabaseBrowser();

export const matchService = {
  // GET ALL
  async getAll() {
    const { data, error } = await getClient()
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name, code, flag_url, group_name),
        away_team:teams!matches_away_team_id_fkey(id, name, code, flag_url, group_name)
      `)
      .order('match_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // GET BY ID
  async getById(id: string) {
    const { data, error } = await getClient()
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // GET BY PHASE
  async getByPhase(phase: string) {
    const { data, error } = await getClient()
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .eq('phase', phase)
      .order('match_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // CREATE
  async create(match: MatchInsert) {
    const { data, error } = await getClient()
      .from('matches')
      .insert([match])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // UPDATE
  async update(id: string, match: MatchUpdate) {
    console.log(match);
    const { data, error } = await getClient()
      .from('matches')
      .update(match)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // DELETE
  async delete(id: string) {
    const { error } = await getClient()
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // BULK UPDATE SCORES (utile pour mise à jour live)
  async updateScore(id: string, homeScore: number, awayScore: number) {
    const { data, error } = await getClient()
      .from('matches')
      .update({ 
        home_score: homeScore, 
        away_score: awayScore,
        status: 'finished' 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};