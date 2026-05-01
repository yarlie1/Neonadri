drop policy if exists "site_visits_insert_anyone" on public.site_visits;

create policy "site_visits_insert_anyone"
on public.site_visits
for insert
to anon, authenticated
with check (user_id is null or auth.uid() = user_id);
