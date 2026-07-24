import { useEffect, useRef, useState } from 'react';
import { AREAS_DASHBOARD } from '../data/dashboards.js';
import { aplicarFiltros } from '../utils/filtros.js';
import type { DadosDashboard, FiltrosDashboard } from '../data/types.js';

const LATENCIA_SIMULADA_MS = 450;

/**
 * Simula a busca dos dados de uma área do dashboard num back-end real:
 * assíncrona, cancelável e sujeita a filtros globais (período/filial).
 *
 * - `loading`: true só na primeira carga de uma área (sem dado prévio pra
 *   mostrar — é quando o skeleton completo faz sentido).
 * - `refreshing`: true quando já existe dado na tela e um filtro mudou —
 *   é quando queremos manter o conteúdo anterior visível (stale-while-
 *   revalidate) em vez de re-mostrar skeleton.
 *
 * Quando o back-end real existir, só o corpo do `buscar` abaixo muda
 * (troca o setTimeout por um fetch); o resto do hook continua igual.
 */
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
