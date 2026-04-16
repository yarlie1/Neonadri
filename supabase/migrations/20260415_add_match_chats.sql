create table if not exists public.match_chats (
  id uuid primary key default gen_random_uuid(),
  match_id bigint not null unique references public.matches(id) on delete cascade,
  provider text not null default 'pubnub',
  external_room_id text not null unique,
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  guest_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_chat_activity_at timestamptz,
  last_seen_by_host_at timestamptz,
  last_seen_by_guest_at timestamptz,
  closed_at timestamptz
);

create index if not exists match_chats_host_user_id_idx
  on public.match_chats (host_user_id);

create index if not exists match_chats_guest_user_id_idx
  on public.match_chats (guest_user_id);
