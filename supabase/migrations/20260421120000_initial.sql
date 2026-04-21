-- Scuderia: schema inicial + RLS
-- Aplicar no SQL Editor do Supabase ou via CLI: supabase db push

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'client');

create type public.service_record_status as enum ('draft', 'in_progress', 'completed', 'cancelled');

create type public.attachment_kind as enum ('invoice', 'photo', 'other');

create type public.appointment_status as enum ('pending', 'confirmed', 'rejected', 'completed');

-- Perfis (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'client',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year int,
  plate text,
  vin text,
  notes text,
  current_owner_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.motorcycle_ownership_periods (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles (id) on delete cascade,
  owner_id uuid not null references public.profiles (id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  transfer_note text
);

create index idx_motorcycles_owner on public.motorcycles (current_owner_id);
create index idx_ownership_moto on public.motorcycle_ownership_periods (motorcycle_id);

create table public.service_records (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles (id) on delete cascade,
  ownership_period_id uuid references public.motorcycle_ownership_periods (id),
  status public.service_record_status not null default 'in_progress',
  title text,
  shop_notes text,
  progress_percent int not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.service_tasks (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null references public.service_records (id) on delete cascade,
  label text not null,
  sort_order int not null default 0,
  completed boolean not null default false,
  completed_at timestamptz
);

create index idx_tasks_record on public.service_tasks (service_record_id);

create table public.service_attachments (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null references public.service_records (id) on delete cascade,
  kind public.attachment_kind not null,
  storage_bucket text not null default 'service-files',
  storage_path text not null,
  mime_type text,
  visible_to_owner_id uuid references public.profiles (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index idx_attachments_record on public.service_attachments (service_record_id);

create table public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id),
  motorcycle_id uuid references public.motorcycles (id) on delete set null,
  preferred_start timestamptz,
  message text,
  status public.appointment_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- Novo utilizador → perfil cliente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'client');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger motorcycles_updated_at
  before update on public.motorcycles
  for each row execute function public.set_updated_at();

-- Progresso do boletim a partir das tarefas
create or replace function public.recalc_service_record_progress()
returns trigger
language plpgsql
as $$
declare
  rid uuid;
  pct int;
  total int;
  done int;
begin
  rid := coalesce(new.service_record_id, old.service_record_id);
  select count(*)::int, count(*) filter (where completed)::int
    into total, done
  from public.service_tasks
  where service_record_id = rid;
  if total = 0 then
    pct := 0;
  else
    pct := round(100.0 * done / total)::int;
  end if;
  update public.service_records
  set progress_percent = pct
  where id = rid;
  return coalesce(new, old);
end;
$$;

create trigger tasks_recalc_insert
  after insert on public.service_tasks
  for each row execute function public.recalc_service_record_progress();

create trigger tasks_recalc_update
  after update on public.service_tasks
  for each row execute function public.recalc_service_record_progress();

create trigger tasks_recalc_delete
  after delete on public.service_tasks
  for each row execute function public.recalc_service_record_progress();

-- RLS
alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;
alter table public.motorcycle_ownership_periods enable row level security;
alter table public.service_records enable row level security;
alter table public.service_tasks enable row level security;
alter table public.service_attachments enable row level security;
alter table public.appointment_requests enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- profiles: próprio registo; admin vê tudo (para gestão)
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

-- motorcycles
create policy "motorcycles_select"
  on public.motorcycles for select
  using (current_owner_id = auth.uid() or public.is_admin());

create policy "motorcycles_insert_admin"
  on public.motorcycles for insert
  with check (public.is_admin());

create policy "motorcycles_update_admin"
  on public.motorcycles for update
  using (public.is_admin());

create policy "motorcycles_delete_admin"
  on public.motorcycles for delete
  using (public.is_admin());

-- ownership periods
create policy "ownership_select"
  on public.motorcycle_ownership_periods for select
  using (
    owner_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.motorcycles m
      where m.id = motorcycle_id and m.current_owner_id = auth.uid()
    )
  );

create policy "ownership_write_admin"
  on public.motorcycle_ownership_periods for all
  using (public.is_admin())
  with check (public.is_admin());

-- service_records
create policy "service_records_select"
  on public.service_records for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.motorcycles m
      where m.id = motorcycle_id and m.current_owner_id = auth.uid()
    )
  );

create policy "service_records_write_admin"
  on public.service_records for all
  using (public.is_admin())
  with check (public.is_admin());

-- service_tasks
create policy "service_tasks_select"
  on public.service_tasks for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.service_records sr
      join public.motorcycles m on m.id = sr.motorcycle_id
      where sr.id = service_record_id and m.current_owner_id = auth.uid()
    )
  );

create policy "service_tasks_write_admin"
  on public.service_tasks for all
  using (public.is_admin())
  with check (public.is_admin());

-- attachments: faturas só para o dono indicado ou admin; resto visível ao dono atual da mota
create policy "attachments_select"
  on public.service_attachments for select
  using (
    public.is_admin()
    or (
      kind = 'invoice'
      and visible_to_owner_id = auth.uid()
    )
    or (
      kind <> 'invoice'
      and exists (
        select 1
        from public.service_records sr
        join public.motorcycles m on m.id = sr.motorcycle_id
        where sr.id = service_record_id and m.current_owner_id = auth.uid()
      )
    )
  );

create policy "attachments_write_admin"
  on public.service_attachments for all
  using (public.is_admin())
  with check (public.is_admin());

-- appointments
create policy "appointments_select"
  on public.appointment_requests for select
  using (client_id = auth.uid() or public.is_admin());

create policy "appointments_insert_client"
  on public.appointment_requests for insert
  with check (client_id = auth.uid());

create policy "appointments_update_admin"
  on public.appointment_requests for update
  using (public.is_admin());
