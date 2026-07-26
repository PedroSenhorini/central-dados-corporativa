import type { LucideIcon } from 'lucide-react';

export interface KpiDef {
  label: string;
  value: string;
  delta: number;
  sparkline: number[];
  accent: 'primary' | 'accent';
  melhorQuandoAumenta: boolean;
}

// as chaves mudam de acordo com a área (mes/categoria + valor)
export type PontoGrafico = Record<string, string | number>;

export interface GraficoDef {
  titulo: string;
  subtitulo: string;
  eixoX: string;
  dataKey: string;
  dados: PontoGrafico[];
}

export interface AreaDashboard {
  id: string;
  label: string;
  icon: LucideIcon;
  descricao: string;
  kpis: KpiDef[];
  graficoLinha: GraficoDef;
  graficoBarra: GraficoDef;
}

export interface FiltrosDashboard {
  periodoId: string;
  filialId: string;
}

export interface DadosDashboard {
  kpis: KpiDef[];
  graficoLinha: GraficoDef;
  graficoBarra: GraficoDef;
}
