import { useEffect, useRef, useState } from 'react';
import { AREAS_DASHBOARD } from '../data/dashboards.js';
import { aplicarFiltros } from '../utils/filtros.js';
import type { DadosDashboard, FiltrosDashboard } from '../data/types.js';

const LATENCIA_SIMULADA_MS = 450;

// simula a busca dos dados do dashboard (por enquanto é só um setTimeout, sem back-end).
// loading = primeira carga da área (mostra skeleton inteiro)
// refreshing = já tinha dado na tela e um filtro mudou (mantém o conteúdo antigo visível)
export function useDashboardData(areaId: string, filtros: FiltrosDashboard) {
  const [dados, setDados] = useState<DadosDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const area = AREAS_DASHBOARD.find((a) => a.id === areaId);
    if (!area) return undefined;

    const idDestaChamada = ++requestId.current;
    const jaTemDado = dados !== null;
    setLoading(!jaTemDado);
    setRefreshing(jaTemDado);

    const timer = setTimeout(() => {
      if (idDestaChamada !== requestId.current) return; // resposta obsoleta, ignora
      setDados(aplicarFiltros(area, filtros));
      setLoading(false);
      setRefreshing(false);
    }, LATENCIA_SIMULADA_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId, filtros.periodoId, filtros.filialId]);

  return { dados, loading, refreshing };
}
