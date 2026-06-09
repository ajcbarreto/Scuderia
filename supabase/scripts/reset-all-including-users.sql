-- Apaga TODOS os dados operacionais e TODAS as contas (auth.users + profiles).
-- MANTÉM: service_task_templates (tarefas padrão), motorcycle_catalog_entries (catálogo),
--         workshop_settings (horário da oficina).
-- Depois corre scripts/create-admin.mjs para criar o admin.
--
-- Executar no Supabase → SQL Editor.
-- ATENÇÃO: irreversível. Confirma que estás no projeto certo antes de correr.
--
-- Storage (bucket service-files): apaga manualmente em Supabase → Storage.

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

-- profiles tem FK para auth.users com ON DELETE CASCADE — apagar users limpa perfis.
delete from auth.users;

commit;
