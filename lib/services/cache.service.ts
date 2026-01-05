// lib/services/cache.service.ts
import { supabase as supabaseClient } from '@/lib/supabase/browser';
import type { Database } from '@/lib/database.types';

type MatchInsert = Database['public']['Tables']['matches']['Insert'];

class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(prefix?: string): void {
    if (prefix) {
      Array.from(this.cache.keys())
        .filter(key => key.startsWith(prefix))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}

export const cacheService = new CacheService();

// Utilisation dans match.service.ts
export const matchService = {
  async getAll() {
    const cacheKey = 'matches:all';
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabaseClient
      .from('matches')
      .select('...')
      .order('match_date');

    if (error) throw error;
    
    cacheService.set(cacheKey, data);
    return data || [];
  },
  
  // Invalider le cache après modification
  async create(match: MatchInsert) {
    const result = await supabaseClient.from('matches').insert([match]);
    cacheService.clear('matches:');
    return result;
  }
};