-- Devolve a última intervenção de manutenção de cada motociclo visível ao
-- utilizador autenticado (respeita RLS por estar `security invoker`).
--
-- Substitui o pattern frágil em `/garagem` que fazia
--   .select(...).in('motorcycle_id', ids).order('opened_at desc').limit(200)
-- e depois agrupava em memória — perdia o último registo de motas antigas
-- assim que a frota agregada ultrapassasse 200 boletins de manutenção.

-- Self-healing: garante que as colunas referenciadas existem. Idempotente em
-- ambientes onde as migrations 20260512170000/180000 já correram, mas evita
-- 42703 em ambientes que estejam atrás (ex.: BD que só recebeu o schema
-- inicial + cleanup mas ainda não aplicou os meta do boletim).
alter table public.service_records
  add column if not exists service_date          date,
  add column if not exists odometer_km           integer,
  add column if not exists next_service_due_date date,
  add column if not exists next_service_due_km   integer;

create or replace function public.latest_maintenance_per_motorcycle()
returns table (
  motorcycle_id          uuid,
  service_record_id      uuid,
  opened_at              timestamptz,
  closed_at              timestamptz,
  service_date           date,
  status                 public.service_record_status,
  title                  text,
  odometer_km            integer,
  next_service_due_date  date,
  next_service_due_km    integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select distinct on (sr.motorcycle_id)
    sr.motorcycle_id,
    sr.id as service_record_id,
    sr.opened_at,
    sr.closed_at,
    sr.service_date,
    sr.status,
    sr.title,
    sr.odometer_km,
    sr.next_service_due_date,
    sr.next_service_due_km
  from public.service_records sr
  where sr.record_kind = 'maintenance'
  order by sr.motorcycle_id, sr.opened_at desc;
$$;

grant execute on function public.latest_maintenance_per_motorcycle() to authenticated;

-- Índice de apoio (já existe `idx_service_records_record_kind`; este cobre o
-- ordenamento `(motorcycle_id, opened_at desc)` que a função usa).
create index if not exists idx_service_records_moto_kind_opened
  on public.service_records (motorcycle_id, opened_at desc)
  where record_kind = 'maintenance';
