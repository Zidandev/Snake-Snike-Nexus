import { createClient } from '@supabase/supabase-js';

// These will be provided by the user in the UI settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PlayerProfile = {
  id: string;
  username: string;
  coins: number;
  total_score: number;
  role: 'admin' | 'player';
  unlocked_skins: string[];
  active_skin: string;
  created_at: string;
};

export type ScoreRecord = {
  id: string;
  user_id: string;
  score: number;
  created_at: string;
};
