alter table public.profiles
add column if not exists is_admin boolean not null default false;

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('user', 'post', 'chat')),
  target_id text not null,
  reason text not null check (
    reason in (
      'spam',
      'harassment',
      'unsafe_behavior',
      'fake_or_misleading',
      'bad_meetup_conduct',
      'other'
    )
  ),
  detail text,
  status text not null default 'open' check (
    status in ('open', 'reviewing', 'resolved', 'dismissed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blocked_users (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, blocked_user_id),
  check (user_id <> blocked_user_id)
);

create index if not exists reports_reporter_user_id_idx
  on public.reports (reporter_user_id);

create index if not exists reports_status_idx
  on public.reports (status);

create index if not exists blocked_users_user_id_idx
  on public.blocked_users (user_id);

create index if not exists blocked_users_blocked_user_id_idx
  on public.blocked_users (blocked_user_id);

grant select, insert, update, delete on table public.reports to authenticated;
grant usage, select on sequence public.reports_id_seq to authenticated;
grant select, insert, delete on table public.blocked_users to authenticated;
grant usage, select on sequence public.blocked_users_id_seq to authenticated;

alter table public.reports enable row level security;
alter table public.blocked_users enable row level security;

create policy "reports_insert_own"
on public.reports
for insert
to authenticated
with check (auth.uid() = reporter_user_id);

create policy "reports_select_own"
on public.reports
for select
to authenticated
using (auth.uid() = reporter_user_id);

create policy "reports_admin_select"
on public.reports
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

create policy "reports_admin_update"
on public.reports
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  )
);

create policy "blocked_users_insert_own"
on public.blocked_users
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "blocked_users_select_own"
on public.blocked_users
for select
to authenticated
using (auth.uid() = user_id);

create policy "blocked_users_delete_own"
on public.blocked_users
for delete
to authenticated
using (auth.uid() = user_id);
