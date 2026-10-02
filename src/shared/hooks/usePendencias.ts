import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase/client.js';
import { useAuth } from '../context/AuthContext.js';
import type { TomPill } from '../components/Pill.js';

export interface Pendencia {
  id: string;
  modulo: string;
  tom: TomPill;
  titulo: string;
  detalhe: string;
  rota: string;
  criadoEm: string;
}

const TIPO_RH: Record<string, string> = {
  ferias: 'Férias',
  declaracao: 'Declaração',
  atualizacao_cadastral: 'Atualização cadastral',
  outro: 'Pedido ao RH',
};

/**
 * Itens que pedem ação do usuário logado: comunicados não lidos e, conforme
 * a área, filas de aprovação (Compras, RH, TI). Cada consulta falha em
 * silêncio para a tela continuar funcionando antes da migration ser aplicada.
 */
export function usePendencias() {
  const { user, profile } = useAuth();
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [naoLidos, setNaoLidos] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const papel = profile?.papel;

  const carregar = useCallback(async () => {
    if (!supabaseConfigured || !user) {
      setCarregando(false);
      return;
    }
    const gerencia = (...papeis: string[]) => papel === 'admin' || (papel !== undefined && papeis.includes(papel));
    const itens: Pendencia[] = [];

    const [comunicados, leituras] = await Promise.all([
      supabase.from('comunicados').select('id, titulo, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('comunicados_leituras').select('comunicado_id').eq('user_id', user.id),
    ]);
    if (!comunicados.error && !leituras.error) {
      const lidos = new Set((leituras.data ?? []).map((l) => l.comunicado_id));
      const pendentes = (comunicados.data ?? []).filter((c) => !lidos.has(c.id));
      setNaoLidos(pendentes.length);
      pendentes.slice(0, 3).forEach((c) =>
        itens.push({
          id: `comunicado-${c.id}`,
          modulo: 'Mural',
          tom: 'neutro',
          titulo: c.titulo,
          detalhe: 'Comunicado não lido',
          rota: '/mural',
          criadoEm: c.created_at,
        })
      );
    }

    if (gerencia('compras')) {
      const { data } = await supabase
        .from('solicitacoes_compra')
        .select('id, item, urgencia, created_at, solicitante:profiles!solicitacoes_compra_solicitante_id_fkey(nome)')
        .eq('status', 'solicitado')
        .order('created_at', { ascending: true })
        .limit(10);
      (data ?? []).forEach((s) => {
        const solicitante = (s.solicitante as unknown as { nome: string } | null)?.nome ?? 'Colaborador';
        itens.push({
          id: `compra-${s.id}`,
          modulo: 'Compras',
          tom: 'azul',
          titulo: s.item,
          detalhe: `${solicitante} · urgência ${s.urgencia}`,
          rota: '/compras',
          criadoEm: s.created_at,
        });
      });
    }

    if (gerencia('rh')) {
      const { data } = await supabase
        .from('solicitacoes_rh')
        .select('id, tipo, created_at, solicitante:profiles!solicitacoes_rh_solicitante_id_fkey(nome)')
        .eq('status', 'pendente')
        .order('created_at', { ascending: true })
        .limit(10);
      (data ?? []).forEach((s) => {
        const solicitante = (s.solicitante as unknown as { nome: string } | null)?.nome ?? 'Colaborador';
        itens.push({
          id: `rh-${s.id}`,
          modulo: 'RH',
          tom: 'ambar',
          titulo: `${TIPO_RH[s.tipo] ?? 'Pedido'} de ${solicitante}`,
          detalhe: 'Aguardando resposta do RH',
          rota: '/solicitacoes-rh',
          criadoEm: s.created_at,
        });
      });
    }

    if (gerencia('ti')) {
      const { data } = await supabase
        .from('chamados_ti')
        .select('id, titulo, prioridade, created_at, solicitante:profiles!chamados_ti_solicitante_id_fkey(nome)')
        .eq('status', 'aberto')
        .order('created_at', { ascending: true })
        .limit(10);
      (data ?? []).forEach((c) => {
        const solicitante = (c.solicitante as unknown as { nome: string } | null)?.nome ?? 'Colaborador';
        itens.push({
          id: `chamado-${c.id}`,
          modulo: 'TI',
          tom: c.prioridade === 'alta' ? 'vermelho' : 'neutro',
          titulo: c.titulo,
          detalhe: `${solicitante} · prioridade ${c.prioridade}`,
          rota: '/chamados-ti',
          criadoEm: c.created_at,
        });
      });
    }

    itens.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    setPendencias(itens);
    setCarregando(false);
  }, [user, papel]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { pendencias, naoLidos, carregando, recarregar: carregar };
}
