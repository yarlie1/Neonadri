create table public.chat_message_reads (
  chat_id uuid not null references public.match_chats(id) on delete cascade,
  reader_id uuid not null references auth.users(id) on delete cascade,
  message_id text not null check (message_id ~ '^[0-9]{15,20}$'),
  read_at timestamptz not null default now(),
  primary key (chat_id, reader_id, message_id)
);
alter table public.chat_message_reads enable row level security;
revoke all on public.chat_message_reads from anon, authenticated;
grant select, insert on public.chat_message_reads to authenticated;
create policy chat_reads_select_participants on public.chat_message_reads
for select to authenticated using (
  exists (select 1 from public.match_chats c where c.id = chat_id
    and (c.host_user_id = (select auth.uid()) or c.guest_user_id = (select auth.uid())))
);
create policy chat_reads_insert_self on public.chat_message_reads
for insert to authenticated with check (
  reader_id = (select auth.uid()) and
  exists (select 1 from public.match_chats c where c.id = chat_id
    and (c.host_user_id = (select auth.uid()) or c.guest_user_id = (select auth.uid())))
);

