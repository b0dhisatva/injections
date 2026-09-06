-- Install before deploying the client update. Existing records are unchanged.
create or replace function public.save_injection(
  p_id uuid, p_injected_at timestamptz, p_route text, p_site text,
  p_notes text, p_doses jsonb
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  inserted_id uuid;
  expected_doses jsonb;
begin
  if auth.uid() is null then
    raise exception 'Sign in before saving an entry.';
  end if;
  if p_id is null or p_injected_at is null or not isfinite(p_injected_at) then
    raise exception 'Choose a valid date and time.';
  end if;
  if p_doses is null or jsonb_typeof(p_doses) <> 'array' then
    raise exception 'Add at least one compound.';
  end if;
  if jsonb_array_length(p_doses) = 0 then
    raise exception 'Add at least one compound.';
  end if;

  select jsonb_agg(jsonb_build_object('compound_id', d.compound_id,
    'amount', d.amount, 'unit', d.unit) order by d.compound_id)
  into expected_doses
  from jsonb_to_recordset(p_doses) as d(compound_id uuid, amount numeric(14,4), unit text);

  insert into public.injections (id, user_id, injected_at, route, site, notes)
  values (p_id, auth.uid(), p_injected_at, p_route, p_site, p_notes)
  on conflict (id) do nothing
  returning id into inserted_id;

  if inserted_id is null then
    -- A response can be lost after commit. Only acknowledge an exact retry.
    -- RLS still applies to both the parent and its compound rows.
    if exists (
      select 1 from public.injections i
      where i.id = p_id and i.user_id = auth.uid()
        and i.injected_at = p_injected_at and i.route = p_route
        and i.site = p_site and i.notes is not distinct from p_notes
        and (select jsonb_agg(jsonb_build_object('compound_id', d.compound_id,
          'amount', d.amount, 'unit', d.unit) order by d.compound_id)
          from public.injection_items d where d.injection_id = i.id) = expected_doses
    ) then
      return p_id;
    end if;
    raise exception 'This entry may already be saved with different details. Check history before logging another entry.';
  end if;

  insert into public.injection_items (injection_id, compound_id, amount, unit)
  select p_id, d.compound_id, d.amount, d.unit
  from jsonb_to_recordset(p_doses) as d(compound_id uuid, amount numeric(14,4), unit text);
  -- Any failed dose rolls back the whole call, never leaving a partial entry.
  return p_id;
end;
$$;

revoke all on function public.save_injection(uuid, timestamptz, text, text, text, jsonb) from public, anon;
grant execute on function public.save_injection(uuid, timestamptz, text, text, text, jsonb) to authenticated;
