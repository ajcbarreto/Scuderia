-- Lembretes de próxima revisão: regista cada email enviado para um boletim
-- num determinado limiar (30/14/7 dias antes de `next_service_due_date`).
-- A constraint única `(service_record_id, days_before)` garante que o cron
-- nunca duplica o mesmo lembrete, mesmo que corra várias vezes no dia.

create table public.service_reminders (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null
    references public.service_records (id) on delete cascade,
  days_before int not null,
  sent_at timestamptz not null default now(),
  unique (service_record_id, days_before)
);

create index idx_service_reminders_record
  on public.service_reminders (service_record_id);

alter table public.service_reminders enable row level security;

-- Só admin lê (ex.: debug no backoffice). A escrita é feita pelo cron com a
-- service-role key, que ignora RLS — não precisa de policy de insert.
create policy "service_reminders_select_admin"
  on public.service_reminders for select
  using (public.is_admin());
