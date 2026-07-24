import type { DragEvent } from 'react';
import { User, Package } from 'lucide-react';
import { CATEGORIAS_COMPRA, formatarMoeda } from '../data/constants.js';
import type { SolicitacaoComRelacoes, UrgenciaCompra } from '../../../shared/types/database.js';

const URGENCIA_ESTILOS: Record<UrgenciaCompra, string> = {
  critica: 'text-red-600 bg-red-50',
  alta: 'text-red-600 bg-red-50',
  media: 'text-warning bg-warning/10',
  baixa: 'text-muted bg-canvas',
};

interface SolicitacaoCardProps {
  solicitacao: SolicitacaoComRelacoes;
  arrastavel: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>, solicitacaoId: string) => void;
}

export default function SolicitacaoCard({ solicitacao, arrastavel, onDragStart }: SolicitacaoCardProps) {
  const categoria = CATEGORIAS_COMPRA.find((c) => c.id === solicitacao.categoria);

  return (
    <div
      draggable={arrastavel}
      onDragStart={(e) => onDragStart(e, solicitacao.id)}
      className={`bg-surface border border-border rounded-lg p-3.5 shadow-card flex flex-col gap-2.5 ${
        arrastavel ? 'cursor-grab active:cursor-grabbing' : 'opacity-90'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink2 leading-snug">{solicitacao.item}</p>
        <span
          className={`shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${URGENCIA_ESTILOS[solicitacao.urgencia]}`}
        >
          {solicitacao.urgencia}
        </span>
      </div>

      <p className="flex items-center gap-1.5 text-[12px] text-muted">
        <Package size={12} className="shrink-0" />
        {categoria?.label ?? solicitacao.categoria} · {solicitacao.quantidade}x
      </p>

      {solicitacao.solicitante?.nome && (
        <p className="flex items-center gap-1.5 text-[12px] text-muted">
          <User size={12} className="shrink-0" />
          {solicitacao.solicitante.nome}
        </p>
      )}

      <div className="flex items-center justify-between pt-1.5 border-t border-border">
        <span className="text-[12px] text-muted">{formatarMoeda(solicitacao.valor_estimado)}</span>
        {solicitacao.data_necessidade && (
          <span className="text-[11px] text-muted">
            até {new Date(`${solicitacao.data_necessidade}T00:00:00`).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  );
}
