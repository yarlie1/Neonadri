grant select, insert, update on table public.match_chats to authenticated;

alter table public.match_chats enable row level security;

create policy "match_chats_select_participants"
on public.match_chats
for select
to authenticated
using (auth.uid() = host_user_id or auth.uid() = guest_user_id);

create policy "match_chats_insert_participants"
on public.match_chats
for insert
to authenticated
with check (auth.uid() = host_user_id or auth.uid() = guest_user_id);

create policy "match_chats_update_participants"
on public.match_chats
for update
to authenticated
using (auth.uid() = host_user_id or auth.uid() = guest_user_id)
with check (auth.uid() = host_user_id or auth.uid() = guest_user_id);
