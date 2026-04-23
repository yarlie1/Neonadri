alter table public.posts
  add column if not exists status text,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by_user_id uuid references auth.users(id) on delete set null;

update public.posts
set status = 'open'
where status is null;

alter table public.posts
  alter column status set default 'open',
  alter column status set not null;

alter table public.posts
  drop constraint if exists posts_status_check;

alter table public.posts
  add constraint posts_status_check
  check (status in ('open', 'cancelled'));

create index if not exists posts_status_idx on public.posts (status);
