import { supabase, supabaseConfigured } from './client.js';

export async function uploadFile(bucket: string, path: string, file: File) {
  if (!supabaseConfigured) return { data: null, error: new Error('Supabase não configurado.') };
  return supabase.storage.from(bucket).upload(path, file, { upsert: true });
}

export async function listFiles(bucket: string, path = '') {
  if (!supabaseConfigured) return { data: [], error: new Error('Supabase não configurado.') };
  return supabase.storage.from(bucket).list(path);
}

export function getPublicUrl(bucket: string, path: string) {
  if (!supabaseConfigured) return '';
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function removeFile(bucket: string, path: string) {
  if (!supabaseConfigured) return { data: null, error: new Error('Supabase não configurado.') };
  return supabase.storage.from(bucket).remove([path]);
}
