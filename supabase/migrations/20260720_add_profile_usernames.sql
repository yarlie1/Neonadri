alter table public.profiles
  add column if not exists username text;

alter table public.profiles
  drop constraint if exists profiles_username_format_check;

alter table public.profiles
  add constraint profiles_username_format_check
  check (username is null or username ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

create unique index if not exists profiles_username_unique_idx
  on public.profiles (username)
  where username is not null;

do $$
declare
  profile_record record;
  base_username text;
  candidate_username text;
  suffix integer;
begin
  for profile_record in
    select id, display_name
    from public.profiles
    where username is null
    order by created_at nulls last, id
  loop
    base_username := lower(coalesce(profile_record.display_name, ''));
    base_username := regexp_replace(base_username, '[^a-z0-9]+', '-', 'g');
    base_username := regexp_replace(base_username, '(^-+|-+$)', '', 'g');
    base_username := left(base_username, 32);
    base_username := regexp_replace(base_username, '-+$', '', 'g');

    if base_username = '' then
      base_username := 'user-' || left(replace(profile_record.id::text, '-', ''), 10);
    end if;

    if base_username in (
      'account', 'admin', 'api', 'beta', 'chats', 'community', 'dashboard',
      'faq', 'login', 'logout', 'map', 'posts', 'privacy', 'profile',
      'reviews', 'signup', 'terms', 'write'
    ) then
      base_username := 'user-' || base_username;
    end if;

    candidate_username := base_username;
    suffix := 2;

    while exists (
      select 1
      from public.profiles
      where username = candidate_username
        and id <> profile_record.id
    ) loop
      candidate_username := left(base_username || '-' || suffix::text, 40);
      candidate_username := regexp_replace(candidate_username, '-+$', '', 'g');
      suffix := suffix + 1;
    end loop;

    update public.profiles
    set username = candidate_username
    where id = profile_record.id;
  end loop;
end $$;

grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
