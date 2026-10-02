import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Check, Inbox, Loader2, Plus, X } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client.js';
import { useAuth } from '../../../shared/context/AuthContext.js';
import PageHeader from '../../../shared/components/PageHeader.js';
import Modal from '../../../shared/components/Modal.js';
import Pill, { type TomPill } from '../../../shared/components/Pill.js';
import Tabs from '../../../shared/components/Tabs.js';
import { btnPrimario, btnSecundario, inputClass, labelClass, painelClass } from '../../../shared/styles/classes.js';
import { atendeSolicitacoesRh } from '../../../shared/utils/permissoes.js';
import { diasEntre, formatarData, formatarDataCurta } from '../../../shared/utils/formatacao.js';
import type { SolicitacaoRhComRelacoes, StatusSolicitacaoRh, TipoSolicitacaoRh } from '../../../shared/types/database.js';

const SELECT = '*, solicitante:profiles!solicitacoes_rh_solicitante_id_fkey(nome)';

const TIPOS: { id: TipoSolicitacaoRh; label: string; ajuda: string }[] = [
  { id: 'ferias', label: 'Férias', ajuda: 'Informe o período desejado. O RH confirma em até 2 dias úteis.' },
  { id: 'declaracao', label: 'Declaração', ajuda: 'Ex.: comprovante de vínculo, declaração de renda.' },
  { id: 'atualizacao_cadastral', label: 'Atualização cadastral', ajuda: 'Ex.: novo endereço, conta bancária, dependentes.' },
  { id: 'outro', label: 'Outro assunto', ajuda: 'Descreva o que você precisa do RH.' },
];
const nomeTipo = (id: TipoSolicitacaoRh) => TIPOS.find((t) => t.id === id)?.label ?? 'Pedido';

const STATUS: Record<StatusSolicitacaoRh, { label: string; tom: TomPill }> = {
  pendente: { label: 'Em análise', tom: 'ambar' },
  aprovada: { label: 'Aprovada', tom: 'verde' },
  recusada: { label: 'Recusada', tom: 'vermelho' },
  concluida: { label: 'Concluída', tom: 'verde' },
};

interface NovoPedido {
  tipo: TipoSolicitacaoRh;
  descricao: string | null;
  data_inicio: string | null;
  data_fim: string | null;
}

