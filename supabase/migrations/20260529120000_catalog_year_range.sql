-- Catálogo: intervalo de anos por variante (ex.: Multistrada 1200 2015–2017).
-- `year` único → `year_start` (NOT NULL) + `year_end` (NULL = só esse ano / em produção).

alter table public.motorcycle_catalog_entries
  rename column year to year_start;

alter table public.motorcycle_catalog_entries
  add column year_end int;

comment on column public.motorcycle_catalog_entries.year_start is
  'Primeiro ano do modelo (inclusive).';
comment on column public.motorcycle_catalog_entries.year_end is
  'Último ano do modelo (inclusive). NULL = ainda em produção ou ano único.';

alter table public.motorcycle_catalog_entries
  drop constraint if exists motorcycle_catalog_entries_year_check;

alter table public.motorcycle_catalog_entries
  add constraint motorcycle_catalog_entries_year_start_chk
  check (year_start >= 1900 and year_start <= 2100);

alter table public.motorcycle_catalog_entries
  add constraint motorcycle_catalog_entries_year_end_chk
  check (year_end is null or (year_end >= 1900 and year_end <= 2100));

alter table public.motorcycle_catalog_entries
  add constraint motorcycle_catalog_entries_year_range_ok
  check (year_end is null or year_end >= year_start);

drop index if exists motorcycle_catalog_entries_unique;

create unique index motorcycle_catalog_entries_unique
  on public.motorcycle_catalog_entries (
    lower(trim(brand)),
    lower(trim(model)),
    year_start,
    coalesce(year_end, year_start)
  );
