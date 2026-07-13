import { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client.js';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import VagaCard from '../components/VagaCard.jsx';
import NovaVagaModal from '../components/NovaVagaModal.jsx';
import { COLUNAS_VAGAS, ETAPAS_FINAIS, calcularDiasEmAberto } from '../data/constants.js';

const SELECT_VAGAS =
  '*, gestor:profiles!vagas_rh_gestor_solicitante_id_fkey(nome), responsavel:profiles!vagas_rh_responsavel_rh_id_fkey(nome)';

export default function VagasRhPage() {
  const { user, profile } = useAuth();
  const podeGerenciar = profile?.papel === 'rh' || profile?.papel === 'admin';

  const [vagas, setVagas] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const carregarVagas = async () => {
    const { data, error } = await supabase
      .from('vagas_rh')
      .select(SELECT_VAGAS)
      .order('created_at', { ascending: true });
    if (error) {
      setErro(
        'Não foi possível carregar as vagas. Confirme se a versão mais recente do supabase/schema.sql foi aplicada (ela cria a tabela vagas_rh).'
      );
    } else {
      setVagas(data);
    }
    setCarregando(false);
  };

  useEffect(() => {
    carregarVagas();
    if (podeGerenciar) {
      supabase
        .from('profiles')
        .select('id, nome, papel')
        .order('nome', { ascending: true })
        .then(({ data }) => setPerfis(data ?? []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podeGerenciar]);

  const responsaveisRh = useMemo(
    () => perfis.filter((p) => p.papel === 'rh' || p.papel === 'admin'),
    [perfis]
  );

  const podeArrastar = (vaga) => podeGerenciar || vaga.gestor_solicitante_id === user?.id;

  const moverVaga = async (id, novoStatus) => {
    const vaga = vagas.find((v) => v.id === id);
    if (!vaga || vaga.status === novoStatus || !podeArrastar(vaga)) return;

    const patch = {
      status: novoStatus,
      updated_at: new Date().toISOString(),
      data_fechamento: ETAPAS_FINAIS.includes(novoStatus) ? new Date().toISOString().slice(0, 10) : null,
    };

    setVagas((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    const { error } = await supabase.from('vagas_rh').update(patch).eq('id', id);
    if (error) carregarVagas();
  };

  const criarVaga = async (novaVaga) => {
    const { error } = await supabase.from('vagas_rh').insert(novaVaga);
    if (!error) {
      setModalAberto(false);
      carregarVagas();
    }
  };

  const handleDragStart = (e, vagaId) => {
    e.dataTransfer.setData('text/plain', vagaId);
  };

  const handleDrop = (e, colunaId) => {
    e.preventDefault();
    const vagaId = e.dataTransfer.getData('text/plain');
    if (vagaId) moverVaga(vagaId, colunaId);
  };

  const totalAbertas = vagas.filter((v) => !ETAPAS_FINAIS.includes(v.status)).length;
  const totalVencidas = vagas.filter(
    (v) => !ETAPAS_FINAIS.includes(v.status) && calcularDiasEmAberto(v) >= v.prazo_sla_dias
  ).length;
  const contratadas = vagas.filter((v) => v.status === 'contratada');
  const tempoMedioContratacao = contratadas.length
    ? Math.round(contratadas.reduce((soma, v) => soma + calcularDiasEmAberto(v), 0) / contratadas.length)
    : null;

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted py-24">
        <Loader2 size={18} className="animate-spin" />
        Carregando vagas...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink2">Vagas (RH)</h1>
          <p className="text-sm text-muted mt-0.5">
            Kanban de recrutamento com controle de SLA por vaga.
          </p>
        </div>
        {podeGerenciar && (
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors shrink-0"
          >
            <Plus size={15} />
            Nova vaga
          </button>
        )}
      </div>

      {erro && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {erro}
        </div>
      )}

      {!erro && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
              <p className="text-[13px] font-medium text-muted">Vagas abertas</p>
              <p className="font-display text-2xl font-semibold text-ink2 mt-1">{totalAbertas}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
              <p className="text-[13px] font-medium text-muted">SLA vencido</p>
              <p
                className={`font-display text-2xl font-semibold mt-1 ${
                  totalVencidas > 0 ? 'text-red-600' : 'text-ink2'
                }`}
              >
                {totalVencidas}
              </p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
              <p className="text-[13px] font-medium text-muted">Tempo médio de contratação</p>
              <p className="font-display text-2xl font-semibold text-ink2 mt-1">
                {tempoMedioContratacao !== null ? `${tempoMedioContratacao} dias` : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
            {COLUNAS_VAGAS.map((coluna) => {
              const vagasDaColuna = vagas.filter((v) => v.status === coluna.id);
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
                    <span className="text-[11px] text-muted">{vagasDaColuna.length}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {vagasDaColuna.map((vaga) => (
                      <VagaCard
                        key={vaga.id}
                        vaga={vaga}
                        arrastavel={podeArrastar(vaga)}
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
        <NovaVagaModal
          perfis={perfis}
          responsaveisRh={responsaveisRh}
          perfilAtualId={user?.id}
          onFechar={() => setModalAberto(false)}
          onCriar={criarVaga}
        />
      )}
    </div>
  );
}
