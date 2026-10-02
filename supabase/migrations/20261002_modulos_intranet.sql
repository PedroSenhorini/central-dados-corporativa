-- Módulos de intranet: Mural (comunicados com confirmação de leitura),
-- Pessoas (diretório), Documentos, Solicitações de RH e Chamados de TI.
--
-- Depende de 20261001_seguranca_rls.sql (is_ativo, set_updated_at).
-- Idempotente: pode ser executado mais de uma vez no SQL Editor.

-- ---------------------------------------------------------------------------
-- Helper: o usuário logado (e ativo) tem um destes papéis?
-- ---------------------------------------------------------------------------
create or replace function public.tem_papel(papeis text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and ativo and papel = any (papeis)
  );
$$;

-- ---------------------------------------------------------------------------
-- Pessoas: diretório de colaboradores
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists data_nascimento date;

-- Qualquer colaborador ativo enxerga os colegas ativos (nome, cargo, área).
drop policy if exists "Colaboradores ativos veem o diretorio" on public.profiles;
create policy "Colaboradores ativos veem o diretorio"
  on public.profiles for select
  using (ativo and public.is_ativo());

-- ---------------------------------------------------------------------------
-- Mural: comunicados oficiais
-- ---------------------------------------------------------------------------
create table if not exists public.comunicados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  corpo text not null,
  categoria text not null default 'geral',
  fixado boolean not null default false,
  autor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.comunicados drop constraint if exists comunicados_categoria_check;
alter table public.comunicados add constraint comunicados_categoria_check
  check (categoria in ('geral', 'diretoria', 'rh', 'ti', 'eventos'));

alter table public.comunicados enable row level security;

drop policy if exists "Colaboradores leem comunicados" on public.comunicados;
create policy "Colaboradores leem comunicados"
  on public.comunicados for select
  using (public.is_ativo());

-- Quem publica: administração, RH e Marketing (comunicação interna).
drop policy if exists "Comunicacao publica comunicados" on public.comunicados;
create policy "Comunicacao publica comunicados"
  on public.comunicados for insert
  with check (autor_id = auth.uid() and public.tem_papel(array['admin', 'rh', 'marketing']));

drop policy if exists "Comunicacao edita comunicados" on public.comunicados;
create policy "Comunicacao edita comunicados"
  on public.comunicados for update
  using (public.tem_papel(array['admin', 'rh', 'marketing']))
  with check (public.tem_papel(array['admin', 'rh', 'marketing']));

drop policy if exists "Comunicacao exclui comunicados" on public.comunicados;
create policy "Comunicacao exclui comunicados"
  on public.comunicados for delete
  using (public.tem_papel(array['admin', 'rh', 'marketing']));

drop trigger if exists set_updated_at on public.comunicados;
create trigger set_updated_at
  before update on public.comunicados
  for each row execute procedure public.set_updated_at();

