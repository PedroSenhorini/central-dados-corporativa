import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Check, Loader2, Megaphone, Pin, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client.js';
import { useAuth } from '../../../shared/context/AuthContext.js';
import PageHeader from '../../../shared/components/PageHeader.js';
import Modal from '../../../shared/components/Modal.js';
import Pill, { type TomPill } from '../../../shared/components/Pill.js';
import Tabs from '../../../shared/components/Tabs.js';
import { btnPrimario, btnSecundario, inputClass, labelClass, painelClass } from '../../../shared/styles/classes.js';
import { podePublicarComunicado } from '../../../shared/utils/permissoes.js';
import { tempoRelativo } from '../../../shared/utils/formatacao.js';
import type { CategoriaComunicado, ComunicadoComAutor } from '../../../shared/types/database.js';

const CATEGORIAS: { id: CategoriaComunicado; label: string; tom: TomPill }[] = [
  { id: 'geral', label: 'Geral', tom: 'neutro' },
  { id: 'diretoria', label: 'Diretoria', tom: 'azul' },
  { id: 'rh', label: 'RH', tom: 'ambar' },
  { id: 'ti', label: 'TI', tom: 'neutro' },
  { id: 'eventos', label: 'Eventos', tom: 'verde' },
];
const categoria = (id: CategoriaComunicado) => CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0]!;

interface NovoComunicado {
  titulo: string;
  corpo: string;
  categoria: CategoriaComunicado;
  fixado: boolean;
}

