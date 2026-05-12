-- Lista global de tarefas (oficina). Substitui presets por marca/modelo/ano.
-- Ao criar um boletim, as linhas são copiadas para service_tasks.

create table public.service_task_templates (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_service_task_templates_sort
  on public.service_task_templates (sort_order);

create trigger service_task_templates_updated_at
  before update on public.service_task_templates
  for each row execute function public.set_updated_at();

alter table public.service_task_templates enable row level security;

create policy "service_task_templates_admin_all"
  on public.service_task_templates for all
  using (public.is_admin())
  with check (public.is_admin());

-- Remover presets e FK em boletins
alter table public.service_records
  drop constraint if exists service_records_checklist_preset_id_fkey;

drop index if exists public.idx_service_records_checklist_preset;

alter table public.service_records
  drop column if exists checklist_preset_id;

drop table if exists public.maintenance_checklist_preset_items cascade;
drop table if exists public.maintenance_checklist_presets cascade;
