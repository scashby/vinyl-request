import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are missing. Please check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
