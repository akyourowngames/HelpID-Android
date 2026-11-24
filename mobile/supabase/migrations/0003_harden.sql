-- Explicitly deny client access to server-only tables and pin the trigger
-- function search path (silences Supabase lint WARNs).

drop policy if exists "service_role_only" on public.app_secrets;
create policy "service_role_only"
  on public.app_secrets for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "service_role_only" on public.public_keys;
create policy "service_role_only"
  on public.public_keys for all
  to anon, authenticated
  using (false)
  with check (false);

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.last_updated = now();
  return new;
end;
$$;
