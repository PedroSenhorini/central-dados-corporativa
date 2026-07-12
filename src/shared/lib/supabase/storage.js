import { supabase, supabaseConfigured } from './client.js';

export async function uploadFile(bucket, path, file) {
  if (!supabaseConfigured) return { data: null, error: new Error('Supabase não configurado.') };
  return supabase.storage.from(bucket).upload(path, file, { upsert: true });
}

export async function listFiles(bucket, path = '') {
  if (!supabaseConfigured) return { data: [], error: new Error('Supabase não configurado.') };
  return supabase.storage.from(bucket).list(path);
}

export function getPublicUrl(bucket, path) {
  if (!supabaseConfigured) return '';
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function removeFile(bucket, path) {
  if (!supabaseConfigured) return { data: null, error: new Error('Supabase não configurado.') };
  return supabase.storage.from(bucket).remove([path]);
}
