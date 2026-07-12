const LIMIAR_DESTAQUE = 5;

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function classificarKpi(kpi) {
  const magnitude = Math.abs(kpi.delta);
  const direcaoBoa = kpi.melhorQuandoAumenta ? kpi.delta >= 0 : kpi.delta <= 0;
  const verbo = kpi.delta === 0 ? 'se manteve estável' : kpi.delta > 0 ? 'subiu' : 'caiu';

  let tipo;
  if (kpi.delta === 0) tipo = 'neutro';
  else if (direcaoBoa) tipo = magnitude >= LIMIAR_DESTAQUE ? 'positivo' : 'neutro';
  else tipo = magnitude >= LIMIAR_DESTAQUE ? 'atencao' : 'neutro';

  const mensagem =
    kpi.delta === 0
      ? `${kpi.label} ${verbo} neste período (${kpi.value}).`
      : `${kpi.label} ${verbo} ${magnitude.toFixed(1)}% — ${
          direcaoBoa
            ? 'na direção certa.'
            : 'vale a pena dar uma olhada mais de perto.'
        }`;

  return { titulo: kpi.label, mensagem, tipo, magnitude };
}

export function gerarInsights(area, { limite = 4 } = {}) {
  return area.kpis
    .map(classificarKpi)
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, limite);
}

function pontuarArea(area) {
  const soma = area.kpis.reduce((acc, kpi) => {
    const sinal = kpi.melhorQuandoAumenta ? 1 : -1;
    return acc + sinal * kpi.delta;
  }, 0);
  return soma / area.kpis.length;
}

export function compararAreas(areas) {
  const candidatas = areas.filter((a) => a.id !== 'geral');
  if (candidatas.length === 0) return null;

  const pontuadas = candidatas
    .map((area) => ({ area, pontuacao: pontuarArea(area) }))
    .sort((a, b) => b.pontuacao - a.pontuacao);

  return {
    melhor: pontuadas[0],
    atencao: pontuadas[pontuadas.length - 1],
  };
}

export function responderPergunta(area, pergunta) {
  const textoNormalizado = normalizarTexto(pergunta);
  const palavras = textoNormalizado.split(/\W+/).filter((p) => p.length > 2);

  const kpiEncontrado = area.kpis.find((kpi) => {
    const labelNormalizado = normalizarTexto(kpi.label);
    return palavras.some((p) => labelNormalizado.includes(p));
  });

  if (kpiEncontrado) {
    const { mensagem } = classificarKpi(kpiEncontrado);
    return `${kpiEncontrado.label} está em ${kpiEncontrado.value} agora. ${mensagem}`;
  }

  return `Não encontrei um indicador de "${area.label}" relacionado a isso. Tente perguntar sobre: ${area.kpis
    .map((k) => k.label)
    .join(', ')}.`;
}
