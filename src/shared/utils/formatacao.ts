export function iniciais(nome: string): string {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '?';
}

/** Datas `date` do Postgres (AAAA-MM-DD) viram meia-noite local, não UTC. */
function paraData(valor: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor);
}

export function formatarData(valor: string | null | undefined): string {
  if (!valor) return '—';
  return paraData(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatarDataCurta(valor: string | null | undefined): string {
  if (!valor) return '—';
  return paraData(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function tempoRelativo(valor: string): string {
  const minutos = Math.round((Date.now() - paraData(valor).getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  return formatarData(valor);
}

export function formatarTamanho(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function diasEntre(inicio: string, fim: string): number {
  return Math.round((paraData(fim).getTime() - paraData(inicio).getTime()) / 86400000) + 1;
}
