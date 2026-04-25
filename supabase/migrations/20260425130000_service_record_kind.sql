-- Tipo de intervenção: manutenção (passa à garagem do dono atual) vs serviço de oficina
-- (só admin — não aparece ao cliente; útil após transferência de propriedade).

create type public.service_record_kind as enum ('maintenance', 'shop_service');

alter table public.service_records
  add column record_kind public.service_record_kind not null default 'maintenance';

comment on column public.service_records.record_kind is
  'maintenance: visível na garagem do dono atual. shop_service: só oficina, oculto ao cliente.';

create index idx_service_records_record_kind on public.service_records (record_kind);

-- RLS: dono atual da mota só lê boletins de manutenção
drop policy if exists "service_records_select" on public.service_records;

create policy "service_records_select"
  on public.service_records for select
  using (
    public.is_admin()
    or (
      exists (
        select 1 from public.motorcycles m
        where m.id = motorcycle_id and m.current_owner_id = auth.uid()
      )
      and record_kind = 'maintenance'
    )
  );

drop policy if exists "service_tasks_select" on public.service_tasks;

create policy "service_tasks_select"
  on public.service_tasks for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.service_records sr
      join public.motorcycles m on m.id = sr.motorcycle_id
      where sr.id = service_record_id
        and m.current_owner_id = auth.uid()
        and sr.record_kind = 'maintenance'
    )
  );

drop policy if exists "attachments_select" on public.service_attachments;

create policy "attachments_select"
  on public.service_attachments for select
  using (
    public.is_admin()
    or (
      kind = 'invoice'
      and visible_to_owner_id = auth.uid()
    )
    or (
      kind <> 'invoice'
      and exists (
        select 1
        from public.service_records sr
        join public.motorcycles m on m.id = sr.motorcycle_id
        where sr.id = service_record_id
          and m.current_owner_id = auth.uid()
          and sr.record_kind = 'maintenance'
      )
    )
  );

-- Storage: fotos/outros do boletim seguem a mesma regra que attachments_select
drop policy if exists "service_files_select" on storage.objects;

create policy "service_files_select"
  on storage.objects for select
  using (
    bucket_id = 'service-files'
    and (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
      or (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.service_attachments sa
        join public.service_records sr on sr.id = sa.service_record_id
        join public.motorcycles m on m.id = sr.motorcycle_id
        where sa.storage_bucket = 'service-files'
          and sa.storage_path = name
          and (
            (
              sa.kind = 'invoice'
              and sa.visible_to_owner_id is not null
              and sa.visible_to_owner_id = auth.uid()
            )
            or (
              sa.kind <> 'invoice'
              and m.current_owner_id = auth.uid()
              and sr.record_kind = 'maintenance'
            )
          )
      )
    )
  );
