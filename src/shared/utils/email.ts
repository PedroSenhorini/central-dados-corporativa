// tira acento e deixa minúsculo pra virar um slug seguro de e-mail
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim();
}

// gera o e-mail no padrão nome.sobrenome@dominio (se só tiver um nome, usa só ele)
export function gerarEmailCorporativo(nomeCompleto: string, dominio: string): string {
  if (!nomeCompleto || !dominio) return '';

  const partes = normalizar(nomeCompleto).split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '';

  const primeiro = partes[0];
  const ultimo = partes[partes.length - 1];
  const local = partes.length > 1 ? `${primeiro}.${ultimo}` : primeiro;

  return `${local}@${dominio}`;
}
