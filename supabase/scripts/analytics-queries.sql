-- Scuderia · Queries de análise de uso (activity_events)
-- Correr no SQL Editor do Supabase. Todas as datas em UTC.
-- A recolha começa a partir do momento em que a feature é colocada em produção,
-- por isso números longos ("último ano") só ficam completos com o tempo.

-- 1) Logins por mês (últimos 12 meses)
select to_char(date_trunc('month', occurred_at), 'YYYY-MM') as mes,
       count(*) as logins,
       count(distinct user_id) as utilizadores_distintos
from public.activity_events
where event_type = 'login'
  and occurred_at >= date_trunc('month', now()) - interval '11 months'
group by 1
order by 1;

-- 2) Utilizadores ativos por mês (qualquer interação) — MAU
select to_char(date_trunc('month', occurred_at), 'YYYY-MM') as mes,
       count(distinct user_id) as utilizadores_ativos
from public.activity_events
where user_id is not null
group by 1
order by 1;

-- 3) Eventos por tipo (últimos 30 dias)
select event_type, count(*) as total
from public.activity_events
where occurred_at >= now() - interval '30 days'
group by 1
order by total desc;

-- 4) Clientes que NUNCA fizeram login (registaram mas não usam)
select p.id, p.full_name
from public.profiles p
where p.role = 'client'
  and not exists (
    select 1 from public.activity_events e
    where e.user_id = p.id and e.event_type = 'login'
  )
order by p.full_name;

-- 5) Clientes mais ativos (nº de interações, últimos 90 dias)
select p.full_name, count(*) as interacoes, max(e.occurred_at) as ultima_atividade
from public.activity_events e
join public.profiles p on p.id = e.user_id
where e.role = 'client'
  and e.occurred_at >= now() - interval '90 days'
group by p.id, p.full_name
order by interacoes desc
limit 50;

-- 6) Funil de adoção do cliente: quantos viram boletins / descarregaram PDF / pediram agendamento
select
  count(*) filter (where event_type = 'login')                as logins,
  count(distinct user_id) filter (where event_type = 'boletim_viewed')        as viram_boletim,
  count(distinct user_id) filter (where event_type = 'pdf_downloaded')        as descarregaram_pdf,
  count(distinct user_id) filter (where event_type = 'appointment_requested') as pediram_agendamento
from public.activity_events
where role = 'client';

-- ===========================================================================
-- VISITANTES (sem conta) — potenciais clientes
-- ===========================================================================

-- V1) Visitas por mês (sessões anónimas distintas) e páginas vistas
select to_char(date_trunc('month', occurred_at), 'YYYY-MM') as mes,
       count(distinct metadata->>'anon') as visitas,
       count(*) as paginas_vistas
from public.activity_events
where event_type = 'page_view' and user_id is null
group by 1
order by 1;

-- V2) Páginas mais vistas por visitantes (últimos 30 dias)
select metadata->>'path' as pagina, count(*) as vistas
from public.activity_events
where event_type = 'page_view' and user_id is null
  and occurred_at >= now() - interval '30 days'
group by 1
order by vistas desc;

-- V3) Origem do tráfego (referrers) — últimos 30 dias
select coalesce(metadata->>'ref', '(direto)') as origem, count(*) as visitas
from public.activity_events
where event_type = 'page_view' and user_id is null
  and occurred_at >= now() - interval '30 days'
group by 1
order by visitas desc;

-- V4) Leads (formulário de contacto) por mês
select to_char(date_trunc('month', occurred_at), 'YYYY-MM') as mes,
       count(*) as contactos
from public.activity_events
where event_type = 'contact_submitted'
group by 1
order by 1;

-- 7) Atividade da oficina (admin) por mês
select to_char(date_trunc('month', occurred_at), 'YYYY-MM') as mes,
       count(*) filter (where event_type = 'service_record_opened')    as boletins_abertos,
       count(*) filter (where event_type = 'service_record_completed') as boletins_concluidos,
       count(*) filter (where event_type = 'motorcycle_created')       as motas_criadas,
       count(*) filter (where event_type = 'client_created')           as clientes_criados
from public.activity_events
where role = 'admin'
group by 1
order by 1;
