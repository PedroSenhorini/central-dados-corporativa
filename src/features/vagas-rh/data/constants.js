import { AREAS_DASHBOARD } from '../../analise-dados/data/dashboards.js';

/**
 * Colunas do kanban de vagas. 'contratada' e 'cancelada' são as etapas
 * finais — ao entrar em qualquer uma delas a vaga para de contar prazo de
 * SLA (ver calcularDiasEmAberto).
 */
export const COLUNAS_VAGAS = [
  { id: 'aberta', titulo: 'Aberta' },
  { id: 'triagem', titulo: 'Triagem' },
  { id: 'entrevistas', titulo: 'Entrevistas' },
  { id: 'proposta', titulo: 'Proposta' },
  { id: 'contratada', titulo: 'Contratada' },
  { id: 'cancelada', titulo: 'Cancelada' },
];

export const ETAPAS_FINAIS = ['contratada', 'cancelada'];

export const PRIORIDADES = [
  { id: 'baixa', label: 'Baixa' },
  { id: 'media', label: 'Média' },
  { id: 'alta', label: 'Alta' },
];

export const SETORES_VAGA = AREAS_DASHBOARD.filter((a) => a.id !== 'geral').map((a) => ({
  id: a.id,
  label: a.label,
}));

/** Dias corridos desde a abertura da vaga até o fechamento (ou até hoje, se ainda aberta). */
export function calcularDiasEmAberto(vaga) {
  const inicio = new Date(vaga.data_abertura);
  const fim = vaga.data_fechamento ? new Date(vaga.data_fechamento) : new Date();
  return Math.max(0, Math.round((fim - inicio) / 86400000));
}

/**
 * Situação do SLA da vaga: 'concluida' (já fechou), 'vencida' (estourou o
 * prazo), 'atencao' (a 70% do prazo) ou 'no-prazo'.
 */
export function calcularSituacaoSla(vaga) {
  if (ETAPAS_FINAIS.includes(vaga.status)) return 'concluida';
  const dias = calcularDiasEmAberto(vaga);
  const proporcao = dias / vaga.prazo_sla_dias;
  if (proporcao >= 1) return 'vencida';
  if (proporcao >= 0.7) return 'atencao';
  return 'no-prazo';
}

export const SLA_LABELS = {
  'no-prazo': 'No prazo',
  atencao: 'Atenção',
  vencida: 'SLA vencido',
  concluida: 'Concluída',
};
