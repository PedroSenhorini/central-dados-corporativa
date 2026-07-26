import type { AreaDashboard, DadosDashboard, FiltrosDashboard, GraficoDef, PontoGrafico } from '../data/types.js';

// funções que aplicam os filtros (período/filial) em cima dos dados mockados.
// quando tiver API de verdade isso tudo pode sumir daqui

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

// pega uma área inteira (kpis + os dois gráficos) e devolve os dados já
// filtrados por período/filial, prontos pra jogar nos componentes
export function aplicarFiltros(area: AreaDashboard, filtros: FiltrosDashboard): DadosDashboard {
  const fator = fatorFilial(filtros.filialId);
  const meses = mesesPeriodo(filtros.periodoId);

  const kpis = area.kpis.map((kpi) => {
    const sparklineEscalada = kpi.sparkline.map((v) => escalar(v, fator));
    const sparkline = recortarUltimos(sparklineEscalada, meses);
    return { ...kpi, sparkline };
  });

  const pontosLinha = recortarUltimos(area.graficoLinha.dados, meses);
  const dadosLinha: PontoGrafico[] = pontosLinha.map((ponto) => {
    const valorOriginal = Number(ponto[area.graficoLinha.dataKey]);
    return { ...ponto, [area.graficoLinha.dataKey]: escalar(valorOriginal, fator) };
  });
  const graficoLinha: GraficoDef = { ...area.graficoLinha, dados: dadosLinha };

  const dadosBarra: PontoGrafico[] = area.graficoBarra.dados.map((ponto) => {
    const valorOriginal = Number(ponto[area.graficoBarra.dataKey]);
    return { ...ponto, [area.graficoBarra.dataKey]: escalar(valorOriginal, fator) };
  });
  const graficoBarra: GraficoDef = { ...area.graficoBarra, dados: dadosBarra };

  return { kpis, graficoLinha, graficoBarra };
}
