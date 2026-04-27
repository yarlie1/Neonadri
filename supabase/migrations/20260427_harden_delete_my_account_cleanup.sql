create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.mfa_amr_claims
  where session_id in (
    select id
    from auth.sessions
    where user_id = v_user_id
  );

  delete from auth.refresh_tokens
  where user_id = v_user_id;

  delete from auth.sessions
  where user_id = v_user_id;

  delete from auth.mfa_challenges
  where factor_id in (
    select id
    from auth.mfa_factors
    where user_id = v_user_id
  );

  delete from auth.mfa_factors
  where user_id = v_user_id;

  delete from auth.one_time_tokens
  where user_id = v_user_id;

  delete from auth.webauthn_challenges
  where user_id = v_user_id;

  delete from auth.webauthn_credentials
  where user_id = v_user_id;

  delete from auth.identities
  where user_id = v_user_id;

  delete from auth.users
  where id = v_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
