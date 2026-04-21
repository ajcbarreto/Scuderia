-- Leitura Storage: clientes com ficheiros ligados em service_attachments (sem exigir pasta {uid}/...)
-- Mantém admin e a convenção legada (foldername = uid) para compatibilidade.

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
          )
        )
      )
    )
  );
