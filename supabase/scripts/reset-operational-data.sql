-- Apaga dados operacionais (motos de clientes, boletins, agendamentos, etc.)
-- MANTÉM: auth.users, public.profiles, workshop_settings (horário da oficina),
--         service_task_templates (tarefas padrão), motorcycle_catalog_entries (catálogo).
--
-- Executar no Supabase → SQL Editor (projeto de produção ou staging).
-- Ficheiros no Storage (bucket service-files) não são apagados aqui;
-- em Storage → service-files, apaga manualmente se quiseres bucket vazio.

begin;

truncate table
  public.service_reminders,
  public.service_attachments,
  public.service_tasks,
  public.service_records,
  public.appointment_requests,
  public.motorcycle_ownership_periods,
  public.motorcycles
restart identity cascade;

do $$
begin
  if to_regclass('public.maintenance_checklist_preset_items') is not null then
    execute 'truncate table public.maintenance_checklist_preset_items restart identity cascade';
  end if;
  if to_regclass('public.maintenance_checklist_presets') is not null then
    execute 'truncate table public.maintenance_checklist_presets restart identity cascade';
  end if;
  if to_regclass('public.workshop_closed_dates') is not null then
    execute 'truncate table public.workshop_closed_dates restart identity cascade';
  end if;
end $$;

commit;
