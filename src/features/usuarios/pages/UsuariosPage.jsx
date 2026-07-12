import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client.js';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import { AREAS_DASHBOARD } from '../../analise-dados/data/dashboards.js';

const PAPEIS = [...AREAS_DASHBOARD.map((a) => ({ id: a.id, label: a.label })), { id: 'admin', label: 'Admin' }];

export default function UsuariosPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvandoId, setSalvandoId] = useState(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, nome, empresa, cargo, papel, created_at')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setErro(
            'Não foi possível carregar a lista de usuários. Confirme se você rodou a versão mais recente do supabase/schema.sql (ela adiciona as permissões de admin).'
          );
        } else {
          setUsuarios(data);
        }
        setCarregando(false);
      });
  }, []);

  const trocarPapel = async (id, novoPapel) => {
    setSalvandoId(id);
    const { error } = await supabase.from('profiles').update({ papel: novoPapel }).eq('id', id);
    if (!error) {
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, papel: novoPapel } : u)));
    }
    setSalvandoId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink2">Usuários</h1>
        <p className="text-sm text-muted mt-0.5">
          Gerencie a área de acesso de cada pessoa da empresa.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        {carregando ? (
          <div className="flex items-center justify-center gap-2 text-muted py-16">
            <Loader2 size={18} className="animate-spin" />
            Carregando usuários...
          </div>
        ) : erro ? (
          <div className="flex items-start gap-2 text-red-700 bg-red-50 m-5 rounded-lg px-3 py-2.5 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {erro}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 font-medium">Cargo</th>
                <th className="px-5 py-3 font-medium">Área de acesso</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-ink2 font-medium">{u.nome}</td>
                  <td className="px-5 py-3 text-muted">{u.empresa}</td>
                  <td className="px-5 py-3 text-muted">{u.cargo || '—'}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.papel}
                      disabled={u.id === user?.id || salvandoId === u.id}
                      onChange={(e) => trocarPapel(u.id, e.target.value)}
                      title={u.id === user?.id ? 'Você não pode alterar seu próprio papel por aqui.' : undefined}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-ink2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-canvas disabled:text-muted"
                    >
                      {PAPEIS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
