import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from './client.js';

interface SubscribeOptions {
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

export function subscribeToTable(table: string, { event = '*', filter, onChange }: SubscribeOptions) {
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
