/**
 * Dados organizacionais mockados.
 *
 * Em produção, isso viria da sua base (Azure AD, planilha de estrutura
 * organizacional, ou uma API interna) — aqui está centralizado num único
 * lugar para ficar fácil de substituir por uma chamada real.
 *
 * Cada setor carrega:
 * - dominio: domínio de e-mail usado por esse setor (vocês usam mais de um)
 * - gestores: gestores que podem ser vinculados a esse setor
 * - cargos: cargos possíveis dentro do setor
 * - acessosAutomaticos: SharePoint / e-mails compartilhados / Teams que
 *   TODO colaborador do setor recebe automaticamente (não é opcional,
 *   por isso não aparece como toggle — é aplicado direto pela automação)
 */
export const SETORES = [
  {
    id: 'comercial',
    nome: 'Comercial',
    dominio: 'empresa.com',
    gestores: ['Carlos Mendes', 'Fernanda Lima'],
    cargos: ['Executivo de Contas', 'Gerente Comercial', 'SDR'],
    acessosAutomaticos: [
      { tipo: 'SharePoint', nome: 'Site Comercial' },
      { tipo: 'E-mail compartilhado', nome: 'comercial@empresa.com' },
      { tipo: 'Teams', nome: 'Canal Comercial Brasil' },
    ],
  },
  {
    id: 'tecnologia',
    nome: 'Tecnologia',
    dominio: 'tech.empresa.com',
    gestores: ['Rafael Souza', 'Juliana Prado'],
    cargos: ['Desenvolvedor(a) de Software', 'Analista de Dados', 'DevOps'],
    acessosAutomaticos: [
      { tipo: 'SharePoint', nome: 'Site Engenharia' },
      { tipo: 'E-mail compartilhado', nome: 'suporte-ti@tech.empresa.com' },
      { tipo: 'Teams', nome: 'Canal Dev Squad' },
    ],
  },
  {
    id: 'rh',
    nome: 'Recursos Humanos',
    dominio: 'empresa.com',
    gestores: ['Patrícia Alves'],
    cargos: ['Analista de RH', 'Business Partner'],
    acessosAutomaticos: [
      { tipo: 'SharePoint', nome: 'Site RH - Documentos' },
      { tipo: 'E-mail compartilhado', nome: 'rh@empresa.com' },
    ],
  },
  {
    id: 'financeiro',
    nome: 'Financeiro',
    dominio: 'financeiro.empresa.com',
    gestores: ['Marcos Teixeira'],
    cargos: ['Analista Financeiro', 'Controller'],
    acessosAutomaticos: [
      { tipo: 'SharePoint', nome: 'Site Financeiro' },
      { tipo: 'E-mail compartilhado', nome: 'financeiro@financeiro.empresa.com' },
    ],
  },
];

/**
 * Licenças do Microsoft 365 sugeridas automaticamente conforme o cargo.
 * O usuário ainda pode ligar/desligar qualquer uma no formulário — isso
 * só define o ponto de partida para agilizar o preenchimento.
 */
export const LICENCAS_SUGERIDAS_POR_CARGO = {
  'Executivo de Contas': ['e3', 'teams'],
  'Gerente Comercial': ['e3', 'teams', 'powerbi'],
  SDR: ['e3', 'teams'],
  'Desenvolvedor(a) de Software': ['e3', 'teams', 'copilot'],
  'Analista de Dados': ['e3', 'teams', 'powerbi', 'copilot'],
  DevOps: ['e3', 'teams'],
  'Analista de RH': ['e3', 'teams', 'sharepoint'],
  'Business Partner': ['e3', 'teams', 'sharepoint'],
  'Analista Financeiro': ['e3', 'teams', 'powerbi'],
  Controller: ['e3', 'teams', 'powerbi', 'sharepoint'],
};

export function getSetorById(setorId) {
  return SETORES.find((s) => s.id === setorId) ?? null;
}
