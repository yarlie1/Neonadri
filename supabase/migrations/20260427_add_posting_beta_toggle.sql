create table if not exists public.app_settings (
  setting_key text primary key,
  bool_value boolean,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by_user_id uuid
);

insert into public.app_settings (setting_key, bool_value)
values ('posting_beta_required', true)
on conflict (setting_key) do nothing;

create or replace function public.is_posting_beta_required()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select bool_value
      from public.app_settings
      where setting_key = 'posting_beta_required'
    ),
    true
  );
$$;

grant execute on function public.is_posting_beta_required() to anon, authenticated;

alter table public.app_settings enable row level security;

create policy "app settings admin select"
on public.app_settings
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

create policy "app settings admin insert"
on public.app_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

create policy "app settings admin update"
on public.app_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);
