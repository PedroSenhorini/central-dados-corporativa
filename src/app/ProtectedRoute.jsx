import { Navigate, Outlet } from 'react-router-dom';
import { Loader2, DatabaseZap } from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext.jsx';

function TelaCentral({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-6">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">{children}</div>
    </div>
  );
}

export default function ProtectedRoute() {
  const { configured, loading, isAuthenticated } = useAuth();

  if (!configured) {
    return (
      <TelaCentral>
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 text-warning">
          <DatabaseZap size={22} />
        </span>
        <p className="font-display font-semibold text-ink2">Login ainda não configurado</p>
        <p className="text-sm text-muted">
          Crie um projeto gratuito no Supabase e preencha <code>VITE_SUPABASE_URL</code> e{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env</code> (veja{' '}
          <code>.env.example</code> e o README) para liberar o acesso.
        </p>
      </TelaCentral>
    );
  }

  if (loading) {
    return (
      <TelaCentral>
        <Loader2 size={24} className="animate-spin text-primary" />
        <p className="text-sm text-muted">Carregando seu painel...</p>
      </TelaCentral>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