function NovoComunicadoModal({ onFechar, onPublicar }: { onFechar: () => void; onPublicar: (c: NovoComunicado) => Promise<string | null> }) {
  const [titulo, setTitulo] = useState('');
  const [corpo, setCorpo] = useState('');
  const [cat, setCat] = useState<CategoriaComunicado>('geral');
  const [fixado, setFixado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (titulo.trim().length < 3 || corpo.trim().length < 3) return;
    setSalvando(true);
    const falha = await onPublicar({ titulo: titulo.trim(), corpo: corpo.trim(), categoria: cat, fixado });
    setSalvando(false);
    if (falha) setErro(falha);
  };

  return (
    <Modal titulo="Novo comunicado" onFechar={onFechar} largura="lg">
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="comunicado-titulo" className={labelClass}>Título</label>
          <input id="comunicado-titulo" className={inputClass} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Nova política de home office" autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="comunicado-corpo" className={labelClass}>Mensagem</label>
          <textarea id="comunicado-corpo" rows={7} className={inputClass} value={corpo} onChange={(e) => setCorpo(e.target.value)} placeholder="Escreva o comunicado para toda a empresa." />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="comunicado-categoria" className={labelClass}>Categoria</label>
            <select id="comunicado-categoria" className={inputClass} value={cat} onChange={(e) => setCat(e.target.value as CategoriaComunicado)}>
              {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <label htmlFor="comunicado-fixado" className="flex items-center gap-2 text-[13px] text-ink2 pb-2">
            <input id="comunicado-fixado" type="checkbox" checked={fixado} onChange={(e) => setFixado(e.target.checked)} />
            Fixar no topo do mural e da página inicial
          </label>
        </div>
        {erro && (
          <p className="flex items-start gap-2 text-[13px] text-red-600"><AlertCircle size={14} className="mt-0.5 shrink-0" />{erro}</p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btnSecundario} onClick={onFechar}>Cancelar</button>
          <button type="submit" className={btnPrimario} disabled={salvando || titulo.trim().length < 3 || corpo.trim().length < 3}>
            {salvando && <Loader2 size={14} className="animate-spin" />}Publicar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function MuralPage() {
  const { user, profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const podePublicar = podePublicarComunicado(profile?.papel);

  const [comunicados, setComunicados] = useState<ComunicadoComAutor[]>([]);
  const [lidos, setLidos] = useState<Set<string>>(new Set());
  const [leituras, setLeituras] = useState<Record<string, number>>({});
  const [totalAtivos, setTotalAtivos] = useState(0);
  const [filtro, setFiltro] = useState<CategoriaComunicado | 'todos'>('todos');
  const [aberto, setAberto] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const modalAberto = params.get('novo') === '1' && podePublicar;

  const carregar = useCallback(async () => {
    if (!user) return;
    const [lista, minhas, resumo] = await Promise.all([
      supabase
        .from('comunicados')
        .select('*, autor:profiles!comunicados_autor_id_fkey(nome)')
        .order('fixado', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('comunicados_leituras').select('comunicado_id').eq('user_id', user.id),
      supabase.rpc('resumo_leituras'),
    ]);
    if (lista.error) {
      setErro('Não foi possível carregar o mural. Confirme se a migration 20261002_modulos_intranet.sql foi aplicada no Supabase.');
    } else {
      setComunicados((lista.data ?? []) as unknown as ComunicadoComAutor[]);
      setLidos(new Set((minhas.data ?? []).map((l) => l.comunicado_id)));
      const contagem: Record<string, number> = {};
      (resumo.data ?? []).forEach((r) => {
        contagem[r.comunicado_id] = Number(r.leituras);
        setTotalAtivos(Number(r.total_ativos));
      });
      setLeituras(contagem);
    }
    setCarregando(false);
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const visiveis = useMemo(
    () => (filtro === 'todos' ? comunicados : comunicados.filter((c) => c.categoria === filtro)),
    [comunicados, filtro]
  );

  const confirmarLeitura = async (id: string) => {
    if (!user || lidos.has(id)) return;
    setLidos((prev) => new Set(prev).add(id));
    setLeituras((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    const { error } = await supabase.from('comunicados_leituras').insert({ comunicado_id: id, user_id: user.id });
    if (error) carregar();
  };

  const publicar = async (novo: NovoComunicado): Promise<string | null> => {
    if (!user) return 'Sessão expirada. Entre novamente.';
    const { error } = await supabase.from('comunicados').insert({ ...novo, autor_id: user.id });
    if (error) return 'Não foi possível publicar. Verifique se sua área tem permissão para publicar no mural.';
    setParams({});
    carregar();
    return null;
  };

  const alternarFixado = async (c: ComunicadoComAutor) => {
    setComunicados((prev) => prev.map((x) => (x.id === c.id ? { ...x, fixado: !c.fixado } : x)));
    const { error } = await supabase.from('comunicados').update({ fixado: !c.fixado }).eq('id', c.id);
    if (error) carregar();
  };

  const excluir = async (id: string) => {
    setComunicados((prev) => prev.filter((x) => x.id !== id));
    const { error } = await supabase.from('comunicados').delete().eq('id', id);
    if (error) carregar();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Mural"
        descricao="Comunicados oficiais da empresa, com confirmação de leitura."
        acoes={
          podePublicar && (
            <button type="button" className={btnPrimario} onClick={() => setParams({ novo: '1' })}>
              <Plus size={14} /> Novo comunicado
            </button>
          )
        }
      />

      <Tabs
        rotulo="Categoria"
        valor={filtro}
        onChange={setFiltro}
        opcoes={[{ id: 'todos', label: 'Todos' }, ...CATEGORIAS.map(({ id, label }) => ({ id, label }))]}
      />

      {erro && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />{erro}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 text-muted py-20"><Loader2 size={18} className="animate-spin" /> Carregando comunicados...</div>
      ) : !erro && visiveis.length === 0 ? (
        <div className={`${painelClass} p-10 flex flex-col items-center text-center gap-2`}>
          <Megaphone size={20} className="text-muted" />
          <p className="text-sm font-medium text-ink2">Nenhum comunicado por aqui</p>
          <p className="text-[13px] text-muted">
            {podePublicar ? 'Publique o primeiro comunicado para a empresa.' : 'Quando a empresa publicar um comunicado, ele aparece aqui.'}
          </p>
        </div>
      ) : (
        <ul className={`${painelClass} divide-y divide-border`}>
          {visiveis.map((c) => {
            const lido = lidos.has(c.id);
            const expandido = aberto === c.id;
            const pct = totalAtivos ? Math.round(((leituras[c.id] ?? 0) / totalAtivos) * 100) : 0;
            return (
              <li key={c.id} className="px-4 py-4 flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <Pill tom={categoria(c.categoria).tom}>{categoria(c.categoria).label}</Pill>
                  <button type="button" onClick={() => setAberto(expandido ? null : c.id)} className="flex-1 min-w-0 text-left">
                    <span className="flex items-center gap-1.5 text-[14px] font-medium text-ink2">
                      {c.fixado && <Pin size={13} className="text-muted shrink-0" />}
                      <span className="truncate">{c.titulo}</span>
                    </span>
                    <span className="block text-[12px] text-muted mt-0.5">
                      {c.autor?.nome ?? 'Comunicação'} · {tempoRelativo(c.created_at)} · lido por {pct}%
                    </span>
                  </button>
                  {lido ? (
                    <Pill tom="verde"><Check size={11} /> Lido</Pill>
                  ) : (
                    <Pill tom="azul">Novo</Pill>
                  )}
                </div>
                {expandido && (
                  <div className="pl-0 sm:pl-[4.5rem] flex flex-col gap-3">
                    <p className="text-sm text-ink2/80 leading-relaxed whitespace-pre-line max-w-[70ch]">{c.corpo}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {!lido && (
                        <button type="button" className={btnPrimario} onClick={() => confirmarLeitura(c.id)}>
                          <Check size={14} /> Confirmar leitura
                        </button>
                      )}
                      {podePublicar && (
                        <>
                          <button type="button" className={btnSecundario} onClick={() => alternarFixado(c)}>
                            <Pin size={14} /> {c.fixado ? 'Desafixar' : 'Fixar'}
                          </button>
                          {confirmandoExclusao === c.id ? (
                            <button type="button" className={`${btnSecundario} text-red-600 border-red-200`} onClick={() => excluir(c.id)}>
                              <Trash2 size={14} /> Confirmar exclusão
                            </button>
                          ) : (
                            <button type="button" className={btnSecundario} onClick={() => setConfirmandoExclusao(c.id)}>
                              <Trash2 size={14} /> Excluir
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {modalAberto && <NovoComunicadoModal onFechar={() => setParams({})} onPublicar={publicar} />}
    </div>
  );
}
