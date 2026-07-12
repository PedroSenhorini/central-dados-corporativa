import { supabase, supabaseConfigured } from './client.js';

export function subscribeToTable(table, { event = '*', filter, onChange }) {
  if (!supabaseConfigured) return () => {};

  const channel = supabase
    .channel(`realtime:${table}`)
    .on(
      'postgres_changes',
      { event, schema: 'public', table, ...(filter ? { filter } : {}) },
      onChange
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
