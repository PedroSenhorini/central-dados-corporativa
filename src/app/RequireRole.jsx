import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext.jsx';
import { temAcessoAoModulo } from '../shared/utils/permissoes.js';

export default function RequireRole({ modulo, children }) {
  const { profile } = useAuth();

  if (temAcessoAoModulo(profile?.papel, modulo)) {
    return children;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-24">
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 text-warning">
        <ShieldAlert size={22} />
      </span>
      <p className="font-display font-semibold text-ink2">Acesso restrito</p>
      <p className="text-sm text-muted max-w-sm">
        Esse módulo não faz parte da sua área de acesso. Se você precisa dele, peça para um
        administrador atualizar seu perfil.
      </p>
    </div>
  );
}
