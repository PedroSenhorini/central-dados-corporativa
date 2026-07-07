import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../shared/components/Sidebar.jsx';
import AnaliseDados from '../features/analise-dados/pages/AnaliseDadosPage.jsx';
import AutomacaoRH from '../features/automacao-rh/pages/AutomacaoRhPage.jsx';

const PAGE_TITLES = {
  '/analise-dados': 'Análise de Dados',
  '/automacao-rh': 'Automação de RH',
};

function Header() {
  const { pathname } = useLocation();
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <p className="text-sm text-muted">
        Central de Dados <span className="mx-1.5 text-border">/</span>{' '}
        <span className="text-ink2 font-medium">{PAGE_TITLES[pathname] ?? 'Painel'}</span>
      </p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[13px] font-semibold">
          LP
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/analise-dados" replace />} />
            <Route path="/analise-dados" element={<AnaliseDados />} />
            <Route path="/automacao-rh" element={<AutomacaoRH />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
