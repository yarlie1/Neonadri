alter table public.profiles
add column if not exists signup_intent text not null default 'guest';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_signup_intent_check'
  ) then
    alter table public.profiles
    add constraint profiles_signup_intent_check
    check (signup_intent in ('guest', 'host'));
  end if;
end
$$;
