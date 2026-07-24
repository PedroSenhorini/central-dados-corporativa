import { AREAS_DASHBOARD } from '../../analise-dados/data/dashboards.js';
import type { PrioridadeVaga, StatusVaga, VagaRhRow } from '../../../shared/types/database.js';

/**
 * Colunas do kanban de vagas. 'contratada' e 'cancelada' são as etapas
 * finais — ao entrar em qualquer uma delas a vaga para de contar prazo de
 * SLA (ver calcularDiasEmAberto).
 */
export const COLUNAS_VAGAS: { id: StatusVaga; titulo: string }[] = [
  { id: 'aberta', titulo: 'Aberta' },
  { id: 'triagem', titulo: 'Triagem' },
  { id: 'entrevistas', titulo: 'Entrevistas' },
  { id: 'proposta', titulo: 'Proposta' },
  { id: 'contratada', titulo: 'Contratada' },
  { id: 'cancelada', titulo: 'Cancelada' },
];

export const ETAPAS_FINAIS: StatusVaga[] = ['contratada', 'cancelada'];

export const PRIORIDADES: { id: PrioridadeVaga; label: string }[] = [
  { id: 'baixa', label: 'Baixa' },
  { id: 'media', label: 'Média' },
  { id: 'alta', label: 'Alta' },
];

export const SETORES_VAGA = AREAS_DASHBOARD.filter((a) => a.id !== 'geral').map((a) => ({
  id: a.id,
  label: a.label,
}));

type VagaComPrazo = Pick<VagaRhRow, 'data_abertura' | 'data_fechamento'>;
type VagaComSla = Pick<VagaRhRow, 'status' | 'prazo_sla_dias' | 'data_abertura' | 'data_fechamento'>;

/** Dias corridos desde a abertura da vaga até o fechamento (ou até hoje, se ainda aberta). */
export function calcularDiasEmAberto(vaga: VagaComPrazo): number {
  const inicio = new Date(vaga.data_abertura);
  const fim = vaga.data_fechamento ? new Date(vaga.data_fechamento) : new Date();
  return Math.max(0, Math.round((fim.getTime() - inicio.getTime()) / 86400000));
}

export type SituacaoSla = 'concluida' | 'vencida' | 'atencao' | 'no-prazo';

/**
 * Situação do SLA da vaga: 'concluida' (já fechou), 'vencida' (estourou o
 * prazo), 'atencao' (a 70% do prazo) ou 'no-prazo'.
 */
export function calcularSituacaoSla(vaga: VagaComSla): SituacaoSla {
  if (ETAPAS_FINAIS.includes(vaga.status)) return 'concluida';
  const dias = calcularDiasEmAberto(vaga);
  const proporcao = dias / vaga.prazo_sla_dias;
  if (proporcao >= 1) return 'vencida';
  if (proporcao >= 0.7) return 'atencao';
  return 'no-prazo';
}

export const SLA_LABELS: Record<SituacaoSla, string> = {
  'no-prazo': 'No prazo',
  atencao: 'Atenção',
  vencida: 'SLA vencido',
  concluida: 'Concluída',
};
