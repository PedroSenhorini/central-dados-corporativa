-- Endurecimento de segurança das policies (RLS).
--
-- Fecha três caminhos de escalada de privilégio que existiam no schema:
--   1. qualquer usuário podia mudar o próprio `papel`/`ativo` via update
--      direto na API (policy "Usuário atualiza o próprio perfil");
--   2. o cadastro aceitava `papel` vindo dos metadados do signUp, que o
--      próprio usuário controla — dava para se registrar como admin;
--   3. o RH podia promover a si mesmo (ou qualquer um) a admin.
-- Também impede o solicitante de aprovar a própria compra, garante que um
-- colaborador desligado perca o acesso também pela API (não só na tela) e
-- passa o `updated_at` a ser definido pelo banco.
--
-- Idempotente: pode ser executado mais de uma vez no SQL Editor.

-- ---------------------------------------------------------------------------
-- Helper: o usuário logado está ativo?
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Cadastro: papéis com acesso restrito nunca vêm do signUp
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- profiles: papel e status de acesso só mudam por quem tem autoridade
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

drop policy if exists "Usuário atualiza o próprio perfil" on public.profiles;
create policy "Usuário atualiza o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id and public.is_ativo())
  with check (auth.uid() = id);

drop policy if exists "Admin atualiza qualquer perfil" on public.profiles;
create policy "Admin atualiza qualquer perfil"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "RH desliga colaboradores" on public.profiles;
create policy "RH desliga colaboradores"
  on public.profiles for update
  using (papel <> 'admin' and public.is_rh())
  with check (papel <> 'admin' and public.is_rh());

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

-- ---------------------------------------------------------------------------
-- vagas_rh: o gestor só movimenta a etapa da própria vaga
-- ---------------------------------------------------------------------------
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

drop policy if exists "RH e admin atualizam qualquer vaga" on public.vagas_rh;
create policy "RH e admin atualizam qualquer vaga"
  on public.vagas_rh for update
  using (public.is_admin() or public.is_rh())
  with check (public.is_admin() or public.is_rh());

drop policy if exists "Gestor ve a propria vaga solicitada" on public.vagas_rh;
create policy "Gestor ve a propria vaga solicitada"
  on public.vagas_rh for select
  using (gestor_solicitante_id = auth.uid() and public.is_ativo());

drop policy if exists "Gestor move a propria vaga solicitada" on public.vagas_rh;
create policy "Gestor move a propria vaga solicitada"
  on public.vagas_rh for update
  using (gestor_solicitante_id = auth.uid() and public.is_ativo())
  with check (gestor_solicitante_id = auth.uid());

-- ---------------------------------------------------------------------------
-- solicitacoes_compra: só Compras/admin conduzem status e responsável
-- ---------------------------------------------------------------------------
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

drop policy if exists "Compras e admin atualizam qualquer solicitacao" on public.solicitacoes_compra;
create policy "Compras e admin atualizam qualquer solicitacao"
  on public.solicitacoes_compra for update
  using (public.is_admin() or public.is_compras())
  with check (public.is_admin() or public.is_compras());

drop policy if exists "Colaborador cria a propria solicitacao" on public.solicitacoes_compra;
create policy "Colaborador cria a propria solicitacao"
  on public.solicitacoes_compra for insert
  with check (solicitante_id = auth.uid() and public.is_ativo());

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
