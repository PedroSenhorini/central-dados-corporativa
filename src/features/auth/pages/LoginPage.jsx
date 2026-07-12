import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../../../shared/context/AuthContext.jsx';

export default function LoginPage() {
  const { signIn, isAuthenticated } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  if (isAuthenticated) {
    return <Navigate to={location.state?.from ?? '/analise-dados'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const resultado = await signIn(email.trim(), senha);
    setEnviando(false);
    if (!resultado.ok) setErro(resultado.mensagem);
  };

  return (
    <AuthLayout titulo="Bem-vindo de volta" subtitulo="Entre para ver o painel da sua empresa.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-ink2">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            className="rounded-lg border border-border px-3 py-2 text-sm text-ink2 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="senha" className="text-[13px] font-medium text-ink2">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className="rounded-lg border border-border px-3 py-2 text-sm text-ink2 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {erro && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 text-red-700 px-3 py-2.5 text-[13px]">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          <LogIn size={16} />
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Ainda não tem conta?{' '}
        <Link to="/registro" className="text-primary font-medium hover:text-primary-hover">
          Criar conta gratuita
        </Link>
      </p>
    </AuthLayout>
  );
}
