import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.warn(
    'Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (veja .env.example).'
  );
}

// Tipado como não-nulo por conveniência: assim como no app original, todo
// chamador assume que o Supabase está configurado (ver supabaseConfigured
// para guardas explícitas antes de ler/gravar dados).
export const supabase = (
  supabaseConfigured ? createClient<Database>(supabaseUrl, supabaseAnonKey) : null
) as SupabaseClient<Database>;
