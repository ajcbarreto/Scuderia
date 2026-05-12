-- Próxima revisão planead pelo serviço (km e/ou data), visível ao cliente no boletim.

alter table public.service_records
  add column if not exists next_service_due_date date,
  add column if not exists next_service_due_km integer;

comment on column public.service_records.next_service_due_date is
  'Data limite ou alvo sugerido para a próxima revisão (oficina).';
comment on column public.service_records.next_service_due_km is
  'Quilometragem alvo sugerida para a próxima revisão.';

alter table public.service_records
  drop constraint if exists service_records_next_service_due_km_chk;

alter table public.service_records
  add constraint service_records_next_service_due_km_chk
  check (next_service_due_km is null or next_service_due_km >= 0);
