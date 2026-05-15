-- Workflow de agendamentos: a oficina passa de "uma data preferida pelo cliente"
-- para um pedido com estado actionável (confirmar/rejeitar/concluir, com data
-- aceite e nota interna).
--
-- O cliente pode ler `confirmed_start` e `admin_note` (transparência), mas
-- só admin escreve neles — alinhado com as RLS existentes.

alter table public.appointment_requests
  add column if not exists confirmed_start timestamptz,
  add column if not exists confirmed_at    timestamptz,
  add column if not exists admin_note      text;

comment on column public.appointment_requests.confirmed_start is
  'Data/hora aceite pela oficina (pode diferir de preferred_start).';
comment on column public.appointment_requests.confirmed_at is
  'Momento em que a oficina confirmou o agendamento.';
comment on column public.appointment_requests.admin_note is
  'Nota interna da oficina, visível ao cliente (ex.: "Traz a chave de reserva").';

-- Índice que acelera o painel do admin (a vista listada por estado / data).
create index if not exists idx_appointment_requests_status_created
  on public.appointment_requests (status, created_at desc);

-- Índice para puxar rapidamente os agendamentos abertos de um cliente.
create index if not exists idx_appointment_requests_client_status
  on public.appointment_requests (client_id, status);

-- Política UPDATE para admin já existe (`appointments_update_admin`); confirma
-- que está activa e cobre os novos campos.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'appointment_requests'
      and policyname = 'appointments_update_admin'
  ) then
    create policy "appointments_update_admin"
      on public.appointment_requests for update
      using (public.is_admin());
  end if;
end $$;
