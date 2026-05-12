-- Metadados do boletim: data do serviço, ordem de reparação, km, tipo de revisão.
-- Seed da lista global de tarefas quando a tabela está vazia (após limpeza ou instalação nova).

alter table public.service_records
  add column if not exists service_date date,
  add column if not exists repair_order_ref text,
  add column if not exists odometer_km integer,
  add column if not exists revision_type text;

comment on column public.service_records.service_date is
  'Data do serviço indicada pela oficina. Se null, a UI usa closed_at/opened_at.';
comment on column public.service_records.repair_order_ref is
  'Número da ordem de reparação.';
comment on column public.service_records.odometer_km is
  'Quilometragem no momento do serviço.';
comment on column public.service_records.revision_type is
  'Tipo de revisão (lista fechada).';

alter table public.service_records
  drop constraint if exists service_records_odometer_km_chk;

alter table public.service_records
  add constraint service_records_odometer_km_chk
  check (odometer_km is null or odometer_km >= 0);

alter table public.service_records
  drop constraint if exists service_records_revision_type_chk;

alter table public.service_records
  add constraint service_records_revision_type_chk
  check (
    revision_type is null
    or revision_type in (
      'Serviço Anual',
      'Serviço de Oleo',
      'Serviço Desmo',
      'Serviço de Verificação de Válvulas'
    )
  );

-- Lista padrão de tarefas (só quando não há linhas — evita duplicar em re-runs)
do $$
begin
  if not exists (select 1 from public.service_task_templates limit 1) then
    insert into public.service_task_templates (label, sort_order)
    values
      ('Substituição do kit de transmissão', 0),
      ('Substituição pastilhas travão frente', 1),
      ('Substituição pastilhas travão traseiro', 2),
      ('Substituição de óleo e filtro', 3),
      ('Substituição de filtro de ar', 4),
      ('Substituição de velas', 5),
      ('Substituição óleo de travões e embraiagem', 6),
      ('Substituição óleo de suspensão', 7),
      ('Substituição das correias de distribuição', 8);
  end if;
end $$;
