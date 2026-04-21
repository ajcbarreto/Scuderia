-- Bucket privado para faturas/fotos (criar bucket se ainda não existir)
insert into storage.buckets (id, name, public)
values ('service-files', 'service-files', false)
on conflict (id) do nothing;

-- Leitura: admin ou dono do ficheiro (path prefix user id — convencão: {profile_id}/...)
create policy "service_files_select"
  on storage.objects for select
  using (
    bucket_id = 'service-files'
    and (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy "service_files_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'service-files'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "service_files_update_admin"
  on storage.objects for update
  using (
    bucket_id = 'service-files'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "service_files_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'service-files'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
