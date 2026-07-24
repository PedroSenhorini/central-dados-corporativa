import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client.js';
import { useAuth } from '../../../shared/context/AuthContext.js';
import SolicitacaoCard from '../components/SolicitacaoCard.js';
import NovaSolicitacaoModal, { type NovaSolicitacaoInput } from '../components/NovaSolicitacaoModal.js';
import { COLUNAS_COMPRA, ETAPAS_FINAIS_COMPRA, formatarMoeda } from '../data/constants.js';
import type { SolicitacaoComRelacoes, StatusCompra } from '../../../shared/types/database.js';

const SELECT_SOLICITACOES = '*, solicitante:profiles!solicitacoes_compra_solicitante_id_fkey(nome)';

export default function ComprasPage() {
  const { user, profile } = useAuth();
  const podeGerenciar = profile?.papel === 'compras' || profile?.papel === 'admin';

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoComRelacoes[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const carregarSolicitacoes = async () => {
    const { data, error } = await supabase
      .from('solicitacoes_compra')
      .select(SELECT_SOLICITACOES)
      .order('created_at', { ascending: true });
    if (error) {
      setErro(
        'Não foi possível carregar as solicitações. Confirme se a versão mais recente do supabase/schema.sql foi aplicada (ela cria a tabela solicitacoes_compra).'
      );
    } else {
      setSolicitacoes((data ?? []) as unknown as SolicitacaoComRelacoes[]);
    }
    setCarregando(false);
  };

  useEffect(() => {
    carregarSolicitacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const podeArrastar = () => podeGerenciar;

  const moverSolicitacao = async (id: string, novoStatus: StatusCompra) => {
    const solicitacao = solicitacoes.find((s) => s.id === id);
    if (!solicitacao || solicitacao.status === novoStatus || !podeArrastar()) return;

    const patch = { status: novoStatus, updated_at: new Date().toISOString() };

    setSolicitacoes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    const { error } = await supabase.from('solicitacoes_compra').update(patch).eq('id', id);
    if (error) carregarSolicitacoes();
  };

  const criarSolicitacao = async (novaSolicitacao: NovaSolicitacaoInput) => {
    const { error } = await supabase
      .from('solicitacoes_compra')
      .insert({ ...novaSolicitacao, solicitante_id: user?.id ?? null });
    if (!error) {
      setModalAberto(false);
      carregarSolicitacoes();
    }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, solicitacaoId: string) => {
    e.dataTransfer.setData('text/plain', solicitacaoId);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, colunaId: StatusCompra) => {
    e.preventDefault();
    const solicitacaoId = e.dataTransfer.getData('text/plain');
    if (solicitacaoId) moverSolicitacao(solicitacaoId, colunaId);
  };

  const emAberto = useMemo(
    () => solicitacoes.filter((s) => !ETAPAS_FINAIS_COMPRA.includes(s.status)),
    [solicitacoes]
  );
  const totalEmAberto = emAberto.length;
  const valorEmAberto = emAberto.reduce((soma, s) => soma + (s.valor_estimado ?? 0), 0);
  const urgentesEmAberto = emAberto.filter((s) => s.urgencia === 'alta' || s.urgencia === 'critica').length;
  const inicioDoMes = new Date();
  inicioDoMes.setDate(1);
  inicioDoMes.setHours(0, 0, 0, 0);
  const compradasNoMes = solicitacoes.filter(
    (s) => s.status === 'comprado' && new Date(s.updated_at) >= inicioDoMes
  ).length;

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted py-24">
        <Loader2 size={18} className="animate-spin" />
        Carregando solicitações...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink2">Compras</h1>
          <p className="text-sm text-muted mt-0.5">
            Solicitação e orçamento de compra de produtos e equipamentos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors shrink-0"
        >
          <Plus size={15} />
          Nova solicitação
        </button>
      </div>

      {erro && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {erro}
        </div>
      )}

      {!erro && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
              <p className="text-[13px] font-medium text-muted">Solicitações em aberto</p>
              <p className="font-display text-2xl font-semibold text-ink2 mt-1">{totalEmAberto}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
              <p className="text-[13px] font-medium text-muted">Valor estimado em aberto</p>
              <p className="font-display text-2xl font-semibold text-ink2 mt-1">{formatarMoeda(valorEmAberto)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
              <p className="text-[13px] font-medium text-muted">Urgentes / críticas</p>
              <p
                className={`font-display text-2xl font-semibold mt-1 ${
                  urgentesEmAberto > 0 ? 'text-red-600' : 'text-ink2'
                }`}
              >
                {urgentesEmAberto}
              </p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
              <p className="text-[13px] font-medium text-muted">Compradas no mês</p>
              <p className="font-display text-2xl font-semibold text-ink2 mt-1">{compradasNoMes}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
            {COLUNAS_COMPRA.map((coluna) => {
              const solicitacoesDaColuna = solicitacoes.filter((s) => s.status === coluna.id);
              return (
                <div
                  key={coluna.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, coluna.id)}
                  className="flex flex-col gap-3 bg-canvas border border-border rounded-xl p-3 min-h-[16rem]"
                >
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                      {coluna.titulo}
                    </p>
                    <span className="text-[11px] text-muted">{solicitacoesDaColuna.length}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {solicitacoesDaColuna.map((solicitacao) => (
                      <SolicitacaoCard
                        key={solicitacao.id}
                        solicitacao={solicitacao}
                        arrastavel={podeArrastar()}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {modalAberto && (
        <NovaSolicitacaoModal onFechar={() => setModalAberto(false)} onCriar={criarSolicitacao} />
      )}
    </div>
  );
}
