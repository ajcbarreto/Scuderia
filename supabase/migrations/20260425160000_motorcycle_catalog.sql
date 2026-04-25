-- Catálogo de variantes (marca, modelo, ano) para reutilizar em motas de clientes e em presets de checklist

create table public.motorcycle_catalog_entries (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year int not null check (year >= 1900 and year <= 2100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index motorcycle_catalog_entries_unique
  on public.motorcycle_catalog_entries (
    lower(trim(brand)),
    lower(trim(model)),
    year
  );

create trigger motorcycle_catalog_entries_updated_at
  before update on public.motorcycle_catalog_entries
  for each row execute function public.set_updated_at();

alter table public.motorcycles
  add column catalog_entry_id uuid references public.motorcycle_catalog_entries (id) on delete set null;

create index idx_motorcycles_catalog_entry on public.motorcycles (catalog_entry_id);

alter table public.maintenance_checklist_presets
  add column catalog_entry_id uuid references public.motorcycle_catalog_entries (id) on delete set null;

create index idx_checklist_presets_catalog_entry
  on public.maintenance_checklist_presets (catalog_entry_id);

alter table public.motorcycle_catalog_entries enable row level security;

create policy "motorcycle_catalog_entries_admin_all"
  on public.motorcycle_catalog_entries for all
  using (public.is_admin())
  with check (public.is_admin());
