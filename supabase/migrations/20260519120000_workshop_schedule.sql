-- Configuração de dias de trabalho da oficina:
-- - `workshop_settings`: singleton com os dias da semana fechados (0=domingo, 6=sábado)
-- - `workshop_closed_dates`: datas específicas fechadas (ex.: feriados, férias)
--
-- O formulário de agendamento usa estes dados para bloquear datas fechadas
-- antes de submeter; a server-action também valida no servidor.

-- ---------- workshop_settings (singleton) ---------------------------------

create table public.workshop_settings (
  id boolean primary key default true,
  closed_weekdays smallint[] not null default '{0}'::smallint[],
  updated_at timestamptz not null default now(),
  constraint workshop_settings_singleton check (id = true),
  constraint workshop_settings_weekdays_range
    check (
      closed_weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
    )
);

-- Seed da linha singleton (domingo fechado por defeito).
insert into public.workshop_settings (id) values (true)
on conflict (id) do nothing;

create or replace function public.touch_workshop_settings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger workshop_settings_touch
  before update on public.workshop_settings
  for each row execute function public.touch_workshop_settings_updated_at();

alter table public.workshop_settings enable row level security;

-- Qualquer utilizador autenticado consulta (o formulário precisa de saber).
create policy "workshop_settings_select_authenticated"
  on public.workshop_settings for select
  using (auth.uid() is not null);

create policy "workshop_settings_update_admin"
  on public.workshop_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- workshop_closed_dates (feriados / dias específicos) -----------

create table public.workshop_closed_dates (
  id uuid primary key default gen_random_uuid(),
  closed_date date not null unique,
  note text,
  created_at timestamptz not null default now()
);

create index idx_workshop_closed_dates_date
  on public.workshop_closed_dates (closed_date);

alter table public.workshop_closed_dates enable row level security;

create policy "workshop_closed_dates_select_authenticated"
  on public.workshop_closed_dates for select
  using (auth.uid() is not null);

create policy "workshop_closed_dates_all_admin"
  on public.workshop_closed_dates for all
  using (public.is_admin())
  with check (public.is_admin());
