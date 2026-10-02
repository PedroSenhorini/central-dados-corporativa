import { useCallback, useEffect, useMemo, useState, type DragEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Headset, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client.js';
import { useAuth } from '../../../shared/context/AuthContext.js';
import PageHeader from '../../../shared/components/PageHeader.js';
import Modal from '../../../shared/components/Modal.js';
import Pill, { type TomPill } from '../../../shared/components/Pill.js';
import { btnPrimario, btnSecundario, inputClass, labelClass, painelClass } from '../../../shared/styles/classes.js';
import { atendeChamadosTi } from '../../../shared/utils/permissoes.js';
import { iniciais, tempoRelativo } from '../../../shared/utils/formatacao.js';
import type { CategoriaChamado, ChamadoComRelacoes, PrioridadeChamado, StatusChamado } from '../../../shared/types/database.js';

const SELECT =
  '*, solicitante:profiles!chamados_ti_solicitante_id_fkey(nome), responsavel:profiles!chamados_ti_responsavel_id_fkey(nome)';

const COLUNAS: { id: StatusChamado; titulo: string; tom: TomPill }[] = [
  { id: 'aberto', titulo: 'Aberto', tom: 'azul' },
  { id: 'em_atendimento', titulo: 'Em atendimento', tom: 'ambar' },
  { id: 'aguardando_usuario', titulo: 'Aguardando você', tom: 'neutro' },
  { id: 'resolvido', titulo: 'Resolvido', tom: 'verde' },
];

const CATEGORIAS: { id: CategoriaChamado; label: string }[] = [
  { id: 'equipamento', label: 'Equipamento (computador, impressora...)' },
  { id: 'acesso', label: 'Acesso ou senha' },
  { id: 'sistema', label: 'Sistema (ERP, e-mail, Office)' },
  { id: 'rede', label: 'Internet, VPN ou rede' },
  { id: 'outro', label: 'Outro' },
];

const PRIORIDADES: { id: PrioridadeChamado; label: string; tom: TomPill }[] = [
  { id: 'baixa', label: 'Baixa', tom: 'neutro' },
  { id: 'media', label: 'Média', tom: 'ambar' },
  { id: 'alta', label: 'Alta', tom: 'vermelho' },
];
const prioridade = (id: PrioridadeChamado) => PRIORIDADES.find((p) => p.id === id) ?? PRIORIDADES[1]!;

interface NovoChamado {
  titulo: string;
  descricao: string | null;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
}

function NovoChamadoModal({ onFechar, onCriar }: { onFechar: () => void; onCriar: (c: NovoChamado) => Promise<string | null> }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaChamado>('equipamento');
  const [prio, setPrio] = useState<PrioridadeChamado>('media');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (titulo.trim().length < 3) return;
    setSalvando(true);
    const falha = await onCriar({ titulo: titulo.trim(), descricao: descricao.trim() || null, categoria, prioridade: prio });
    setSalvando(false);
    if (falha) setErro(falha);
  };

  return (
    <Modal titulo="Abrir chamado de TI" onFechar={onFechar}>
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chamado-titulo" className={labelClass}>Resumo do problema</label>
          <input id="chamado-titulo" className={inputClass} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: VPN não conecta fora da rede" autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chamado-categoria" className={labelClass}>Categoria</label>
          <select id="chamado-categoria" className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaChamado)}>
            {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <fieldset className="flex flex-col gap-1.5">
          <legend className={`${labelClass} mb-1.5`}>Impacto no seu trabalho</legend>
          <div className="flex gap-2">
            {PRIORIDADES.map((p) => (
              <label key={p.id} className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-[13px] transition-colors ${prio === p.id ? 'border-ink2 bg-canvas text-ink2 font-medium' : 'border-border text-muted hover:text-ink2'}`}>
                <input type="radio" name="prioridade" value={p.id} checked={prio === p.id} onChange={() => setPrio(p.id)} className="sr-only" />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chamado-descricao" className={labelClass}>Descrição</label>
          <textarea id="chamado-descricao" rows={4} className={inputClass} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que aconteceu, desde quando e qual mensagem de erro aparece." />
        </div>
        {erro && <p className="flex items-start gap-2 text-[13px] text-red-600"><AlertCircle size={14} className="mt-0.5 shrink-0" />{erro}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btnSecundario} onClick={onFechar}>Cancelar</button>
          <button type="submit" className={btnPrimario} disabled={salvando || titulo.trim().length < 3}>
            {salvando && <Loader2 size={14} className="animate-spin" />}Abrir chamado
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function ChamadosTiPage() {
  const { user, profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const atende = atendeChamadosTi(profile?.papel);

  const [chamados, setChamados] = useState<ChamadoComRelacoes[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const modalAberto = params.get('novo') === '1';

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from('chamados_ti').select(SELECT).order('created_at', { ascending: true });
    if (error) setErro('Não foi possível carregar os chamados. Confirme se a migration 20261002_modulos_intranet.sql foi aplicada no Supabase.');
    else setChamados((data ?? []) as unknown as ChamadoComRelacoes[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (novo: NovoChamado): Promise<string | null> => {
    if (!user) return 'Sessão expirada. Entre novamente.';
    const { error } = await supabase.from('chamados_ti').insert({ ...novo, solicitante_id: user.id });
    if (error) return 'Não foi possível abrir o chamado. Tente de novo em instantes.';
    setParams({});
    carregar();
    return null;
  };

  const mover = async (id: string, status: StatusChamado) => {
    const chamado = chamados.find((c) => c.id === id);
    if (!chamado || chamado.status === status || !atende) return;
    const patch = {
      status,
      resolvido_em: status === 'resolvido' ? new Date().toISOString() : null,
      responsavel_id: chamado.responsavel_id ?? user?.id ?? null,
    };
    setChamados((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...patch, responsavel: c.responsavel ?? (profile ? { nome: profile.nome } : null) }
          : c
      )
    );
    const { error } = await supabase.from('chamados_ti').update(patch).eq('id', id);
    if (error) carregar();
  };

  const abertos = useMemo(() => chamados.filter((c) => c.status !== 'resolvido'), [chamados]);
  const altaPrioridade = abertos.filter((c) => c.prioridade === 'alta').length;
  const meus = chamados.filter((c) => c.solicitante_id === user?.id);

  const soltar = (e: DragEvent<HTMLDivElement>, status: StatusChamado) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) mover(id, status);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Chamados de TI"
        descricao={atende ? 'Fila de atendimento da TI. Arraste os cartões para mudar a etapa.' : 'Peça ajuda para equipamentos, acessos e sistemas.'}
        acoes={
          <button type="button" className={btnPrimario} onClick={() => setParams({ novo: '1' })}>
            <Plus size={14} /> Abrir chamado
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: atende ? 'Chamados em aberto' : 'Meus chamados em aberto', valor: atende ? abertos.length : meus.filter((c) => c.status !== 'resolvido').length },
          { label: 'Prioridade alta', valor: altaPrioridade },
          { label: atende ? 'Resolvidos' : 'Meus chamados resolvidos', valor: (atende ? chamados : meus).filter((c) => c.status === 'resolvido').length },
        ].map((c) => (
          <div key={c.label} className={`${painelClass} p-4 flex flex-col gap-2`}>
            <p className="text-[12px] font-medium text-muted">{c.label}</p>
            <p className={`text-[24px] leading-none font-semibold tracking-tight tabular-nums ${c.label === 'Prioridade alta' && c.valor > 0 ? 'text-red-600' : 'text-ink2'}`}>{c.valor}</p>
          </div>
        ))}
      </div>

      {erro && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />{erro}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 text-muted py-20"><Loader2 size={18} className="animate-spin" /> Carregando chamados...</div>
      ) : !erro && chamados.length === 0 ? (
        <div className={`${painelClass} p-10 flex flex-col items-center text-center gap-2`}>
          <Headset size={20} className="text-muted" />
          <p className="text-sm font-medium text-ink2">Nenhum chamado aberto</p>
          <p className="text-[13px] text-muted">Problema com computador, acesso ou sistema? Abra um chamado e a TI acompanha por aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start">
          {COLUNAS.map((coluna) => {
            const doStatus = chamados.filter((c) => c.status === coluna.id);
            return (
              <div
                key={coluna.id}
                onDragOver={(e) => atende && e.preventDefault()}
                onDrop={(e) => soltar(e, coluna.id)}
                className="flex flex-col gap-2 rounded-xl bg-canvas ring-1 ring-inset ring-border p-2.5 min-h-[12rem]"
              >
                <p className="flex items-center justify-between px-1.5 py-0.5 text-[12px] font-semibold text-muted">
                  {coluna.titulo}
                  <span className="font-normal">{doStatus.length}</span>
                </p>
                {doStatus.map((c) => (
                  <div
                    key={c.id}
                    draggable={atende}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                    className={`${painelClass} p-3 flex flex-col gap-2 ${atende ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    <p className="text-[13px] font-medium text-ink2">{c.titulo}</p>
                    {c.descricao && <p className="text-[12px] text-muted line-clamp-2">{c.descricao}</p>}
                    <div className="flex items-center justify-between gap-2">
                      <Pill tom={prioridade(c.prioridade).tom}>{prioridade(c.prioridade).label}</Pill>
                      <span className="text-[11px] text-muted">{tempoRelativo(c.created_at)}</span>
                    </div>
                    {atende && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted border-t border-border pt-2">
                        <span className="w-5 h-5 rounded-full bg-canvas ring-1 ring-border flex items-center justify-center text-[9px] font-semibold text-ink2">
                          {iniciais(c.solicitante?.nome ?? '?')}
                        </span>
                        <span className="truncate">{c.solicitante?.nome ?? 'Colaborador'}</span>
                        {c.responsavel && <span className="ml-auto truncate">→ {c.responsavel.nome.split(' ')[0]}</span>}
                      </div>
                    )}
                    {atende && (
                      <select
                        aria-label="Mudar etapa"
                        className={`${inputClass} py-1 text-[12px] md:hidden`}
                        value={c.status}
                        onChange={(e) => mover(c.id, e.target.value as StatusChamado)}
                      >
                        {COLUNAS.map((col) => <option key={col.id} value={col.id}>{col.titulo}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && <NovoChamadoModal onFechar={() => setParams({})} onCriar={criar} />}
    </div>
  );
}
