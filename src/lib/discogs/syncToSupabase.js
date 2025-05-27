import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables in syncToSupabase.js');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchRequests() {
  const { data, error } = await supabase.from('requests').select('*');
  if (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }
  return data;
}
