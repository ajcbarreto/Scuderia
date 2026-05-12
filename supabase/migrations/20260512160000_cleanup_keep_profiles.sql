-- Limpeza da base de dados: remove dados operacionais e tabelas obsoletas.
-- MANTÉM: public.profiles (contas / ligação a auth.users) — NÃO apaga auth.users.
--
-- Ficheiros no Storage (bucket service-files) não são apagados aqui;
-- em Supabase → Storage → service-files, apaga manualmente se quiseres bucket vazio.

begin;

-- ---------------------------------------------------------------------------
-- Tabelas de presets (se a migração 20260512140000 ainda não tiver corrido)
-- ---------------------------------------------------------------------------
drop table if exists public.maintenance_checklist_preset_items cascade;
drop table if exists public.maintenance_checklist_presets cascade;

alter table public.service_records
  drop constraint if exists service_records_checklist_preset_id_fkey;

drop index if exists public.idx_service_records_checklist_preset;

alter table public.service_records
  drop column if exists checklist_preset_id;

-- ---------------------------------------------------------------------------
-- Dados: ordem segura com CASCADE (perfis intocados)
-- ---------------------------------------------------------------------------
truncate table
  public.service_attachments,
  public.service_tasks,
  public.service_records,
  public.appointment_requests,
  public.motorcycle_ownership_periods,
  public.motorcycles,
  public.motorcycle_catalog_entries
restart identity cascade;

-- Lista global de tarefas padrão (vazia após limpeza; só existe após 20260512140000)
do $$
begin
  if to_regclass('public.service_task_templates') is not null then
    execute 'truncate table public.service_task_templates restart identity';
  end if;
end $$;

commit;
