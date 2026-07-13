import { Clock, User } from 'lucide-react';
import { calcularDiasEmAberto, calcularSituacaoSla, SLA_LABELS, SETORES_VAGA } from '../data/constants.js';

const SLA_ESTILOS = {
  'no-prazo': 'text-success bg-success/10',
  atencao: 'text-warning bg-warning/10',
  vencida: 'text-red-600 bg-red-50',
  concluida: 'text-muted bg-canvas',
};

const PRIORIDADE_ESTILOS = {
  alta: 'text-red-600 bg-red-50',
  media: 'text-warning bg-warning/10',
  baixa: 'text-muted bg-canvas',
};

export default function VagaCard({ vaga, arrastavel, onDragStart }) {
  const situacaoSla = calcularSituacaoSla(vaga);
  const dias = calcularDiasEmAberto(vaga);
  const setor = SETORES_VAGA.find((s) => s.id === vaga.setor_area);

  return (
    <div
      draggable={arrastavel}
      onDragStart={(e) => onDragStart(e, vaga.id)}
      className={`bg-surface border border-border rounded-lg p-3.5 shadow-card flex flex-col gap-2.5 ${
        arrastavel ? 'cursor-grab active:cursor-grabbing' : 'opacity-90'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink2 leading-snug">{vaga.titulo}</p>
        <span
          className={`shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${PRIORIDADE_ESTILOS[vaga.prioridade]}`}
        >
          {vaga.prioridade}
        </span>
      </div>

      <p className="text-[12px] text-muted">{setor?.label ?? vaga.setor_area}</p>

      {vaga.gestor?.nome && (
        <p className="flex items-center gap-1.5 text-[12px] text-muted">
          <User size={12} className="shrink-0" />
          {vaga.gestor.nome}
        </p>
      )}

      <div className="flex items-center justify-between pt-1.5 border-t border-border">
        <span className="flex items-center gap-1 text-[12px] text-muted">
          <Clock size={12} />
          {dias}d / {vaga.prazo_sla_dias}d
        </span>
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${SLA_ESTILOS[situacaoSla]}`}>
          {SLA_LABELS[situacaoSla]}
        </span>
      </div>
    </div>
  );
}
