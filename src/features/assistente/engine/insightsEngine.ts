import type { AreaDashboard, KpiDef } from '../../analise-dados/data/types.js';

export type TipoInsight = 'positivo' | 'atencao' | 'neutro';

export interface Insight {
  titulo: string;
  mensagem: string;
  tipo: TipoInsight;
  magnitude: number;
}

export interface Comparativo {
  melhor: { area: AreaDashboard; pontuacao: number };
  atencao: { area: AreaDashboard; pontuacao: number };
}

const LIMIAR_DESTAQUE = 5;

// tira acento pra facilitar a busca (NFD separa a letra do acento, aí a gente descarta o acento)
function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function classificarKpi(kpi: KpiDef): Insight {
  const magnitude = Math.abs(kpi.delta);

  // se o kpi é "melhor quando aumenta" e ele subiu, a direção é boa. senão é o contrário
  let direcaoBoa: boolean;
  if (kpi.melhorQuandoAumenta) {
    direcaoBoa = kpi.delta >= 0;
  } else {
    direcaoBoa = kpi.delta <= 0;
  }

  let verbo: string;
  if (kpi.delta === 0) {
    verbo = 'se manteve estável';
  } else if (kpi.delta > 0) {
    verbo = 'subiu';
  } else {
    verbo = 'caiu';
  }

  let tipo: TipoInsight;
  if (kpi.delta === 0) {
    tipo = 'neutro';
  } else if (direcaoBoa) {
    tipo = magnitude >= LIMIAR_DESTAQUE ? 'positivo' : 'neutro';
  } else {
    tipo = magnitude >= LIMIAR_DESTAQUE ? 'atencao' : 'neutro';
  }

  let mensagem: string;
  if (kpi.delta === 0) {
    mensagem = `${kpi.label} ${verbo} neste período (${kpi.value}).`;
  } else if (direcaoBoa) {
    mensagem = `${kpi.label} ${verbo} ${magnitude.toFixed(1)}% — na direção certa.`;
  } else {
    mensagem = `${kpi.label} ${verbo} ${magnitude.toFixed(1)}% — vale a pena dar uma olhada mais de perto.`;
  }

  return { titulo: kpi.label, mensagem, tipo, magnitude };
}

export function gerarInsights(area: AreaDashboard, { limite = 4 }: { limite?: number } = {}): Insight[] {
  const todosInsights = area.kpis.map(classificarKpi);

  // maior magnitude primeiro
  todosInsights.sort((a, b) => b.magnitude - a.magnitude);

  return todosInsights.slice(0, limite);
}

function pontuarArea(area: AreaDashboard): number {
  let soma = 0;
  for (const kpi of area.kpis) {
    const sinal = kpi.melhorQuandoAumenta ? 1 : -1;
    soma += sinal * kpi.delta;
  }
  return soma / area.kpis.length;
}

export function compararAreas(areas: AreaDashboard[]): Comparativo | null {
  const candidatas = areas.filter((a) => a.id !== 'geral');
  if (candidatas.length === 0) return null;

  const pontuadas = candidatas.map((area) => ({ area, pontuacao: pontuarArea(area) }));
  pontuadas.sort((a, b) => b.pontuacao - a.pontuacao);

  const melhor = pontuadas[0];
  const atencao = pontuadas[pontuadas.length - 1];

  return { melhor, atencao };
}

export function responderPergunta(area: AreaDashboard, pergunta: string): string {
  const textoNormalizado = normalizarTexto(pergunta);
  const palavras = textoNormalizado.split(/\W+/).filter((p) => p.length > 2);

  // procura o primeiro kpi cujo nome bate com alguma palavra da pergunta
  let kpiEncontrado: KpiDef | undefined;
  for (const kpi of area.kpis) {
    const labelNormalizado = normalizarTexto(kpi.label);
    const bateu = palavras.some((p) => labelNormalizado.includes(p));
    if (bateu) {
      kpiEncontrado = kpi;
      break;
    }
  }

  if (kpiEncontrado) {
    const { mensagem } = classificarKpi(kpiEncontrado);
    return `${kpiEncontrado.label} está em ${kpiEncontrado.value} agora. ${mensagem}`;
  }

  const nomesKpis = area.kpis.map((k) => k.label).join(', ');
  return `Não encontrei um indicador de "${area.label}" relacionado a isso. Tente perguntar sobre: ${nomesKpis}.`;
}
