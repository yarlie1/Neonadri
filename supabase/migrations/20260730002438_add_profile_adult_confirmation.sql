alter table public.profiles
  add column if not exists is_adult_confirmed boolean not null default false,
  add column if not exists age_gate_confirmed_at timestamptz;

update public.profiles p
set
  is_adult_confirmed = true,
  age_gate_confirmed_at = coalesce(p.age_gate_confirmed_at, now())
from auth.users u
where u.id = p.id
  and u.raw_user_meta_data ->> 'is_adult_confirmed' = 'true'
  and p.is_adult_confirmed = false;

revoke insert, update on public.profiles from authenticated;

grant insert (
  id,
  display_name,
  username,
  bio,
  about_me,
  avatar_url,
  gender,
  age_group,
  preferred_area,
  languages,
  meeting_style,
  interests,
  response_time_note,
  signup_intent,
  email_notifications_enabled
) on public.profiles to authenticated;

grant update (
  display_name,
  username,
  bio,
  about_me,
  avatar_url,
  gender,
  age_group,
  preferred_area,
  languages,
  meeting_style,
  interests,
  response_time_note,
  signup_intent,
  email_notifications_enabled,
  updated_at
) on public.profiles to authenticated;
