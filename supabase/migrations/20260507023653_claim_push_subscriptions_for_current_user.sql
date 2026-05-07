create or replace function public.save_push_subscription_for_current_user(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'PUSH_SUBSCRIPTION_UNAUTHORIZED';
  end if;

  insert into public.push_subscriptions (
    user_id,
    endpoint,
    p256dh,
    auth,
    user_agent,
    updated_at,
    last_error_at
  )
  values (
    v_user_id,
    p_endpoint,
    p_p256dh,
    p_auth,
    p_user_agent,
    now(),
    null
  )
  on conflict (endpoint) do update
  set
    user_id = excluded.user_id,
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    user_agent = excluded.user_agent,
    updated_at = now(),
    last_error_at = null;
end;
$$;

create or replace function public.delete_push_subscription_for_current_user(
  p_endpoint text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'PUSH_SUBSCRIPTION_UNAUTHORIZED';
  end if;

  delete from public.push_subscriptions
  where user_id = v_user_id
    and endpoint = p_endpoint;
end;
$$;

revoke all on function public.save_push_subscription_for_current_user(text, text, text, text) from public, anon;
grant execute on function public.save_push_subscription_for_current_user(text, text, text, text) to authenticated;

revoke all on function public.delete_push_subscription_for_current_user(text) from public, anon;
grant execute on function public.delete_push_subscription_for_current_user(text) to authenticated;
