import { PERIODOS, FILIAIS } from '../utils/filtros.js';
import type { FiltrosDashboard } from '../data/types.js';

interface FiltrosBarraProps {
  filtros: FiltrosDashboard;
  onChange: (filtros: FiltrosDashboard) => void;
  desabilitado: boolean;
}

// filtros globais da página — muda aqui e reflete nos KPIs e nos dois gráficos
function FiltrosBarra({ filtros, onChange, desabilitado }: FiltrosBarraProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-muted">
        Período
        <select
          value={filtros.periodoId}
          disabled={desabilitado}
          onChange={(e) => onChange({ ...filtros, periodoId: e.target.value })}
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-ink2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
        >
          {PERIODOS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-muted">
        Filial
        <select
          value={filtros.filialId}
          disabled={desabilitado}
          onChange={(e) => onChange({ ...filtros, filialId: e.target.value })}
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-ink2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
        >
          {FILIAIS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default FiltrosBarra;
