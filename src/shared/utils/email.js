/**
 * Remove acentos e caixa alta para gerar um "slug" seguro para e-mail.
 */
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim();
}

/**
 * Gera o e-mail corporativo no padrão nome.sobrenome@dominio.
 * Se a pessoa tiver só um nome, usa apenas ele.
 *
 * @param {string} nomeCompleto
 * @param {string} dominio - domínio do setor selecionado (ex: "tech.empresa.com")
 * @returns {string} e-mail gerado, ou string vazia se faltar nome/domínio
 */
export function gerarEmailCorporativo(nomeCompleto, dominio) {
  if (!nomeCompleto || !dominio) return '';

  const partes = normalizar(nomeCompleto).split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '';

  const primeiro = partes[0];
  const ultimo = partes[partes.length - 1];
  const local = partes.length > 1 ? `${primeiro}.${ultimo}` : primeiro;

  return `${local}@${dominio}`;
}