create table if not exists public.comunicados_leituras (
  comunicado_id uuid not null references public.comunicados (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lido_em timestamptz not null default now(),
  primary key (comunicado_id, user_id)
);

alter table public.comunicados_leituras enable row level security;

drop policy if exists "Colaborador ve as proprias leituras" on public.comunicados_leituras;
create policy "Colaborador ve as proprias leituras"
  on public.comunicados_leituras for select
  using (user_id = auth.uid());

drop policy if exists "Colaborador confirma leitura" on public.comunicados_leituras;
create policy "Colaborador confirma leitura"
  on public.comunicados_leituras for insert
  with check (user_id = auth.uid() and public.is_ativo());

-- Percentual de leitura sem expor quem leu: devolve só contagens.
create or replace function public.resumo_leituras()
returns table (comunicado_id uuid, leituras bigint, total_ativos bigint)
language sql
stable
security definer
set search_path = public
as $$
  select c.id,
         (select count(*) from public.comunicados_leituras l where l.comunicado_id = c.id),
         (select count(*) from public.profiles p where p.ativo)
  from public.comunicados c
  where public.is_ativo();
$$;

-- ---------------------------------------------------------------------------
-- Solicitações de RH: férias, declarações, atualização cadastral
-- ---------------------------------------------------------------------------
create table if not exists public.solicitacoes_rh (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  descricao text,
  data_inicio date,
  data_fim date,
  status text not null default 'pendente',
  resposta text,
  solicitante_id uuid references public.profiles (id) on delete set null,
  responsavel_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.solicitacoes_rh drop constraint if exists solicitacoes_rh_tipo_check;
alter table public.solicitacoes_rh add constraint solicitacoes_rh_tipo_check
  check (tipo in ('ferias', 'declaracao', 'atualizacao_cadastral', 'outro'));

alter table public.solicitacoes_rh drop constraint if exists solicitacoes_rh_status_check;
alter table public.solicitacoes_rh add constraint solicitacoes_rh_status_check
  check (status in ('pendente', 'aprovada', 'recusada', 'concluida'));

alter table public.solicitacoes_rh drop constraint if exists solicitacoes_rh_periodo_check;
alter table public.solicitacoes_rh add constraint solicitacoes_rh_periodo_check
  check (data_fim is null or data_inicio is null or data_fim >= data_inicio);

alter table public.solicitacoes_rh enable row level security;

drop policy if exists "Colaborador ve os proprios pedidos de RH" on public.solicitacoes_rh;
create policy "Colaborador ve os proprios pedidos de RH"
  on public.solicitacoes_rh for select
  using (
    (solicitante_id = auth.uid() and public.is_ativo())
    or public.tem_papel(array['admin', 'rh'])
  );

-- Pedido novo nasce sempre pendente e em nome de quem pediu.
drop policy if exists "Colaborador abre pedido de RH" on public.solicitacoes_rh;
create policy "Colaborador abre pedido de RH"
  on public.solicitacoes_rh for insert
  with check (
    solicitante_id = auth.uid()
    and public.is_ativo()
    and status = 'pendente'
    and responsavel_id is null
  );

drop policy if exists "RH responde pedidos" on public.solicitacoes_rh;
create policy "RH responde pedidos"
  on public.solicitacoes_rh for update
  using (public.tem_papel(array['admin', 'rh']))
  with check (public.tem_papel(array['admin', 'rh']));

drop trigger if exists set_updated_at on public.solicitacoes_rh;
create trigger set_updated_at
  before update on public.solicitacoes_rh
  for each row execute procedure public.set_updated_at();

create index if not exists solicitacoes_rh_solicitante_id_idx
  on public.solicitacoes_rh (solicitante_id);

-- ---------------------------------------------------------------------------
-- Chamados de TI (helpdesk)
-- ---------------------------------------------------------------------------
create table if not exists public.chamados_ti (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  categoria text not null default 'outro',
  prioridade text not null default 'media',
  status text not null default 'aberto',
  solicitante_id uuid references public.profiles (id) on delete set null,
  responsavel_id uuid references public.profiles (id) on delete set null,
  resolvido_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chamados_ti drop constraint if exists chamados_ti_categoria_check;
alter table public.chamados_ti add constraint chamados_ti_categoria_check
  check (categoria in ('equipamento', 'acesso', 'sistema', 'rede', 'outro'));

alter table public.chamados_ti drop constraint if exists chamados_ti_prioridade_check;
alter table public.chamados_ti add constraint chamados_ti_prioridade_check
  check (prioridade in ('baixa', 'media', 'alta'));

alter table public.chamados_ti drop constraint if exists chamados_ti_status_check;
alter table public.chamados_ti add constraint chamados_ti_status_check
  check (status in ('aberto', 'em_atendimento', 'aguardando_usuario', 'resolvido'));

alter table public.chamados_ti enable row level security;

drop policy if exists "Colaborador ve os proprios chamados" on public.chamados_ti;
create policy "Colaborador ve os proprios chamados"
  on public.chamados_ti for select
  using (
    (solicitante_id = auth.uid() and public.is_ativo())
    or public.tem_papel(array['admin', 'ti'])
  );

drop policy if exists "Colaborador abre chamado" on public.chamados_ti;
create policy "Colaborador abre chamado"
  on public.chamados_ti for insert
  with check (
    solicitante_id = auth.uid()
    and public.is_ativo()
    and status = 'aberto'
    and responsavel_id is null
  );

drop policy if exists "TI atende chamados" on public.chamados_ti;
create policy "TI atende chamados"
  on public.chamados_ti for update
  using (public.tem_papel(array['admin', 'ti']))
  with check (public.tem_papel(array['admin', 'ti']));

drop trigger if exists set_updated_at on public.chamados_ti;
create trigger set_updated_at
  before update on public.chamados_ti
  for each row execute procedure public.set_updated_at();

create index if not exists chamados_ti_solicitante_id_idx
  on public.chamados_ti (solicitante_id);

-- ---------------------------------------------------------------------------
-- Documentos: políticas, manuais, procedimentos e modelos
-- ---------------------------------------------------------------------------
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  categoria text not null default 'outro',
  arquivo_path text not null,
  arquivo_nome text not null,
  tamanho_bytes bigint,
  autor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.documentos drop constraint if exists documentos_categoria_check;
alter table public.documentos add constraint documentos_categoria_check
  check (categoria in ('politica', 'manual', 'procedimento', 'modelo', 'outro'));

alter table public.documentos enable row level security;

drop policy if exists "Colaboradores veem documentos" on public.documentos;
create policy "Colaboradores veem documentos"
  on public.documentos for select
  using (public.is_ativo());

drop policy if exists "Gestores publicam documentos" on public.documentos;
create policy "Gestores publicam documentos"
  on public.documentos for insert
  with check (autor_id = auth.uid() and public.tem_papel(array['admin', 'rh', 'ti']));

drop policy if exists "Gestores removem documentos" on public.documentos;
create policy "Gestores removem documentos"
  on public.documentos for delete
  using (public.tem_papel(array['admin', 'rh', 'ti']));

-- Bucket privado: o download é feito por URL assinada (expira).
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

drop policy if exists "Colaboradores baixam documentos" on storage.objects;
create policy "Colaboradores baixam documentos"
  on storage.objects for select
  using (bucket_id = 'documentos' and public.is_ativo());

drop policy if exists "Gestores enviam documentos" on storage.objects;
create policy "Gestores enviam documentos"
  on storage.objects for insert
  with check (bucket_id = 'documentos' and public.tem_papel(array['admin', 'rh', 'ti']));

drop policy if exists "Gestores apagam documentos" on storage.objects;
create policy "Gestores apagam documentos"
  on storage.objects for delete
  using (bucket_id = 'documentos' and public.tem_papel(array['admin', 'rh', 'ti']));
