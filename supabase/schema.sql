create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  empresa text not null,
  cargo text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists papel text not null default 'geral';

alter table public.profiles drop constraint if exists profiles_papel_check;
alter table public.profiles add constraint profiles_papel_check
  check (papel in ('geral', 'pcp', 'sac', 'vendas', 'compras', 'ti', 'rh', 'marketing', 'admin'));

-- Desligamento: 'ativo = false' bloqueia o acesso do colaborador à Central
-- de Dados (ver ProtectedRoute) — é o que a automação de desligamento liga.
alter table public.profiles
  add column if not exists ativo boolean not null default true;

alter table public.profiles
  add column if not exists data_desligamento date;

alter table public.profiles enable row level security;

drop policy if exists "Usuário lê o próprio perfil" on public.profiles;
create policy "Usuário lê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create or replace function public.is_ativo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and ativo
  );
$$;

drop policy if exists "Usuário atualiza o próprio perfil" on public.profiles;
create policy "Usuário atualiza o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id and public.is_ativo())
  with check (auth.uid() = id);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and papel = 'admin' and ativo
  );
$$;

drop policy if exists "Admin lê todos os perfis" on public.profiles;
create policy "Admin lê todos os perfis"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admin atualiza qualquer perfil" on public.profiles;
create policy "Admin atualiza qualquer perfil"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- security definer: evita recursão infinita de RLS ao checar o papel do
-- próprio usuário dentro de uma policy da tabela profiles (mesmo motivo de
-- is_admin() acima).
create or replace function public.is_rh()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and papel = 'rh' and ativo
  );
$$;

-- RH enxerga todos os perfis e pode desligar colaboradores (exceto admins,
-- para não correr o risco de um RH bloquear a própria administração).
drop policy if exists "RH lê todos os perfis" on public.profiles;
create policy "RH lê todos os perfis"
  on public.profiles for select
  using (public.is_rh());

drop policy if exists "RH desliga colaboradores" on public.profiles;
create policy "RH desliga colaboradores"
  on public.profiles for update
  using (papel <> 'admin' and public.is_rh())
  with check (papel <> 'admin' and public.is_rh());

-- RH, Compras, TI e admin liberam dados sensíveis; quem pede essas áreas no
-- cadastro entra como 'geral' e um administrador promove pela tela Usuários.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  papel_pedido text := new.raw_user_meta_data ->> 'papel';
begin
  insert into public.profiles (id, nome, empresa, cargo, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'empresa', 'Minha Empresa'),
    new.raw_user_meta_data ->> 'cargo',
    case
      when papel_pedido in ('geral', 'pcp', 'sac', 'vendas', 'marketing') then papel_pedido
      else 'geral'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

update public.profiles
set papel = 'admin'
where id = (select id from auth.users where email = 'pedrosenhorini0@gmail.com');

-- Kanban de vagas do RH: acompanhamento de abertura, etapas de contratação
-- e controle de SLA (prazo combinado para preencher a vaga).
create table if not exists public.vagas_rh (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  setor_area text not null,
  gestor_solicitante_id uuid references public.profiles (id) on delete set null,
  responsavel_rh_id uuid references public.profiles (id) on delete set null,
  prioridade text not null default 'media',
  status text not null default 'aberta',
  data_abertura date not null default current_date,
  prazo_sla_dias integer not null default 30,
  data_fechamento date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vagas_rh drop constraint if exists vagas_rh_prioridade_check;
alter table public.vagas_rh add constraint vagas_rh_prioridade_check
  check (prioridade in ('baixa', 'media', 'alta'));

alter table public.vagas_rh drop constraint if exists vagas_rh_status_check;
alter table public.vagas_rh add constraint vagas_rh_status_check
  check (status in ('aberta', 'triagem', 'entrevistas', 'proposta', 'contratada', 'cancelada'));

alter table public.vagas_rh enable row level security;

-- RH e admin enxergam e administram todas as vagas.
drop policy if exists "RH e admin veem todas as vagas" on public.vagas_rh;
create policy "RH e admin veem todas as vagas"
  on public.vagas_rh for select
  using (
    public.is_admin()
    or public.is_rh()
  );

drop policy if exists "RH e admin criam vagas" on public.vagas_rh;
create policy "RH e admin criam vagas"
  on public.vagas_rh for insert
  with check (
    public.is_admin()
    or public.is_rh()
  );

drop policy if exists "RH e admin atualizam qualquer vaga" on public.vagas_rh;
create policy "RH e admin atualizam qualquer vaga"
  on public.vagas_rh for update
  using (
    public.is_admin()
    or public.is_rh()
  )
  with check (
    public.is_admin()
    or public.is_rh()
  );

drop policy if exists "RH e admin excluem vagas" on public.vagas_rh;
create policy "RH e admin excluem vagas"
  on public.vagas_rh for delete
  using (
    public.is_admin()
    or public.is_rh()
  );

-- Gestor solicitante: enxerga e movimenta apenas a própria vaga, mesmo
-- fora do RH — é o que dá visibilidade ao gestor da área sem abrir tudo.
drop policy if exists "Gestor ve a propria vaga solicitada" on public.vagas_rh;
create policy "Gestor ve a propria vaga solicitada"
  on public.vagas_rh for select
  using (gestor_solicitante_id = auth.uid() and public.is_ativo());

drop policy if exists "Gestor move a propria vaga solicitada" on public.vagas_rh;
create policy "Gestor move a propria vaga solicitada"
  on public.vagas_rh for update
  using (gestor_solicitante_id = auth.uid() and public.is_ativo())
  with check (gestor_solicitante_id = auth.uid());

-- security definer: mesmo motivo de is_admin()/is_rh() acima — evita
-- recursão infinita de RLS ao checar o papel do próprio usuário.
create or replace function public.is_compras()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and papel = 'compras' and ativo
  );
