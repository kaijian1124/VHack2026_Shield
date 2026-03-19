import { createClient } from '@supabase/supabase-js';

const dbUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const dbKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(dbUrl, dbKey);

export async function fetchCallHistory(limit = 50) {
  const { data, error } = await supabase
    .from('scam_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }
  return data || [];
}