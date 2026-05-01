create or replace function public.is_admin_user(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = user_id
      and profiles.is_admin = true
  );
$$;

revoke all on function public.is_admin_user(uuid) from public;
grant execute on function public.is_admin_user(uuid) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_admin_select'
  ) then
    create policy "profiles_admin_select"
    on public.profiles
    for select
    to authenticated
    using (public.is_admin_user(auth.uid()));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'matches_admin_select'
  ) then
    create policy "matches_admin_select"
    on public.matches
    for select
    to authenticated
    using (public.is_admin_user(auth.uid()));
  end if;
end $$;
