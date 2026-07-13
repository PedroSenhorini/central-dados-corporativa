const MODULOS_RESTRITOS = {
  'automacao-rh': ['rh'],
  'desligamento-rh': ['rh'],
  usuarios: [],
};

export function temAcessoAoModulo(papel, modulo) {
  if (papel === 'admin') return true;
  const permitidos = MODULOS_RESTRITOS[modulo];
  if (!permitidos) return true;
  return permitidos.includes(papel);
}
