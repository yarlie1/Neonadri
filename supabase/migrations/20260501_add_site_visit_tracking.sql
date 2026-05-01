create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  path text not null default '/',
  created_at timestamptz not null default now()
);

create index if not exists site_visits_created_at_idx
  on public.site_visits (created_at desc);

create index if not exists site_visits_visitor_id_idx
  on public.site_visits (visitor_id);

alter table public.site_visits enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'site_visits'
      and policyname = 'site_visits_insert_anyone'
  ) then
    create policy "site_visits_insert_anyone"
    on public.site_visits
    for insert
    to anon, authenticated
    with check (user_id is null or auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'site_visits'
      and policyname = 'site_visits_admin_select'
  ) then
    create policy "site_visits_admin_select"
    on public.site_visits
    for select
    to authenticated
    using (public.is_admin_user(auth.uid()));
  end if;
end $$;
