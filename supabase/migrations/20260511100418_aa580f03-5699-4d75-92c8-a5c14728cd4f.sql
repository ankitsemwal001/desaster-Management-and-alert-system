-- Set immutable search_path on the trigger helper
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

-- Revoke direct EXECUTE on SECURITY DEFINER helpers from public/auth roles.
-- They are still usable from RLS policies and server-side code that runs as the function owner.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.get_primary_role(uuid)        from public, anon, authenticated;
revoke execute on function public.handle_new_user()             from public, anon, authenticated;