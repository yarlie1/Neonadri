update public.matches
set status = 'active'
where lower(coalesce(status, '')) = 'matched';

create or replace function public.get_or_create_match_chat_for_viewer(
  p_match_id bigint
)
returns public.match_chats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_match public.matches%rowtype;
  v_post public.posts%rowtype;
  v_host_user_id uuid;
  v_guest_user_id uuid;
  v_chat public.match_chats%rowtype;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    raise exception 'Match not found';
  end if;

  if lower(coalesce(v_match.status, '')) <> 'active' then
    raise exception 'Match is not ready for chat';
  end if;

  select *
  into v_post
  from public.posts
  where id = v_match.post_id;

  if not found then
    raise exception 'Post not found';
  end if;

  v_host_user_id := v_post.user_id;
  v_guest_user_id := case
    when v_match.user_a = v_host_user_id then v_match.user_b
    else v_match.user_a
  end;

  if v_uid <> v_host_user_id and v_uid <> v_guest_user_id then
    raise exception 'Not authorized for this chat';
  end if;

  select *
  into v_chat
  from public.match_chats
  where match_id = p_match_id;

  if found then
    return v_chat;
  end if;

  insert into public.match_chats (
    match_id,
    provider,
    external_room_id,
    host_user_id,
    guest_user_id
  )
  values (
    p_match_id,
    'pubnub',
    'match:' || p_match_id::text,
    v_host_user_id,
    v_guest_user_id
  )
  returning *
  into v_chat;

  return v_chat;
end;
$$;
