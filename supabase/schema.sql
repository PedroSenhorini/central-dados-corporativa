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
    select 1 from public.profiles where id = auth.uid() and papel = 'admin'
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