$$;

-- Solicitação de compra: qualquer colaborador pede a compra/orçamento de um
-- produto ou equipamento; o time de Compras conduz a cotação até o fechamento.
create table if not exists public.solicitacoes_compra (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  categoria text not null default 'material',
  descricao text,
  quantidade integer not null default 1,
  valor_estimado numeric(12, 2),
  urgencia text not null default 'media',
  justificativa text,
  fornecedor_sugerido text,
  data_necessidade date,
  status text not null default 'solicitado',
  solicitante_id uuid references public.profiles (id) on delete set null,
  responsavel_compras_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.solicitacoes_compra drop constraint if exists solicitacoes_compra_categoria_check;
alter table public.solicitacoes_compra add constraint solicitacoes_compra_categoria_check
  check (categoria in ('equipamento', 'material', 'software', 'servico', 'outro'));

alter table public.solicitacoes_compra drop constraint if exists solicitacoes_compra_urgencia_check;
alter table public.solicitacoes_compra add constraint solicitacoes_compra_urgencia_check
  check (urgencia in ('baixa', 'media', 'alta', 'critica'));

alter table public.solicitacoes_compra drop constraint if exists solicitacoes_compra_status_check;
alter table public.solicitacoes_compra add constraint solicitacoes_compra_status_check
  check (status in ('solicitado', 'em_cotacao', 'aprovado', 'comprado', 'recusado'));

alter table public.solicitacoes_compra drop constraint if exists solicitacoes_compra_quantidade_check;
alter table public.solicitacoes_compra add constraint solicitacoes_compra_quantidade_check
  check (quantidade > 0);

alter table public.solicitacoes_compra enable row level security;

-- Compras e admin enxergam e administram todas as solicitações.
drop policy if exists "Compras e admin veem todas as solicitacoes" on public.solicitacoes_compra;
create policy "Compras e admin veem todas as solicitacoes"
  on public.solicitacoes_compra for select
  using (
    public.is_admin()
    or public.is_compras()
  );

drop policy if exists "Compras e admin atualizam qualquer solicitacao" on public.solicitacoes_compra;
create policy "Compras e admin atualizam qualquer solicitacao"
  on public.solicitacoes_compra for update
  using (
    public.is_admin()
    or public.is_compras()
  )
  with check (
    public.is_admin()
    or public.is_compras()
  );

drop policy if exists "Compras e admin excluem solicitacoes" on public.solicitacoes_compra;
create policy "Compras e admin excluem solicitacoes"
  on public.solicitacoes_compra for delete
  using (
    public.is_admin()
    or public.is_compras()
  );

-- Qualquer colaborador autenticado pode pedir a compra de um produto ou
-- equipamento — a solicitação nasce sempre em nome do próprio usuário.
drop policy if exists "Colaborador cria a propria solicitacao" on public.solicitacoes_compra;
create policy "Colaborador cria a propria solicitacao"
  on public.solicitacoes_compra for insert
  with check (solicitante_id = auth.uid() and public.is_ativo());

-- Solicitante: enxerga e edita apenas os próprios pedidos, mesmo fora do
-- time de Compras — mesma lógica do gestor solicitante em vagas_rh.
drop policy if exists "Solicitante ve a propria solicitacao" on public.solicitacoes_compra;
create policy "Solicitante ve a propria solicitacao"
  on public.solicitacoes_compra for select
  using (solicitante_id = auth.uid() and public.is_ativo());

drop policy if exists "Solicitante atualiza a propria solicitacao" on public.solicitacoes_compra;
create policy "Solicitante atualiza a propria solicitacao"
  on public.solicitacoes_compra for update
  using (solicitante_id = auth.uid() and public.is_ativo())
  with check (solicitante_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Travas de colunas (triggers): campos sensíveis só mudam por quem tem autoridade
-- ---------------------------------------------------------------------------

-- RLS controla quais LINHAS o usuário edita, não quais COLUNAS — por isso a
-- trava de colunas fica num trigger. Chamadas fora da API (SQL Editor,
-- service_role) não passam pelos papéis 'authenticated'/'anon' e seguem livres.
create or replace function public.proteger_campos_profiles()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'O id do perfil não pode ser alterado.' using errcode = '42501';
  end if;

  if new.papel is distinct from old.papel and not public.is_admin() then
    raise exception 'Apenas administradores podem alterar o papel de um usuário.'
      using errcode = '42501';
  end if;

  if (new.ativo is distinct from old.ativo
      or new.data_desligamento is distinct from old.data_desligamento)
     and not (
       public.is_admin()
       or (public.is_rh() and old.papel <> 'admin' and old.id <> auth.uid())
     ) then
    raise exception 'Apenas RH ou administradores podem alterar o acesso de um colaborador.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_campos_profiles on public.profiles;
create trigger proteger_campos_profiles
  before update on public.profiles
  for each row execute procedure public.proteger_campos_profiles();

-- ---------------------------------------------------------------------------
-- updated_at definido pelo banco (o relógio do navegador não é confiável)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.vagas_rh;
create trigger set_updated_at
  before update on public.vagas_rh
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.solicitacoes_compra;
create trigger set_updated_at
  before update on public.solicitacoes_compra
  for each row execute procedure public.set_updated_at();

create or replace function public.proteger_campos_vagas_rh()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  campos_do_gestor text[] := array['status', 'data_fechamento', 'updated_at'];
begin
  if current_user not in ('authenticated', 'anon')
     or public.is_admin() or public.is_rh() then
    return new;
  end if;

  if (to_jsonb(new) - campos_do_gestor) is distinct from (to_jsonb(old) - campos_do_gestor) then
    raise exception 'O gestor só pode mover a etapa da vaga; demais campos são do RH.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_campos_vagas_rh on public.vagas_rh;
create trigger proteger_campos_vagas_rh
  before update on public.vagas_rh
  for each row execute procedure public.proteger_campos_vagas_rh();

create or replace function public.proteger_campos_solicitacoes_compra()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('authenticated', 'anon')
     or public.is_admin() or public.is_compras() then
    return new;
  end if;

  -- Pedido novo de colaborador sempre nasce na primeira etapa, sem responsável.
  if tg_op = 'INSERT' then
    new.status := 'solicitado';
    new.responsavel_compras_id := null;
    return new;
  end if;

  if new.status is distinct from old.status
     or new.responsavel_compras_id is distinct from old.responsavel_compras_id
     or new.solicitante_id is distinct from old.solicitante_id then
    raise exception 'Apenas o time de Compras pode alterar status ou responsável da solicitação.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_campos_solicitacoes_compra on public.solicitacoes_compra;
create trigger proteger_campos_solicitacoes_compra
  before insert or update on public.solicitacoes_compra
  for each row execute procedure public.proteger_campos_solicitacoes_compra();

-- ---------------------------------------------------------------------------
-- Índices nas FKs usadas pelas policies (RLS filtra por elas em toda query)
-- ---------------------------------------------------------------------------
create index if not exists vagas_rh_gestor_solicitante_id_idx
  on public.vagas_rh (gestor_solicitante_id);
create index if not exists vagas_rh_responsavel_rh_id_idx
  on public.vagas_rh (responsavel_rh_id);
create index if not exists solicitacoes_compra_solicitante_id_idx
  on public.solicitacoes_compra (solicitante_id);
create index if not exists solicitacoes_compra_responsavel_compras_id_idx
  on public.solicitacoes_compra (responsavel_compras_id);
