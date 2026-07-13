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

drop policy if exists "Usuário atualiza o próprio perfil" on public.profiles;
create policy "Usuário atualiza o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

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
  using (public.is_admin());

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
  using (papel <> 'admin' and public.is_rh());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, empresa, cargo, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'empresa', 'Minha Empresa'),
    new.raw_user_meta_data ->> 'cargo',
    coalesce(new.raw_user_meta_data ->> 'papel', 'geral')
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
  using (gestor_solicitante_id = auth.uid());

drop policy if exists "Gestor move a propria vaga solicitada" on public.vagas_rh;
create policy "Gestor move a propria vaga solicitada"
  on public.vagas_rh for update
  using (gestor_solicitante_id = auth.uid());
