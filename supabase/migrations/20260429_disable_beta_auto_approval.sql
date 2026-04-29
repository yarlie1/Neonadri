drop function if exists public.submit_beta_application(text, text, text, text, text, text, text[], text);

create or replace function public.submit_beta_application(
  p_email text,
  p_full_name text,
  p_city text,
  p_age_group text,
  p_gender text,
  p_motivation text,
  p_meetup_interests text[],
  p_availability text
)
returns table(
  application_id bigint,
  application_status text,
  send_approval_email boolean,
  daily_limit_reached boolean,
  daily_approved_count integer,
  daily_remaining integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_now timestamptz := timezone('utc', now());
  v_application_id bigint;
  v_existing_status text;
begin
  select status
  into v_existing_status
  from public.beta_applications
  where email_normalized = v_email
  for update;

  if v_existing_status = 'approved' then
    return query
    select
      id,
      'approved'::text,
      false,
      false,
      0,
      0
    from public.beta_applications
    where email_normalized = v_email
    limit 1;
    return;
  end if;

  insert into public.beta_applications (
    email,
    full_name,
    city,
    age_group,
    gender,
    motivation,
    meetup_interests,
    availability,
    status,
    reviewed_at,
    reviewed_by_user_id,
    updated_at
  )
  values (
    v_email,
    nullif(trim(coalesce(p_full_name, '')), ''),
    nullif(trim(coalesce(p_city, '')), ''),
    nullif(trim(coalesce(p_age_group, '')), ''),
    nullif(trim(coalesce(p_gender, '')), ''),
    trim(coalesce(p_motivation, '')),
    coalesce(p_meetup_interests, '{}'::text[]),
    nullif(trim(coalesce(p_availability, '')), ''),
    'pending',
    null,
    null,
    v_now
  )
  on conflict (email_normalized)
  do update
    set full_name = excluded.full_name,
        city = excluded.city,
        age_group = excluded.age_group,
        gender = excluded.gender,
        motivation = excluded.motivation,
        meetup_interests = excluded.meetup_interests,
        availability = excluded.availability,
        status = case
          when public.beta_applications.status = 'approved' then 'approved'
          else 'pending'
        end,
        reviewed_at = case
          when public.beta_applications.status = 'approved' then public.beta_applications.reviewed_at
          else null
        end,
        reviewed_by_user_id = case
          when public.beta_applications.status = 'approved' then public.beta_applications.reviewed_by_user_id
          else null
        end,
        updated_at = v_now
  returning id into v_application_id;

  return query
  select
    v_application_id,
    'pending'::text,
    false,
    false,
    0,
    0;
end;
$$;

grant execute on function public.submit_beta_application(text, text, text, text, text, text, text[], text) to anon, authenticated;
