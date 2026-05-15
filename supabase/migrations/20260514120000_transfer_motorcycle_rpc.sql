-- Transferência atómica de propriedade de motociclo.
--
-- Antes: a server action fazia 3 escritas separadas (fechar período aberto /
-- criar período histórico, abrir novo período, actualizar current_owner_id).
-- Uma falha a meio deixava o estado inconsistente. Esta função encapsula tudo
-- numa única transacção implícita e devolve o id do novo período.

create or replace function public.transfer_motorcycle(
  p_motorcycle_id uuid,
  p_new_owner_id uuid,
  p_transfer_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_owner uuid;
  v_created_at    timestamptz;
  v_open_period   uuid;
  v_now           timestamptz := now();
  v_new_period    uuid;
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;

  if p_motorcycle_id is null or p_new_owner_id is null then
    raise exception 'motorcycle_id and new_owner_id are required' using errcode = '22023';
  end if;

  select current_owner_id, created_at
    into v_current_owner, v_created_at
    from public.motorcycles
   where id = p_motorcycle_id
   for update;

  if v_current_owner is null then
    raise exception 'motorcycle not found' using errcode = 'P0002';
  end if;

  if v_current_owner = p_new_owner_id then
    raise exception 'new owner equals current owner' using errcode = '22023';
  end if;

  -- Fecha o período aberto actual (ou cria um período histórico fechado
  -- caso não exista — preserva compatibilidade com motas pré-migration).
  select id
    into v_open_period
    from public.motorcycle_ownership_periods
   where motorcycle_id = p_motorcycle_id
     and ended_at is null
   order by started_at desc
   limit 1;

  if v_open_period is not null then
    update public.motorcycle_ownership_periods
       set ended_at = v_now,
           transfer_note = p_transfer_note
     where id = v_open_period;
  else
    insert into public.motorcycle_ownership_periods (
      motorcycle_id, owner_id, started_at, ended_at, transfer_note
    ) values (
      p_motorcycle_id, v_current_owner, v_created_at, v_now, p_transfer_note
    );
  end if;

  insert into public.motorcycle_ownership_periods (
    motorcycle_id, owner_id, started_at, ended_at, transfer_note
  ) values (
    p_motorcycle_id, p_new_owner_id, v_now, null, null
  )
  returning id into v_new_period;

  update public.motorcycles
     set current_owner_id = p_new_owner_id
   where id = p_motorcycle_id;

  return v_new_period;
end;
$$;

revoke all on function public.transfer_motorcycle(uuid, uuid, text) from public;
grant execute on function public.transfer_motorcycle(uuid, uuid, text) to authenticated;
