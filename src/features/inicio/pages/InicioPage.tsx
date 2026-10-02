import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Cake, Headset, Megaphone, Palmtree, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client.js';
import { useAuth } from '../../../shared/context/AuthContext.js';
import { usePendencias } from '../../../shared/hooks/usePendencias.js';
import Pill from '../../../shared/components/Pill.js';
import { btnPrimario, btnSecundario, painelClass } from '../../../shared/styles/classes.js';
import { podePublicarComunicado } from '../../../shared/utils/permissoes.js';
import { formatarDataCurta, iniciais, tempoRelativo } from '../../../shared/utils/formatacao.js';
import type { ComunicadoComAutor, ProfileRow } from '../../../shared/types/database.js';

type Colega = Pick<ProfileRow, 'id' | 'nome' | 'cargo' | 'papel' | 'created_at' | 'data_nascimento'>;

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function aniversarioEsteMes(dataNascimento: string | null): boolean {
  if (!dataNascimento) return false;
  return Number(dataNascimento.slice(5, 7)) === new Date().getMonth() + 1;
}

export default function InicioPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { pendencias, naoLidos, carregando } = usePendencias();
  const [fixado, setFixado] = useState<ComunicadoComAutor | null>(null);
  const [colegas, setColegas] = useState<Colega[]>([]);

  useEffect(() => {
    supabase
      .from('comunicados')
      .select('*, autor:profiles!comunicados_autor_id_fkey(nome)')
      .order('fixado', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => setFixado(((data ?? [])[0] as unknown as ComunicadoComAutor) ?? null));

    supabase
      .from('profiles')
      .select('id, nome, cargo, papel, created_at, data_nascimento')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => setColegas((data ?? []) as Colega[]));
  }, []);

  const destaquesPessoas = useMemo(() => {
    const trintaDias = Date.now() - 30 * 86400000;
    const aniversariantes = colegas
      .filter((c) => aniversarioEsteMes(c.data_nascimento))
      .map((c) => ({ ...c, motivo: `Aniversário em ${formatarDataCurta(c.data_nascimento)}`, novo: false }));
    const novos = colegas
      .filter((c) => c.id !== user?.id && new Date(c.created_at).getTime() >= trintaDias)
      .map((c) => ({ ...c, motivo: `Chegou ${tempoRelativo(c.created_at)}`, novo: true }));
    return [...aniversariantes, ...novos].slice(0, 5);
  }, [colegas, user?.id]);

  const primeiroNome = (profile?.nome || user?.email || '').split(' ')[0];
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const acoesPendentes = pendencias.filter((p) => p.modulo !== 'Mural').length;

  const resumo = [
    { label: 'Aguardando você', valor: acoesPendentes, detalhe: 'aprovações e atendimentos' },
    { label: 'Comunicados não lidos', valor: naoLidos, detalhe: 'no mural da empresa' },
    { label: 'Colegas na Central', valor: colegas.length, detalhe: 'colaboradores ativos' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink2">
            {saudacao()}
            {primeiroNome && `, ${primeiroNome}`}
          </h1>
          <p className="text-sm text-muted mt-1 first-letter:uppercase">
            {hoje}
            {!carregando && acoesPendentes > 0 && ` · ${acoesPendentes} ${acoesPendentes === 1 ? 'item aguarda' : 'itens aguardam'} sua ação`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnSecundario} onClick={() => navigate('/solicitacoes-rh?novo=1')}>
            <Palmtree size={14} /> Pedir férias
          </button>
          <button type="button" className={btnSecundario} onClick={() => navigate('/chamados-ti?novo=1')}>
            <Headset size={14} /> Abrir chamado
          </button>
          <button type="button" className={btnPrimario} onClick={() => navigate('/compras')}>
            <ShoppingCart size={14} /> Nova compra
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {resumo.map((item) => (
          <div key={item.label} className={`${painelClass} p-4 flex flex-col gap-2`}>
            <p className="text-[12px] font-medium text-muted">{item.label}</p>
            <p className="text-[28px] leading-none font-semibold tracking-tight text-ink2 tabular-nums">
              {carregando ? '–' : item.valor}
            </p>
            <p className="text-[12px] text-muted">{item.detalhe}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-4 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <section className={painelClass}>
            <header className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <h2 className="text-[13px] font-semibold text-ink2">
                {fixado?.fixado ? 'Comunicado fixado' : 'Último comunicado'}
              </h2>
              <Link to="/mural" className="text-[12px] text-muted hover:text-ink2">
                Ver mural
              </Link>
            </header>
            {fixado ? (
              <div className="p-4 flex flex-col gap-2">
                <p className="text-[12px] text-muted">
                  {fixado.autor?.nome ?? 'Comunicação'} · {tempoRelativo(fixado.created_at)}
                </p>
                <h3 className="text-[15px] font-semibold text-ink2">{fixado.titulo}</h3>
                <p className="text-sm text-muted leading-relaxed line-clamp-3 max-w-[68ch] whitespace-pre-line">
                  {fixado.corpo}
                </p>
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center text-center gap-2">
                <Megaphone size={18} className="text-muted" />
                <p className="text-sm text-muted">Nenhum comunicado publicado ainda.</p>
              </div>
            )}
          </section>

          <section className={painelClass}>
            <header className="px-4 py-3.5 border-b border-border">
              <h2 className="text-[13px] font-semibold text-ink2">Aguardando sua ação</h2>
            </header>
            {pendencias.length === 0 ? (
              <div className="p-6 flex flex-col items-center text-center gap-2">
                <Sparkles size={18} className="text-muted" />
                <p className="text-sm text-muted">
                  {carregando ? 'Carregando...' : 'Tudo em dia. Nada aguardando você agora.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {pendencias.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link to={p.rota} className="flex items-center gap-3 px-4 py-3 hover:bg-canvas transition-colors">
                      <Pill tom={p.tom}>{p.modulo}</Pill>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-ink2 truncate">{p.titulo}</span>
                        <span className="block text-[12px] text-muted truncate">{p.detalhe}</span>
                      </span>
                      <span className="text-[12px] text-muted whitespace-nowrap">{tempoRelativo(p.criadoEm)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <section className={painelClass}>
            <header className="px-4 py-3.5 border-b border-border">
              <h2 className="text-[13px] font-semibold text-ink2">Acesso rápido</h2>
            </header>
            <ul className="divide-y divide-border">
              {[
                { to: '/documentos', label: 'Documentos da empresa' },
                { to: '/pessoas', label: 'Encontrar um colega' },
                { to: '/analise-dados', label: 'Dashboards e indicadores' },
                { to: '/solicitacoes-rh', label: 'Meus pedidos ao RH' },
              ].map((atalho) => (
                <li key={atalho.to}>
                  <Link
                    to={atalho.to}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px] text-ink2 hover:bg-canvas transition-colors"
                  >
                    {atalho.label}
                    <ArrowRight size={14} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={painelClass}>
            <header className="px-4 py-3.5 border-b border-border">
              <h2 className="text-[13px] font-semibold text-ink2">Aniversariantes e novos colegas</h2>
            </header>
            {destaquesPessoas.length === 0 ? (
              <div className="p-6 flex flex-col items-center text-center gap-2">
                <Cake size={18} className="text-muted" />
                <p className="text-sm text-muted">Nenhum aniversário ou chegada recente.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {destaquesPessoas.map((c) => (
                  <li key={`${c.id}-${c.motivo}`} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-8 h-8 rounded-full bg-canvas ring-1 ring-border text-ink2 flex items-center justify-center text-[11px] font-semibold shrink-0">
                      {iniciais(c.nome)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium text-ink2 truncate">{c.nome}</span>
                      <span className="block text-[12px] text-muted truncate">{c.motivo}</span>
                    </span>
                    {c.novo && <Pill tom="verde">Novo</Pill>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {podePublicarComunicado(profile?.papel) && (
          <Link
            to="/mural?novo=1"
            className={`${painelClass} p-4 flex items-center gap-3 hover:bg-canvas transition-colors`}
          >
            <span className="w-8 h-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Plus size={16} />
            </span>
            <span className="text-[13px] text-ink2">
              Tem uma novidade para a empresa? <span className="text-muted">Publique no mural.</span>
            </span>
          </Link>
          )}
        </div>
      </div>
    </div>
  );
}
