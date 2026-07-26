// dados organizacionais mockados - em produção viria do Azure AD ou de uma API interna
// acessosAutomaticos = SharePoint/e-mail/Teams que todo mundo do setor já ganha, não é opcional então não vira toggle

export interface AcessoAutomatico {
  tipo: string;
  nome: string;
}

export interface Setor {
  id: string;
  nome: string;
  dominio: string;
  gestores: string[];
  cargos: string[];
  acessosAutomaticos: AcessoAutomatico[];
}

export const SETORES: Setor[] = [
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

// licenças sugeridas conforme o cargo, só pra agilizar - o usuário pode trocar tudo no formulário
export const LICENCAS_SUGERIDAS_POR_CARGO: Record<string, string[]> = {
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

export function getSetorById(setorId: string): Setor | null {
  return SETORES.find((s) => s.id === setorId) ?? null;
}
