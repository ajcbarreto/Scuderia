-- Presets de checklist: marca + modelo + tipo de serviço → lista de tarefas (para aplicar a boletins)

create table public.maintenance_checklist_presets (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  service_type_name text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index maintenance_checklist_presets_unique_key
  on public.maintenance_checklist_presets (
    lower(trim(brand)),
    lower(trim(model)),
    lower(trim(service_type_name))
  );

create table public.maintenance_checklist_preset_items (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.maintenance_checklist_presets (id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

create index idx_checklist_preset_items_preset
  on public.maintenance_checklist_preset_items (preset_id);

create trigger maintenance_checklist_presets_updated_at
  before update on public.maintenance_checklist_presets
  for each row execute function public.set_updated_at();

alter table public.service_records
  add column checklist_preset_id uuid references public.maintenance_checklist_presets (id) on delete set null;

create index idx_service_records_checklist_preset
  on public.service_records (checklist_preset_id)
  where checklist_preset_id is not null;

alter table public.maintenance_checklist_presets enable row level security;
alter table public.maintenance_checklist_preset_items enable row level security;

create policy "maintenance_checklist_presets_admin_all"
  on public.maintenance_checklist_presets for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "maintenance_checklist_preset_items_admin_all"
  on public.maintenance_checklist_preset_items for all
  using (public.is_admin())
  with check (public.is_admin());
