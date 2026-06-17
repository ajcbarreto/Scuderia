-- Scuderia: eventos de atividade (analytics de uso próprio)
-- Recolha de uso para análise de adoção a médio/longo prazo (logins, interações).
-- Escrita exclusivamente via service-role (server-side); leitura só admin.

create table public.activity_events (
  id          bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  -- Quem gerou o evento. ON DELETE SET NULL: ao apagar a conta, o evento
  -- mantém-se (pseudonimizado) para não falsear séries históricas.
  user_id     uuid references auth.users (id) on delete set null,
  -- Snapshot do papel na altura do evento (o papel pode mudar depois).
  role        public.user_role,
  -- Tipo de evento: 'login', 'boletim_viewed', 'appointment_requested', ...
  event_type  text not null,
  -- Entidade relacionada (opcional): 'service_record' | 'motorcycle' | 'appointment'.
  entity_type text,
  entity_id   uuid,
  -- Contexto extra livre (ex.: método de login, estado anterior, etc.).
  metadata    jsonb not null default '{}'::jsonb
);

create index idx_activity_events_occurred on public.activity_events (occurred_at desc);
create index idx_activity_events_user on public.activity_events (user_id);
create index idx_activity_events_type_time on public.activity_events (event_type, occurred_at desc);

alter table public.activity_events enable row level security;

-- Só o admin lê. NÃO existe policy de INSERT/UPDATE/DELETE de propósito: a
-- escrita faz-se apenas com a service-role key (server-side), que ignora RLS.
-- Assim nenhum cliente consegue inserir, ler ou alterar eventos de uso.
create policy "activity_events_select_admin"
  on public.activity_events for select
  using (public.is_admin());
