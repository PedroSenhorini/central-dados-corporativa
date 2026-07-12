import { useMemo, useState } from 'react';
import { Sparkles, X, TrendingUp, TrendingDown, Minus, Send } from 'lucide-react';
import { AREAS_DASHBOARD } from '../../analise-dados/data/dashboards.js';
import { gerarInsights, compararAreas, responderPergunta } from '../engine/insightsEngine.js';

const ESTILO_TIPO = {
  positivo: {
    icon: TrendingUp,
    badge: 'bg-success/10 text-success',
  },
  atencao: {
    icon: TrendingDown,
    badge: 'bg-red-50 text-red-600',
  },
  neutro: {
    icon: Minus,
    badge: 'bg-canvas text-muted',
  },
};

function CartaoInsight({ titulo, mensagem, tipo }) {
  const { icon: Icon, badge } = ESTILO_TIPO[tipo];
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border px-3 py-2.5">
      <span className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${badge}`}>
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink2">{titulo}</p>
        <p className="text-[12px] text-muted mt-0.5">{mensagem}</p>
      </div>
    </div>
  );
}

export default function AssistantWidget() {
  const [aberto, setAberto] = useState(false);
  const [areaId, setAreaId] = useState(AREAS_DASHBOARD[0].id);
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');

  const area = AREAS_DASHBOARD.find((a) => a.id === areaId);
  const insights = useMemo(() => gerarInsights(area), [area]);
  const comparativo = useMemo(
    () => (area.id === 'geral' ? compararAreas(AREAS_DASHBOARD) : null),
    [area]
  );

  const handlePerguntar = (e) => {
    e.preventDefault();
    if (!pergunta.trim()) return;
    setResposta(responderPergunta(area, pergunta));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? 'Fechar assistente' : 'Abrir assistente de insights'}
        className="fixed bottom-5 right-5 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-card hover:bg-primary-hover transition-colors"
      >
        {aberto ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {aberto && (
        <div className="fixed bottom-24 right-5 z-30 w-[22rem] max-h-[75vh] flex flex-col bg-surface border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border bg-ink text-white">
            <p className="font-display text-sm font-semibold flex items-center gap-1.5">
              <Sparkles size={15} className="text-accent" /> Assistente de Insights
            </p>
            <p className="text-[11px] text-white/50 mt-0.5">
              Leitura automática dos seus indicadores, sem esperar relatório.
            </p>
          </div>

          <div className="px-4 py-3 border-b border-border">
            <select
              value={areaId}
              onChange={(e) => {
                setAreaId(e.target.value);
                setResposta('');
              }}
              className="w-full rounded-lg border border-border px-2.5 py-1.5 text-[13px] text-ink2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {AREAS_DASHBOARD.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto scroll-slim px-4 py-3 flex flex-col gap-2.5">
            {comparativo && (
              <div className="rounded-lg bg-primary-soft px-3 py-2.5 text-[12.5px] text-ink2">
                <span className="font-medium">{comparativo.melhor.area.label}</span> é a área com melhor
                desempenho agora. <span className="font-medium">{comparativo.atencao.area.label}</span>{' '}
                é a que mais precisa de atenção.
              </div>
            )}

            {insights.map((insight) => (
              <CartaoInsight key={insight.titulo} {...insight} />
            ))}

            {resposta && (
              <div className="rounded-lg bg-accent-soft px-3 py-2.5 text-[12.5px] text-ink2 mt-1">
                {resposta}
              </div>
            )}
          </div>

          <form onSubmit={handlePerguntar} className="p-3 border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder={`Pergunte sobre ${area.label}...`}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-[13px] text-ink2 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="submit"
              aria-label="Enviar pergunta"
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
