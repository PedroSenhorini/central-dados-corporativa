import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import KpiCard from '../../../shared/components/KpiCard.js';
import { KpiCardSkeleton, ChartCardSkeleton } from '../../../shared/components/Skeleton.js';
import { AREAS_DASHBOARD } from '../data/dashboards.js';
import { FILTROS_PADRAO } from '../utils/filtros.js';
import { useDashboardData } from '../hooks/useDashboardData.js';
import FiltrosBarra from '../components/FiltrosBarra.js';

const DashboardCharts = lazy(() => import('../components/DashboardCharts.js'));

export default function AnaliseDados() {
  const [areaId, setAreaId] = useState(AREAS_DASHBOARD[0].id);
  const [filtros, setFiltros] = useState(FILTROS_PADRAO);
  const area = useMemo(() => AREAS_DASHBOARD.find((a) => a.id === areaId), [areaId]);
  const { dados, loading, refreshing } = useDashboardData(areaId, filtros);

  const trocarArea = useCallback((id: string) => {
    setAreaId(id);
    setFiltros(FILTROS_PADRAO);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink2">Análise de Dados</h1>
          <p className="text-sm text-muted mt-0.5">{area?.descricao}</p>
        </div>
        <FiltrosBarra filtros={filtros} onChange={setFiltros} desabilitado={loading} />
      </div>

      {/* Seletor de área da empresa */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Área da empresa">
        {AREAS_DASHBOARD.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === areaId}
            onClick={() => trocarArea(id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
              id === areaId
                ? 'bg-primary border-primary text-white'
                : 'bg-surface border-border text-muted hover:text-ink2 hover:border-primary/40'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo: enquanto não há nenhum dado ainda, mostra skeleton completo.
          Ao trocar filtro com dado já em tela, mantém o conteúdo anterior
          visível (levemente esmaecido) em vez de piscar para skeleton de novo. */}
      <div
        className={`flex flex-col gap-4 transition-opacity ${refreshing ? 'opacity-60' : 'opacity-100'}`}
        aria-busy={loading || refreshing}
      >
        {refreshing && (
          <div className="flex items-center gap-1.5 text-[12px] text-muted">
            <RefreshCw size={12} className="animate-spin" />
            Atualizando com os filtros selecionados…
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading || !dados
            ? Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
            : dados.kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCardSkeleton />
              <ChartCardSkeleton />
            </div>
          }
        >
          {loading || !dados ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCardSkeleton />
              <ChartCardSkeleton />
            </div>
          ) : (
            <DashboardCharts graficoLinha={dados.graficoLinha} graficoBarra={dados.graficoBarra} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
