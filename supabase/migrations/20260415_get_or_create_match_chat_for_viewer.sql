create or replace function public.get_or_create_match_chat_for_viewer(p_match_id bigint)
returns public.match_chats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches%rowtype;
  v_post_owner_id uuid;
  v_host_user_id uuid;
  v_guest_user_id uuid;
  v_chat public.match_chats%rowtype;
  v_viewer_id uuid;
begin
  v_viewer_id := auth.uid();

  if v_viewer_id is null then
    raise exception 'MATCH_CHAT_UNAUTHORIZED';
  end if;

  select *
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'MATCH_NOT_FOUND';
  end if;

  if v_match.status <> 'matched' then
    raise exception 'MATCH_NOT_READY';
  end if;

  select user_id
  into v_post_owner_id
  from public.posts
  where id = v_match.post_id;

  if v_post_owner_id is null then
    raise exception 'POST_NOT_FOUND';
  end if;

  v_host_user_id := v_post_owner_id;
  if v_match.user_a = v_host_user_id then
    v_guest_user_id := v_match.user_b;
  else
    v_guest_user_id := v_match.user_a;
  end if;

  if v_viewer_id <> v_host_user_id and v_viewer_id <> v_guest_user_id then
    raise exception 'MATCH_FORBIDDEN';
  end if;

  select *
  into v_chat
  from public.match_chats
  where match_id = v_match.id;

  if not found then
    insert into public.match_chats (
      match_id,
      provider,
      external_room_id,
      host_user_id,
      guest_user_id
    )
    values (
      v_match.id,
      'pubnub',
      'match-chat-' || v_match.id || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 14),
      v_host_user_id,
      v_guest_user_id
    )
    returning *
    into v_chat;
  end if;

  update public.match_chats
  set
    updated_at = now(),
    last_seen_by_host_at = case when v_viewer_id = v_host_user_id then now() else last_seen_by_host_at end,
    last_seen_by_guest_at = case when v_viewer_id = v_guest_user_id then now() else last_seen_by_guest_at end
  where id = v_chat.id
  returning *
  into v_chat;

  return v_chat;
end;
$$;

grant execute on function public.get_or_create_match_chat_for_viewer(bigint) to authenticated;
