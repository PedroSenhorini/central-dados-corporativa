import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, Search, Users } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/client.js';
import PageHeader from '../../../shared/components/PageHeader.js';
import Tabs from '../../../shared/components/Tabs.js';
import { inputClass, painelClass } from '../../../shared/styles/classes.js';
import { iniciais } from '../../../shared/utils/formatacao.js';
import { AREAS_DASHBOARD } from '../../analise-dados/data/dashboards.js';
import type { Papel, ProfileRow } from '../../../shared/types/database.js';

type Colega = Pick<ProfileRow, 'id' | 'nome' | 'cargo' | 'papel' | 'empresa'>;

const NOME_AREA: Record<string, string> = Object.fromEntries(AREAS_DASHBOARD.map((a) => [a.id, a.label]));
NOME_AREA.admin = 'Administração';

export default function PessoasPage() {
  const [colegas, setColegas] = useState<Colega[]>([]);
  const [busca, setBusca] = useState('');
  const [area, setArea] = useState<Papel | 'todas'>('todas');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, nome, cargo, papel, empresa')
      .eq('ativo', true)
      .order('nome')
      .then(({ data, error }) => {
        if (error) setErro('Não foi possível carregar o diretório de pessoas.');
        else setColegas((data ?? []) as Colega[]);
        setCarregando(false);
      });
  }, []);

  const areasPresentes = useMemo(() => {
    const ids = Array.from(new Set(colegas.map((c) => c.papel)));
    return ids.sort((a, b) => (NOME_AREA[a] ?? a).localeCompare(NOME_AREA[b] ?? b));
  }, [colegas]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return colegas.filter(
      (c) =>
        (area === 'todas' || c.papel === area) &&
        (!termo || [c.nome, c.cargo ?? '', NOME_AREA[c.papel] ?? ''].join(' ').toLowerCase().includes(termo))
    );
  }, [colegas, busca, area]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Pessoas" descricao="Encontre colegas por nome, cargo ou área." />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            aria-label="Buscar pessoas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou cargo"
            className={`${inputClass} pl-9`}
          />
        </div>
        <Tabs
          rotulo="Área"
          valor={area}
          onChange={setArea}
          opcoes={[
            { id: 'todas', label: `Todas (${colegas.length})` },
            ...areasPresentes.map((id) => ({ id, label: NOME_AREA[id] ?? id })),
          ]}
        />
      </div>

      {erro && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 rounded-lg px-3 py-2.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />{erro}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 text-muted py-20"><Loader2 size={18} className="animate-spin" /> Carregando pessoas...</div>
      ) : visiveis.length === 0 ? (
        <div className={`${painelClass} p-10 flex flex-col items-center text-center gap-2`}>
          <Users size={20} className="text-muted" />
          <p className="text-sm text-muted">Ninguém encontrado com esse filtro.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {visiveis.map((c) => (
            <li key={c.id} className={`${painelClass} p-4 flex items-center gap-3`}>
              <span className="w-10 h-10 rounded-full bg-canvas ring-1 ring-border text-ink2 flex items-center justify-center text-[13px] font-semibold shrink-0">
                {iniciais(c.nome)}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-ink2 truncate">{c.nome}</span>
                <span className="block text-[12px] text-muted truncate">{c.cargo || 'Cargo não informado'}</span>
                <span className="block text-[12px] text-muted truncate">{NOME_AREA[c.papel] ?? c.papel}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
