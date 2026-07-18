alter table public.posts
  add column if not exists admin_hidden boolean not null default false,
  add column if not exists admin_hidden_at timestamptz,
  add column if not exists admin_hidden_by uuid references public.profiles(id) on delete set null,
  add column if not exists admin_hidden_reason text;

create index if not exists posts_admin_hidden_idx
  on public.posts (admin_hidden);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'posts_admin_update_hidden'
  ) then
    create policy "posts_admin_update_hidden"
    on public.posts
    for update to authenticated
    using (public.is_admin_user(auth.uid()))
    with check (public.is_admin_user(auth.uid()));
  end if;
end $$;

grant select on public.posts to anon;
grant select, insert, update on public.posts to authenticated;
