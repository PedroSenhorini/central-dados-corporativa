import type { Papel } from '../types/database.js';

const MODULOS_RESTRITOS: Record<string, Papel[]> = {
  'automacao-rh': ['rh'],
  'desligamento-rh': ['rh'],
  usuarios: [],
};

export function temAcessoAoModulo(papel: Papel | undefined, modulo: string | undefined): boolean {
  if (papel === 'admin') return true;
  const permitidos = modulo ? MODULOS_RESTRITOS[modulo] : undefined;
  if (!permitidos) return true;
  return Boolean(papel) && permitidos.includes(papel as Papel);
}
