-- Consistência de `updated_at`: `profiles`, `motorcycles`, `service_task_templates`
-- e `motorcycle_catalog_entries` já têm coluna + trigger. `service_records` e
-- `service_tasks` não tinham — sem isto não dá para ordenar por "alterado
-- recentemente" nem auditar quando um boletim mudou.
--
-- A função `set_updated_at()` já existe (migration inicial).

alter table public.service_records
  add column if not exists updated_at timestamptz not null default now();

alter table public.service_tasks
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists service_records_updated_at on public.service_records;
create trigger service_records_updated_at
  before update on public.service_records
  for each row execute function public.set_updated_at();

drop trigger if exists service_tasks_updated_at on public.service_tasks;
create trigger service_tasks_updated_at
  before update on public.service_tasks
  for each row execute function public.set_updated_at();
