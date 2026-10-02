import type { Papel } from '../types/database.js';

const MODULOS_RESTRITOS: Record<string, Papel[]> = {
  'automacao-rh': ['rh'],
  'desligamento-rh': ['rh'],
  'visitas-tecnicas': ['ti'],
  usuarios: [],
};

export function temAcessoAoModulo(papel: Papel | undefined, modulo: string | undefined): boolean {
  if (papel === 'admin') return true;
  const permitidos = modulo ? MODULOS_RESTRITOS[modulo] : undefined;
  if (!permitidos) return true;
  return Boolean(papel) && permitidos.includes(papel as Papel);
}

// Espelham as policies de supabase/migrations/20261002_modulos_intranet.sql —
// servem só para esconder botões; quem garante a regra é o banco.
const temUmDos = (papel: Papel | undefined, papeis: Papel[]) =>
  papel === 'admin' || (papel !== undefined && papeis.includes(papel));

export const podePublicarComunicado = (papel: Papel | undefined) => temUmDos(papel, ['rh', 'marketing']);
export const podeGerenciarDocumentos = (papel: Papel | undefined) => temUmDos(papel, ['rh', 'ti']);
export const atendeSolicitacoesRh = (papel: Papel | undefined) => temUmDos(papel, ['rh']);
export const atendeChamadosTi = (papel: Papel | undefined) => temUmDos(papel, ['ti']);
