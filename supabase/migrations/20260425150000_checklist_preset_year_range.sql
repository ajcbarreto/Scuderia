-- Intervalo de ano do modelo nos presets (ex.: desmo específico de 2015–2017)

alter table public.maintenance_checklist_presets
  add column year_min int null;

alter table public.maintenance_checklist_presets
  add column year_max int null;

comment on column public.maintenance_checklist_presets.year_min is
  'Ano mínimo do modelo (inclusive). NULL = sem limite inferior.';
comment on column public.maintenance_checklist_presets.year_max is
  'Ano máximo do modelo (inclusive). NULL = sem limite superior.';

alter table public.maintenance_checklist_presets
  add constraint maintenance_checklist_presets_year_range_ok
  check (year_min is null or year_max is null or year_min <= year_max);

drop index if exists maintenance_checklist_presets_unique_key;

create unique index maintenance_checklist_presets_unique_key
  on public.maintenance_checklist_presets (
    lower(trim(brand)),
    lower(trim(model)),
    lower(trim(service_type_name)),
    coalesce(year_min, -1),
    coalesce(year_max, 99999)
  );
