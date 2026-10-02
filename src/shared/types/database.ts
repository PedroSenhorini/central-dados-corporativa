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

export type CategoriaComunicado = 'geral' | 'diretoria' | 'rh' | 'ti' | 'eventos';
export type TipoSolicitacaoRh = 'ferias' | 'declaracao' | 'atualizacao_cadastral' | 'outro';
export type StatusSolicitacaoRh = 'pendente' | 'aprovada' | 'recusada' | 'concluida';
export type CategoriaChamado = 'equipamento' | 'acesso' | 'sistema' | 'rede' | 'outro';
export type PrioridadeChamado = 'baixa' | 'media' | 'alta';
export type StatusChamado = 'aberto' | 'em_atendimento' | 'aguardando_usuario' | 'resolvido';
export type CategoriaDocumento = 'politica' | 'manual' | 'procedimento' | 'modelo' | 'outro';

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
  data_nascimento: string | null;
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

export type ComunicadoRow = {
  id: string;
  titulo: string;
  corpo: string;
  categoria: CategoriaComunicado;
  fixado: boolean;
  autor_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ComunicadoLeituraRow = {
  comunicado_id: string;
  user_id: string;
  lido_em: string;
};

export type SolicitacaoRhRow = {
  id: string;
  tipo: TipoSolicitacaoRh;
  descricao: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  status: StatusSolicitacaoRh;
  resposta: string | null;
  solicitante_id: string | null;
  responsavel_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ChamadoTiRow = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  solicitante_id: string | null;
  responsavel_id: string | null;
  resolvido_em: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentoRow = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: CategoriaDocumento;
  arquivo_path: string;
  arquivo_nome: string;
  tamanho_bytes: number | null;
  autor_id: string | null;
  created_at: string;
};

type TableDef<Row, Insert, Update> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<
        ProfileRow,
        Omit<ProfileRow, 'created_at' | 'papel' | 'ativo' | 'data_nascimento'> & { papel?: Papel; ativo?: boolean; data_nascimento?: string | null },
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
      comunicados: TableDef<
        ComunicadoRow,
        Pick<ComunicadoRow, 'titulo' | 'corpo' | 'autor_id'> & Partial<Pick<ComunicadoRow, 'categoria' | 'fixado'>>,
        Partial<Omit<ComunicadoRow, 'id' | 'created_at'>>
      >;
      comunicados_leituras: TableDef<
        ComunicadoLeituraRow,
        Pick<ComunicadoLeituraRow, 'comunicado_id' | 'user_id'>,
        never
      >;
      solicitacoes_rh: TableDef<
        SolicitacaoRhRow,
        Pick<SolicitacaoRhRow, 'tipo' | 'solicitante_id'> &
          Partial<Pick<SolicitacaoRhRow, 'descricao' | 'data_inicio' | 'data_fim'>>,
        Partial<Pick<SolicitacaoRhRow, 'status' | 'resposta' | 'responsavel_id'>>
      >;
      chamados_ti: TableDef<
        ChamadoTiRow,
        Pick<ChamadoTiRow, 'titulo' | 'solicitante_id'> &
          Partial<Pick<ChamadoTiRow, 'descricao' | 'categoria' | 'prioridade'>>,
        Partial<Pick<ChamadoTiRow, 'status' | 'responsavel_id' | 'resolvido_em' | 'prioridade'>>
      >;
      documentos: TableDef<
        DocumentoRow,
        Omit<DocumentoRow, 'id' | 'created_at' | 'categoria' | 'descricao' | 'tamanho_bytes'> &
          Partial<Pick<DocumentoRow, 'categoria' | 'descricao' | 'tamanho_bytes'>>,
        never
      >;
    };
    Views: Record<string, never>;
    Functions: {
      resumo_leituras: {
        Args: Record<string, never>;
        Returns: { comunicado_id: string; leituras: number; total_ativos: number }[];
      };
    };
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

export type ComunicadoComAutor = ComunicadoRow & { autor: PerfilResumo | null };

export type SolicitacaoRhComRelacoes = SolicitacaoRhRow & { solicitante: PerfilResumo | null };

export type ChamadoComRelacoes = ChamadoTiRow & {
  solicitante: PerfilResumo | null;
  responsavel: PerfilResumo | null;
};
