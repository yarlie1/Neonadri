create table if not exists public.meetup_cancellation_feedback (
  id bigint generated always as identity primary key,
  match_id bigint not null references public.matches(id) on delete cascade,
  post_id bigint not null references public.posts(id) on delete cascade,
  cancelled_by_user_id uuid not null references auth.users(id) on delete cascade,
  feedback_user_id uuid not null references auth.users(id) on delete cascade,
  feedback_type text not null check (
    feedback_type in (
      'reasonable_notice',
      'last_minute',
      'no_explanation',
      'unreliable',
      'safety_concern',
      'other'
    )
  ),
  note text,
  created_at timestamptz not null default now(),
  unique (match_id, feedback_user_id)
);

create index if not exists meetup_cancellation_feedback_match_id_idx
  on public.meetup_cancellation_feedback (match_id);

create index if not exists meetup_cancellation_feedback_feedback_user_id_idx
  on public.meetup_cancellation_feedback (feedback_user_id);

alter table public.meetup_cancellation_feedback enable row level security;

grant select, insert on public.meetup_cancellation_feedback to authenticated;
grant usage, select on sequence public.meetup_cancellation_feedback_id_seq to authenticated;

create policy "meetup_cancellation_feedback_select_own"
on public.meetup_cancellation_feedback
for select
to authenticated
using (auth.uid() = feedback_user_id);

create policy "meetup_cancellation_feedback_insert_own"
on public.meetup_cancellation_feedback
for insert
to authenticated
with check (auth.uid() = feedback_user_id);