function NovoPedidoModal({ onFechar, onCriar }: { onFechar: () => void; onCriar: (p: NovoPedido) => Promise<string | null> }) {
  const [tipo, setTipo] = useState<TipoSolicitacaoRh>('ferias');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const ferias = tipo === 'ferias';
  const periodoInvalido = ferias && (!inicio || !fim || fim < inicio);
  const podeSalvar = !salvando && !periodoInvalido && (ferias || descricao.trim().length > 2);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!podeSalvar) return;
    setSalvando(true);
    const falha = await onCriar({
      tipo,
      descricao: descricao.trim() || null,
      data_inicio: ferias ? inicio : null,
      data_fim: ferias ? fim : null,
    });
    setSalvando(false);
    if (falha) setErro(falha);
  };

  return (
    <Modal titulo="Nova solicitação ao RH" onFechar={onFechar}>
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rh-tipo" className={labelClass}>O que você precisa?</label>
          <select id="rh-tipo" className={inputClass} value={tipo} onChange={(e) => setTipo(e.target.value as TipoSolicitacaoRh)}>
            {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <p className="text-[12px] text-muted">{TIPOS.find((t) => t.id === tipo)?.ajuda}</p>
        </div>
        {ferias && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rh-inicio" className={labelClass}>Início</label>
              <input id="rh-inicio" type="date" className={inputClass} value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rh-fim" className={labelClass}>Fim</label>
              <input id="rh-fim" type="date" className={inputClass} value={fim} min={inicio || undefined} onChange={(e) => setFim(e.target.value)} />
            </div>
            {inicio && fim && fim >= inicio && (
              <p className="col-span-2 text-[12px] text-muted">{diasEntre(inicio, fim)} dias corridos</p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rh-descricao" className={labelClass}>
            Detalhes {ferias && <span className="text-muted font-normal">(opcional)</span>}
          </label>
          <textarea id="rh-descricao" rows={4} className={inputClass} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        {erro && <p className="flex items-start gap-2 text-[13px] text-red-600"><AlertCircle size={14} className="mt-0.5 shrink-0" />{erro}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btnSecundario} onClick={onFechar}>Cancelar</button>
          <button type="submit" className={btnPrimario} disabled={!podeSalvar}>
            {salvando && <Loader2 size={14} className="animate-spin" />}Enviar pedido
          </button>
        </div>
      </form>
    </Modal>
  );
}

function detalhePedido(p: SolicitacaoRhComRelacoes): string {
  if (p.tipo === 'ferias' && p.data_inicio && p.data_fim) {
    return `${formatarDataCurta(p.data_inicio)} a ${formatarDataCurta(p.data_fim)} · ${diasEntre(p.data_inicio, p.data_fim)} dias`;
  }
  return p.descricao ?? '—';
}

export default function SolicitacoesRhPage() {
  const { user, profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const atende = atendeSolicitacoesRh(profile?.papel);

  const [pedidos, setPedidos] = useState<SolicitacaoRhComRelacoes[]>([]);
  const [visao, setVisao] = useState<'meus' | 'fila'>(atende ? 'fila' : 'meus');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const modalAberto = params.get('novo') === '1';

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from('solicitacoes_rh').select(SELECT).order('created_at', { ascending: false });
    if (error) setErro('Não foi possível carregar as solicitações. Confirme se a migration 20261002_modulos_intranet.sql foi aplicada no Supabase.');
    else setPedidos((data ?? []) as unknown as SolicitacaoRhComRelacoes[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const meus = useMemo(() => pedidos.filter((p) => p.solicitante_id === user?.id), [pedidos, user?.id]);
  const fila = useMemo(() => pedidos.filter((p) => p.status === 'pendente'), [pedidos]);
  const emAnalise = meus.filter((p) => p.status === 'pendente').length;
  const ultimoAprovado = meus.find((p) => p.tipo === 'ferias' && p.status === 'aprovada');

  const criar = async (novo: NovoPedido): Promise<string | null> => {
    if (!user) return 'Sessão expirada. Entre novamente.';
    const { error } = await supabase.from('solicitacoes_rh').insert({ ...novo, solicitante_id: user.id });
    if (error) return 'Não foi possível enviar o pedido. Tente de novo em instantes.';
    setParams({});
    setVisao('meus');
    carregar();
    return null;
  };

  const responder = async (id: string, status: StatusSolicitacaoRh) => {
    const resposta = respostas[id]?.trim() || null;
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status, resposta } : p)));
    const { error } = await supabase
      .from('solicitacoes_rh')
      .update({ status, resposta, responsavel_id: user?.id ?? null })
      .eq('id', id);
    if (error) carregar();
  };

  const lista = visao === 'fila' ? fila : meus;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Solicitações de RH"
        descricao="Férias, declarações e atualização de dados, com acompanhamento do status."
        acoes={
          <button type="button" className={btnPrimario} onClick={() => setParams({ novo: '1' })}>
            <Plus size={14} /> Nova solicitação
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Meus pedidos em análise', valor: String(emAnalise), detalhe: 'resposta em até 2 dias úteis' },
          {
            label: 'Últimas férias aprovadas',
            valor: ultimoAprovado ? formatarDataCurta(ultimoAprovado.data_inicio) : '—',
            detalhe: ultimoAprovado ? `até ${formatarData(ultimoAprovado.data_fim)}` : 'nenhuma ainda',
          },
          atende
            ? { label: 'Fila do RH', valor: String(fila.length), detalhe: 'pedidos aguardando resposta' }
            : { label: 'Total de pedidos', valor: String(meus.length), detalhe: 'desde o início' },
        ].map((c) => (
          <div key={c.label} className={`${painelClass} p-4 flex flex-col gap-2`}>
            <p className="text-[12px] font-medium text-muted">{c.label}</p>
            <p className="text-[24px] leading-none font-semibold tracking-tight text-ink2 tabular-nums">{c.valor}</p>
            <p className="text-[12px] text-muted">{c.detalhe}</p>
          </div>
        ))}
      </div>

      {atende && (
        <Tabs
          rotulo="Visão"
          valor={visao}
          onChange={setVisao}
          opcoes={[
            { id: 'fila', label: `Fila do RH (${fila.length})` },
            { id: 'meus', label: 'Meus pedidos' },
          ]}
        />
      )}

      {erro && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />{erro}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 text-muted py-20"><Loader2 size={18} className="animate-spin" /> Carregando pedidos...</div>
      ) : lista.length === 0 ? (
        <div className={`${painelClass} p-10 flex flex-col items-center text-center gap-2`}>
          <Inbox size={20} className="text-muted" />
          <p className="text-sm text-muted">
            {visao === 'fila' ? 'Nenhum pedido aguardando o RH.' : 'Você ainda não fez nenhum pedido ao RH.'}
          </p>
        </div>
      ) : (
        <section className={`${painelClass} overflow-x-auto`}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[12px] text-muted">
                {visao === 'fila' && <th className="font-medium px-4 py-2.5 border-b border-border">Colaborador</th>}
                <th className="font-medium px-4 py-2.5 border-b border-border">Tipo</th>
                <th className="font-medium px-4 py-2.5 border-b border-border">Detalhe</th>
                <th className="font-medium px-4 py-2.5 border-b border-border whitespace-nowrap">Aberto em</th>
                <th className="font-medium px-4 py-2.5 border-b border-border">{visao === 'fila' ? 'Responder' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map((p) => (
                <tr key={p.id} className="align-top">
                  {visao === 'fila' && <td className="px-4 py-3 text-ink2 whitespace-nowrap">{p.solicitante?.nome ?? '—'}</td>}
                  <td className="px-4 py-3 text-ink2 whitespace-nowrap">{nomeTipo(p.tipo)}</td>
                  <td className="px-4 py-3 text-muted min-w-[14rem]">
                    {detalhePedido(p)}
                    {p.tipo === 'ferias' && p.descricao && <span className="block text-[12px] mt-0.5">{p.descricao}</span>}
                    {p.resposta && visao === 'meus' && <span className="block text-[12px] mt-1 text-ink2">RH: {p.resposta}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap tabular-nums">{formatarData(p.created_at)}</td>
                  <td className="px-4 py-3">
                    {visao === 'fila' ? (
                      <div className="flex flex-col gap-2 min-w-[16rem]">
                        <input
                          aria-label="Resposta ao colaborador"
                          className={inputClass}
                          placeholder="Resposta (opcional)"
                          value={respostas[p.id] ?? ''}
                          onChange={(e) => setRespostas((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <button type="button" className={btnPrimario} onClick={() => responder(p.id, p.tipo === 'ferias' ? 'aprovada' : 'concluida')}>
                            <Check size={14} /> {p.tipo === 'ferias' ? 'Aprovar' : 'Concluir'}
                          </button>
                          <button type="button" className={btnSecundario} onClick={() => responder(p.id, 'recusada')}>
                            <X size={14} /> Recusar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Pill tom={STATUS[p.status].tom}>{STATUS[p.status].label}</Pill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {modalAberto && <NovoPedidoModal onFechar={() => setParams({})} onCriar={criar} />}
    </div>
  );
}
