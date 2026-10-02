import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headset, Palmtree, Search, ShoppingCart, User, type LucideIcon } from 'lucide-react';
import { supabase } from '../lib/supabase/client.js';
import { useAuth } from '../context/AuthContext.js';
import { temAcessoAoModulo } from '../utils/permissoes.js';
import { NAV_GROUPS } from './Sidebar.js';

interface Opcao {
  secao: 'Ações' | 'Módulos' | 'Pessoas';
  label: string;
  detalhe?: string;
  icon: LucideIcon;
  rota: string;
}

const ACOES: Opcao[] = [
  { secao: 'Ações', label: 'Pedir férias', icon: Palmtree, rota: '/solicitacoes-rh?novo=1' },
  { secao: 'Ações', label: 'Abrir chamado de TI', icon: Headset, rota: '/chamados-ti?novo=1' },
  { secao: 'Ações', label: 'Nova solicitação de compra', icon: ShoppingCart, rota: '/compras' },
];

/** Busca rápida estilo Ctrl+K: módulos, ações frequentes e pessoas. */
export default function CommandPalette() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState('');
  const [selecionado, setSelecionado] = useState(0);
  const [pessoas, setPessoas] = useState<{ nome: string; cargo: string | null }[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAberto((v) => !v);
      }
    };
    window.addEventListener('keydown', atalho);
    return () => window.removeEventListener('keydown', atalho);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    setTermo('');
    setSelecionado(0);
    requestAnimationFrame(() => inputRef.current?.focus());
    if (pessoas === null) {
      supabase
        .from('profiles')
        .select('nome, cargo')
        .eq('ativo', true)
        .order('nome')
        .then(({ data }) => setPessoas(data ?? []));
    }
  }, [aberto, pessoas]);

  const opcoes = useMemo(() => {
    const busca = termo.trim().toLowerCase();
    const casa = (texto: string) => !busca || texto.toLowerCase().includes(busca);
    const modulos: Opcao[] = NAV_GROUPS.flatMap((g) => g.itens)
      .filter((item) => temAcessoAoModulo(profile?.papel, item.modulo))
      .map((item) => ({ secao: 'Módulos', label: item.label, detalhe: item.description, icon: item.icon, rota: item.to }));
    const gente: Opcao[] = busca
      ? (pessoas ?? [])
          .filter((p) => casa(`${p.nome} ${p.cargo ?? ''}`))
          .slice(0, 5)
          .map((p) => ({ secao: 'Pessoas', label: p.nome, detalhe: p.cargo ?? undefined, icon: User, rota: '/pessoas' }))
      : [];
    return [...ACOES.filter((a) => casa(a.label)), ...modulos.filter((m) => casa(`${m.label} ${m.detalhe}`)), ...gente].slice(0, 12);
  }, [termo, pessoas, profile?.papel]);

  const abrir = (opcao: Opcao | undefined) => {
    if (!opcao) return;
    setAberto(false);
    navigate(opcao.rota);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex-1 min-w-0 max-w-sm flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] text-muted hover:border-muted/40 transition-colors text-left"
      >
        <Search size={15} className="shrink-0" />
        <span className="flex-1 truncate">Buscar pessoas, módulos, ações...</span>
        <kbd className="hidden sm:inline text-[11px] rounded border border-border bg-canvas px-1.5 font-sans">Ctrl K</kbd>
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 bg-ink/30 flex justify-center items-start px-4 pt-[12vh]"
          onMouseDown={(e) => e.target === e.currentTarget && setAberto(false)}
        >
          <div role="dialog" aria-label="Busca rápida" className="w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
            <input
              ref={inputRef}
              value={termo}
              onChange={(e) => {
                setTermo(e.target.value);
                setSelecionado(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setAberto(false);
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  const passo = e.key === 'ArrowDown' ? 1 : -1;
                  setSelecionado((s) => (s + passo + opcoes.length) % Math.max(opcoes.length, 1));
                }
                if (e.key === 'Enter') abrir(opcoes[selecionado]);
              }}
              placeholder="Digite um módulo, pessoa ou ação..."
              aria-label="Buscar"
              className="w-full border-b border-border bg-transparent px-4 py-3.5 text-[15px] text-ink2 placeholder:text-muted/70 focus:outline-none"
            />
            <div className="max-h-[50vh] overflow-y-auto scroll-slim py-1">
              {opcoes.length === 0 && <p className="px-4 py-6 text-center text-[13px] text-muted">Nada encontrado para "{termo}".</p>}
              {opcoes.map((opcao, i) => {
                const novaSecao = i === 0 || opcoes[i - 1]?.secao !== opcao.secao;
                return (
                  <div key={`${opcao.secao}-${opcao.label}-${i}`}>
                    {novaSecao && <p className="px-4 pt-2.5 pb-1 text-[11px] font-medium text-muted">{opcao.secao}</p>}
                    <button
                      type="button"
                      onMouseEnter={() => setSelecionado(i)}
                      onClick={() => abrir(opcao)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-left text-[13px] text-ink2 ${i === selecionado ? 'bg-canvas' : ''}`}
                    >
                      <opcao.icon size={15} className="text-muted shrink-0" />
                      <span className="truncate">{opcao.label}</span>
                      {opcao.detalhe && <span className="ml-auto text-[12px] text-muted truncate">{opcao.detalhe}</span>}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 border-t border-border px-4 py-2 text-[11px] text-muted">
              <span>↑↓ navegar</span>
              <span>Enter abrir</span>
              <span>Esc fechar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
