import type { AreaDashboard, DadosDashboard, FiltrosDashboard, GraficoDef, PontoGrafico } from '../data/types.js';

/**
 * Transformações puras aplicadas aos dados mockados dos dashboards a
 * partir dos filtros globais (período / filial). Isoladas em funções
 * puras para que, quando os dashboards passarem a consumir uma API real,
 * baste trocar quem chama estas funções (o back-end já devolveria os
 * dados neste formato, e este arquivo inteiro poderia sumir).
 */

export interface Periodo {
  id: string;
  label: string;
  meses: number;
}

export interface Filial {
  id: string;
  label: string;
  fator: number;
}

export const PERIODOS: Periodo[] = [
  { id: '3m', label: 'Últimos 3 meses', meses: 3 },
  { id: '6m', label: 'Últimos 6 meses', meses: 6 },
];

export const FILIAIS: Filial[] = [
  { id: 'todas', label: 'Todas as filiais', fator: 1 },
  { id: 'matriz', label: 'Matriz', fator: 0.58 },
  { id: 'filial-sp', label: 'Filial SP', fator: 0.24 },
  { id: 'filial-rj', label: 'Filial RJ', fator: 0.12 },
  { id: 'filial-sul', label: 'Filial Sul', fator: 0.06 },
];

export const FILTROS_PADRAO: FiltrosDashboard = { periodoId: '6m', filialId: 'todas' };

function fatorFilial(filialId: string): number {
  return FILIAIS.find((f) => f.id === filialId)?.fator ?? 1;
}

function mesesPeriodo(periodoId: string): number {
  return PERIODOS.find((p) => p.id === periodoId)?.meses ?? 6;
}

function escalar(valor: number, fator: number): number {
  return Math.round(valor * fator * 100) / 100;
}

function recortarUltimos<T>(lista: T[], quantidade: number): T[] {
  return lista.slice(Math.max(0, lista.length - quantidade));
}

/**
 * Aplica os filtros globais a uma área de dashboard inteira (kpis +
 * gráfico de linha + gráfico de barra), devolvendo um objeto novo pronto
 * para os componentes renderizarem — igual ao que um endpoint BFF real
 * devolveria já formatado para a lib de gráficos.
 */
export function aplicarFiltros(area: AreaDashboard, filtros: FiltrosDashboard): DadosDashboard {
  const fator = fatorFilial(filtros.filialId);
  const meses = mesesPeriodo(filtros.periodoId);

  const kpis = area.kpis.map((kpi) => {
    const sparkline = recortarUltimos(
      kpi.sparkline.map((v) => escalar(v, fator)),
      meses,
    );
    return { ...kpi, sparkline };
  });

  const graficoLinha: GraficoDef = {
    ...area.graficoLinha,
    dados: recortarUltimos(area.graficoLinha.dados, meses).map((ponto): PontoGrafico => ({
      ...ponto,
      [area.graficoLinha.dataKey]: escalar(Number(ponto[area.graficoLinha.dataKey]), fator),
    })),
  };

  const graficoBarra: GraficoDef = {
    ...area.graficoBarra,
    dados: area.graficoBarra.dados.map((ponto): PontoGrafico => ({
      ...ponto,
      [area.graficoBarra.dataKey]: escalar(Number(ponto[area.graficoBarra.dataKey]), fator),
    })),
  };

  return { kpis, graficoLinha, graficoBarra };
}
