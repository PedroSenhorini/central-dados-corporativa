import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import Sidebar, { NAV_GROUPS } from '../shared/components/Sidebar.js';
import CommandPalette from '../shared/components/CommandPalette.js';
import Pill from '../shared/components/Pill.js';
import Inicio from '../features/inicio/pages/InicioPage.js';
import Mural from '../features/mural/pages/MuralPage.js';
import Pessoas from '../features/pessoas/pages/PessoasPage.js';
import Documentos from '../features/documentos/pages/DocumentosPage.js';
import SolicitacoesRh from '../features/solicitacoes-rh/pages/SolicitacoesRhPage.js';
import ChamadosTi from '../features/chamados-ti/pages/ChamadosTiPage.js';
import AnaliseDados from '../features/analise-dados/pages/AnaliseDadosPage.js';
import AutomacaoRH from '../features/automacao-rh/pages/AutomacaoRhPage.js';
import VagasRh from '../features/vagas-rh/pages/VagasRhPage.js';
import DesligamentoRH from '../features/desligamento-rh/pages/DesligamentoRhPage.js';
import Compras from '../features/compras/pages/ComprasPage.js';
import VisitasTecnicas from '../features/visitas-tecnicas/pages/VisitasTecnicasPage.js';
import Usuarios from '../features/usuarios/pages/UsuariosPage.js';
import LoginPage from '../features/auth/pages/LoginPage.js';
import RegisterPage from '../features/auth/pages/RegisterPage.js';
import AssistantWidget from '../features/assistente/components/AssistantWidget.js';
import ProtectedRoute from './ProtectedRoute.js';
import RequireRole from './RequireRole.js';
import { useAuth } from '../shared/context/AuthContext.js';
import { usePendencias } from '../shared/hooks/usePendencias.js';
import { iniciais, tempoRelativo } from '../shared/utils/formatacao.js';

const PAGE_TITLES: Record<string, string> = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.itens).map((item) => [item.to, item.label])
);

function NotificacoesSino() {
  const { pathname } = useLocation();
  const { pendencias, recarregar } = usePendencias();
  const [aberto, setAberto] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);

  // Recalcula ao trocar de página: a ação pode ter resolvido uma pendência.
  useEffect(() => {
    setAberto(false);
    recarregar();
  }, [pathname, recarregar]);

  useEffect(() => {
    if (!aberto) return;
    const fecharFora = (e: MouseEvent) => {
      if (!caixaRef.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('mousedown', fecharFora);
    return () => document.removeEventListener('mousedown', fecharFora);
  }, [aberto]);

  return (
    <div className="relative" ref={caixaRef}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        title="Notificações"
        aria-label={`Notificações${pendencias.length ? ` (${pendencias.length})` : ''}`}
        aria-expanded={aberto}
        className="relative p-1.5 rounded-md text-muted hover:text-ink2 hover:bg-surface transition-colors"
      >
        <Bell size={17} />
        {pendencias.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-canvas" />
        )}
      </button>
      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden">
          <p className="px-4 py-3 border-b border-border text-[13px] font-semibold text-ink2">Notificações</p>
          {pendencias.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted">Tudo em dia por aqui.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto scroll-slim divide-y divide-border">
              {pendencias.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link to={p.rota} className="flex items-start gap-2.5 px-4 py-3 hover:bg-canvas transition-colors">
                    <Pill tom={p.tom}>{p.modulo}</Pill>
                    <span className="min-w-0">
                      <span className="block text-[13px] text-ink2 truncate">{p.titulo}</span>
                      <span className="block text-[12px] text-muted">{tempoRelativo(p.criadoEm)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Header() {
  const { pathname } = useLocation();
  const { profile, user, signOut } = useAuth();
  const nomeExibido = profile?.nome || user?.email || '';

  return (
    <header className="h-14 bg-canvas/80 backdrop-blur border-b border-border flex items-center gap-4 px-4 sm:px-8 sticky top-0 z-10">
      <p className="text-[13px] text-muted shrink-0 hidden md:block">
        Central de Dados <span className="mx-1.5 text-muted/40">/</span>{' '}
        <span className="text-ink2 font-medium">{PAGE_TITLES[pathname] ?? 'Painel'}</span>
      </p>

      <CommandPalette />

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <NotificacoesSino />
        <div
          className="w-7 h-7 rounded-full bg-ink2 text-white flex items-center justify-center text-[11px] font-semibold"
          title={nomeExibido}
        >
          {iniciais(nomeExibido)}
        </div>
        <button
          type="button"
          onClick={signOut}
          title="Sair"
          aria-label="Sair"
          className="p-1.5 rounded-md text-muted hover:text-ink2 hover:bg-surface transition-colors"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

function PainelPrincipal() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/mural" element={<Mural />} />
            <Route path="/pessoas" element={<Pessoas />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/solicitacoes-rh" element={<SolicitacoesRh />} />
            <Route path="/chamados-ti" element={<ChamadosTi />} />
            <Route path="/analise-dados" element={<AnaliseDados />} />
            <Route
              path="/automacao-rh"
              element={
                <RequireRole modulo="automacao-rh">
                  <AutomacaoRH />
                </RequireRole>
              }
            />
            <Route path="/vagas-rh" element={<VagasRh />} />
            <Route path="/compras" element={<Compras />} />
            <Route
              path="/visitas-tecnicas"
              element={
                <RequireRole modulo="visitas-tecnicas">
                  <VisitasTecnicas />
                </RequireRole>
              }
            />
            <Route
              path="/desligamento-rh"
              element={
                <RequireRole modulo="desligamento-rh">
                  <DesligamentoRH />
                </RequireRole>
              }
            />
            <Route
              path="/usuarios"
              element={
                <RequireRole modulo="usuarios">
                  <Usuarios />
                </RequireRole>
              }
            />
            <Route path="*" element={<Navigate to="/inicio" replace />} />
          </Routes>
        </main>
      </div>
      <AssistantWidget />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<PainelPrincipal />} />
      </Route>
    </Routes>
  );
}
