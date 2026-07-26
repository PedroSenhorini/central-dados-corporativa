import type { CategoriaCompra, StatusCompra, UrgenciaCompra } from '../../../shared/types/database.js';

// colunas do kanban - comprado/recusado são as etapas finais (para de contar como "em aberto")
export const COLUNAS_COMPRA: { id: StatusCompra; titulo: string }[] = [
  { id: 'solicitado', titulo: 'Solicitado' },
  { id: 'em_cotacao', titulo: 'Em Cotação' },
  { id: 'aprovado', titulo: 'Aprovado' },
  { id: 'comprado', titulo: 'Comprado' },
  { id: 'recusado', titulo: 'Recusado' },
];

export const ETAPAS_FINAIS_COMPRA: StatusCompra[] = ['comprado', 'recusado'];

export const CATEGORIAS_COMPRA: { id: CategoriaCompra; label: string }[] = [
  { id: 'equipamento', label: 'Equipamento' },
  { id: 'material', label: 'Material' },
  { id: 'software', label: 'Software' },
  { id: 'servico', label: 'Serviço' },
  { id: 'outro', label: 'Outro' },
];

export const URGENCIAS_COMPRA: { id: UrgenciaCompra; label: string }[] = [
  { id: 'baixa', label: 'Baixa' },
  { id: 'media', label: 'Média' },
  { id: 'alta', label: 'Alta' },
  { id: 'critica', label: 'Crítica' },
];

export const formatarMoeda = (valor: number | null | undefined): string =>
  typeof valor === 'number'
    ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—';
