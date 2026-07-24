/**
 * Tipos escritos à mão a partir de supabase/schema.sql — não há projeto
 * Supabase CLI vinculado neste repo (sem supabase/config.toml), então não
 * dá pra rodar `supabase gen types typescript`. Ao alterar o schema.sql,
 * atualize este arquivo junto.
 */

export type Papel = 'geral' | 'pcp' | 'sac' | 'vendas' | 'compras' | 'ti' | 'rh' | 'marketing' | 'admin';

export type PrioridadeVaga = 'baixa' | 'media' | 'alta';
export type StatusVaga = 'aberta' | 'triagem' | 'entrevistas' | 'proposta' | 'contratada' | 'cancelada';

export type CategoriaCompra = 'equipamento' | 'material' | 'software' | 'servico' | 'outro';
export type UrgenciaCompra = 'baixa' | 'media' | 'alta' | 'critica';
export type StatusCompra = 'solicitado' | 'em_cotacao' | 'aprovado' | 'comprado' | 'recusado';

/**
 * `type` (não `interface`) de propósito: interfaces não satisfazem o
 * `Record<string, unknown>` que o supabase-js exige em `GenericTable['Row']`
 * — mesmo motivo pelo qual `supabase gen types typescript` sempre gera
 * `type`, nunca `interface`, para as linhas de tabela.
 */
export type ProfileRow = {
  id: string;
  nome: string;
  empresa: string;
  cargo: string | null;
  papel: Papel;
  ativo: boolean;
  data_desligamento: string | null;
  created_at: string;
};

export type VagaRhRow = {
  id: string;
  titulo: string;
  setor_area: string;
  gestor_solicitante_id: string | null;
  responsavel_rh_id: string | null;
  prioridade: PrioridadeVaga;
  status: StatusVaga;
  data_abertura: string;
  prazo_sla_dias: number;
  data_fechamento: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type SolicitacaoCompraRow = {
  id: string;
  item: string;
  categoria: CategoriaCompra;
  descricao: string | null;
  quantidade: number;
  valor_estimado: number | null;
  urgencia: UrgenciaCompra;
  justificativa: string | null;
  fornecedor_sugerido: string | null;
  data_necessidade: string | null;
  status: StatusCompra;
  solicitante_id: string | null;
  responsavel_compras_id: string | null;
  created_at: string;
  updated_at: string;
};

type TableDef<Row, Insert, Update> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<
        ProfileRow,
        Omit<ProfileRow, 'created_at' | 'papel' | 'ativo'> & { papel?: Papel; ativo?: boolean },
        Partial<Omit<ProfileRow, 'id'>>
      >;
      vagas_rh: TableDef<
        VagaRhRow,
        Omit<VagaRhRow, 'id' | 'created_at' | 'updated_at' | 'status' | 'prioridade' | 'data_abertura' | 'data_fechamento' | 'observacoes'> &
          Partial<Pick<VagaRhRow, 'status' | 'prioridade' | 'data_abertura' | 'data_fechamento' | 'observacoes'>>,
        Partial<Omit<VagaRhRow, 'id'>>
      >;
      solicitacoes_compra: TableDef<
        SolicitacaoCompraRow,
        Omit<SolicitacaoCompraRow, 'id' | 'created_at' | 'updated_at' | 'status' | 'categoria' | 'urgencia' | 'quantidade' | 'responsavel_compras_id'> &
          Partial<Pick<SolicitacaoCompraRow, 'status' | 'categoria' | 'urgencia' | 'quantidade' | 'responsavel_compras_id'>>,
        Partial<Omit<SolicitacaoCompraRow, 'id'>>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Perfil embutido por um select com join (`profiles!fk(nome)`). */
export interface PerfilResumo {
  nome: string;
}

export type VagaComRelacoes = VagaRhRow & {
  gestor: PerfilResumo | null;
  responsavel: PerfilResumo | null;
};

export type SolicitacaoComRelacoes = SolicitacaoCompraRow & {
  solicitante: PerfilResumo | null;
};
