import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { UserPlus, AlertCircle, MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import { AREAS_DASHBOARD } from '../../analise-dados/data/dashboards.js';

const inputClass =
  'rounded-lg border border-border px-3 py-2 text-sm text-ink2 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

export default function RegisterPage() {
  const { signUp, isAuthenticated } = useAuth();

  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cargo, setCargo] = useState('');
  const [papel, setPapel] = useState(AREAS_DASHBOARD[0].id);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/analise-dados" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const resultado = await signUp({
      email: email.trim(),
      password: senha,
      nome: nome.trim(),
      empresa: empresa.trim(),
      cargo: cargo.trim(),
      papel,
    });
    setEnviando(false);

    if (!resultado.ok) {
      setErro(resultado.mensagem);
      return;
    }
    if (resultado.precisaConfirmarEmail) {
      setConfirmarEmail(true);
    }
  };

  if (confirmarEmail) {
    return (
      <AuthLayout titulo="Quase lá!">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-soft text-primary">
            <MailCheck size={22} />
          </span>
          <p className="text-sm text-muted">
            Enviamos um link de confirmação para <span className="text-ink2 font-medium">{email}</span>.
            Confirme seu e-mail e volte para entrar.
          </p>
          <Link to="/login" className="text-primary font-medium text-sm hover:text-primary-hover">
            Voltar para o login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout titulo="Crie sua conta" subtitulo="Leva menos de um minuto — e é grátis.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nome" className="text-[13px] font-medium text-ink2">
            Nome completo
          </label>
          <input
            id="nome"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Maria Fernanda Costa"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="empresa" className="text-[13px] font-medium text-ink2">
              Empresa
            </label>
            <input
              id="empresa"
              type="text"
              required
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Nome da empresa"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cargo" className="text-[13px] font-medium text-ink2">
              Cargo <span className="text-muted font-normal">(opcional)</span>
            </label>
            <input
              id="cargo"
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex.: Gerente"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="papel" className="text-[13px] font-medium text-ink2">
            Área de acesso
          </label>
          <select
            id="papel"
            value={papel}
            onChange={(e) => setPapel(e.target.value)}
            className={`${inputClass} bg-white`}
          >
            {AREAS_DASHBOARD.map((area) => (
              <option key={area.id} value={area.id}>
                {area.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted">
            Define quais módulos você vê na plataforma (ex.: só RH acessa a Automação de RH).
          </p>
        </div>

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
            className={inputClass}
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
            minLength={6}
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Pelo menos 6 caracteres"
            className={inputClass}
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
          <UserPlus size={16} />
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Já tem conta?{' '}
        <Link to="/login" className="text-primary font-medium hover:text-primary-hover">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
