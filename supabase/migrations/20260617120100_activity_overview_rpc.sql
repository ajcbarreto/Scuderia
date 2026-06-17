-- Scuderia: agregados de uso para o painel /admin/estatisticas.
-- Foco em quem NÃO é a oficina: visitantes (sem conta) e clientes. A atividade
-- de admin entra só como referência discreta.
-- SECURITY INVOKER (default): respeita o RLS de `activity_events`, por isso só
-- administradores obtêm dados reais.
-- `create or replace` é idempotente — re-aplicar é seguro.

create or replace function public.activity_overview()
returns jsonb
language sql
stable
as $$
  with
  ev30 as (
    select * from public.activity_events
    where occurred_at >= now() - interval '30 days'
  ),
  -- Visitantes anónimos (sem conta)
  pv as (
    select * from ev30 where event_type = 'page_view' and user_id is null
  ),
  visits_month as (
    select coalesce(
      jsonb_agg(jsonb_build_object('month', m, 'count', c) order by m), '[]'::jsonb
    ) j
    from (
      select to_char(date_trunc('month', occurred_at), 'YYYY-MM') m,
             count(distinct metadata->>'anon') c
      from public.activity_events
      where event_type = 'page_view' and user_id is null
        and occurred_at >= date_trunc('month', now()) - interval '11 months'
      group by 1
    ) t
  ),
  top_refs as (
    select coalesce(
      jsonb_agg(jsonb_build_object('ref', ref, 'count', c) order by c desc), '[]'::jsonb
    ) j
    from (
      select metadata->>'ref' ref, count(*) c
      from pv
      where metadata->>'ref' is not null
      group by 1
      order by c desc
      limit 8
    ) t
  ),
  -- Clientes (com conta)
  logins_month as (
    select coalesce(
      jsonb_agg(jsonb_build_object('month', m, 'count', c) order by m), '[]'::jsonb
    ) j
    from (
      select to_char(date_trunc('month', occurred_at), 'YYYY-MM') m, count(*) c
      from public.activity_events
      where event_type = 'login'
        and occurred_at >= date_trunc('month', now()) - interval '11 months'
      group by 1
    ) t
  ),
  clients_never as (
    select count(*)::int c
    from public.profiles p
    where p.role = 'client'
      and not exists (
        select 1 from public.activity_events e
        where e.user_id = p.id and e.event_type = 'login'
      )
  )
  select jsonb_build_object(
    'visitors', jsonb_build_object(
      'visits_30d', (select count(distinct metadata->>'anon')::int from pv where metadata->>'anon' is not null),
      'pageviews_30d', (select count(*)::int from pv),
      'contacts_30d', (select count(*)::int from ev30 where event_type = 'contact_submitted'),
      'visits_by_month', (select j from visits_month),
      'top_refs_30d', (select j from top_refs)
    ),
    'clients', jsonb_build_object(
      'logins_30d', (select count(*)::int from ev30 where event_type = 'login'),
      'active_clients_30d', (select count(distinct user_id)::int from ev30 where role = 'client' and user_id is not null),
      'total_clients', (select count(*)::int from public.profiles where role = 'client'),
      'clients_never_logged_in', (select c from clients_never),
      'boletins_viewed_30d', (select count(*)::int from ev30 where event_type = 'boletim_viewed'),
      'pdf_downloads_30d', (select count(*)::int from ev30 where event_type = 'pdf_downloaded'),
      'appointments_requested_30d', (select count(*)::int from ev30 where event_type = 'appointment_requested'),
      'logins_by_month', (select j from logins_month)
    ),
    'workshop', jsonb_build_object(
      'events_30d', (select count(*)::int from ev30 where role = 'admin'),
      'boletins_opened_30d', (select count(*)::int from ev30 where event_type = 'service_record_opened'),
      'boletins_completed_30d', (select count(*)::int from ev30 where event_type = 'service_record_completed')
    ),
    'total_events', (select count(*)::int from public.activity_events)
  );
$$;
