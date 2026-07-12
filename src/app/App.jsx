import { useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Search, Bell } from 'lucide-react';
import Sidebar, { NAV_GROUPS } from '../shared/components/Sidebar.jsx';
import AnaliseDados from '../features/analise-dados/pages/AnaliseDadosPage.jsx';
import AutomacaoRH from '../features/automacao-rh/pages/AutomacaoRhPage.jsx';
import Usuarios from '../features/usuarios/pages/UsuariosPage.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import AssistantWidget from '../features/assistente/components/AssistantWidget.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RequireRole from './RequireRole.jsx';
import { useAuth } from '../shared/context/AuthContext.jsx';

const PAGE_TITLES = {
  '/analise-dados': 'Análise de Dados',
  '/automacao-rh': 'Automação de RH',
  '/usuarios': 'Usuários',
};

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
}

function BuscaGlobal() {
  const navigate = useNavigate();
  const itens = useMemo(() => NAV_GROUPS.flatMap((g) => g.itens), []);
  const [termo, setTermo] = useState('');
  const [aberto, setAberto] = useState(false);

  const resultados = termo.trim()
    ? itens.filter((item) => item.label.toLowerCase().includes(termo.trim().toLowerCase()))
    : [];

  const irPara = (to) => {
    navigate(to);
    setTermo('');
    setAberto(false);
  };

  return (
    <div className="relative flex-1 max-w-sm">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      <input
        type="text"
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder="Buscar no painel..."
        className="w-full rounded-lg border border-border bg-canvas pl-9 pr-3 py-1.5 text-sm text-ink2 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
      {aberto && termo.trim() && (
        <div className="absolute top-full mt-1 w-full bg-surface border border-border rounded-lg shadow-card overflow-hidden z-20">
          {resultados.length > 0 ? (
            resultados.map((item) => (
              <button
                key={item.to}
                type="button"
                onMouseDown={() => irPara(item.to)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink2 hover:bg-canvas transition-colors text-left"
              >
                <item.icon size={14} className="text-muted" />
                {item.label}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-[13px] text-muted">Nada encontrado para "{termo}".</p>
          )}
        </div>
      )}
    </div>
  );
}

function NotificacoesSino() {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        title="Notificações"
        aria-label="Notificações"
        className="p-1.5 rounded-md text-muted hover:text-ink2 hover:bg-canvas transition-colors"
      >
        <Bell size={17} />
      </button>
      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-card p-3 z-20">
          <p className="text-[13px] font-medium text-ink2 mb-1">Notificações</p>
          <p className="text-[12px] text-muted">Nenhuma notificação por enquanto.</p>
        </div>
      )}
    </div>
  );
}

function Header() {
  const { pathname } = useLocation();
  const { profile, user, signOut } = useAuth();
  const nomeExibido = profile?.nome || user?.email || '';
  const primeiroNome = nomeExibido.split(' ')[0];

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center gap-4 px-6 sticky top-0 z-10">
      <p className="text-sm text-muted shrink-0">
        Central de Dados <span className="mx-1.5 text-border">/</span>{' '}
        <span className="text-ink2 font-medium">{PAGE_TITLES[pathname] ?? 'Painel'}</span>
      </p>

      <BuscaGlobal />

      <div className="flex items-center gap-3 shrink-0 ml-auto">
        {primeiroNome && (
          <p className="text-sm text-muted hidden sm:block">
            Olá, <span className="text-ink2 font-medium">{primeiroNome}</span>
          </p>
        )}
        <NotificacoesSino />
        <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[13px] font-semibold">
          {iniciais(nomeExibido)}
        </div>
        <button
          type="button"
          onClick={signOut}
          title="Sair"
          aria-label="Sair"
          className="p-1.5 rounded-md text-muted hover:text-ink2 hover:bg-canvas transition-colors"
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
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/analise-dados" replace />} />
            <Route path="/analise-dados" element={<AnaliseDados />} />
            <Route
              path="/automacao-rh"
              element={
                <RequireRole modulo="automacao-rh">
                  <AutomacaoRH />
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
