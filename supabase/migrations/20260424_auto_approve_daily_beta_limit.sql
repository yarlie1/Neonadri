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
  v_local_date date := (now() at time zone 'America/Los_Angeles')::date;
  v_window_start timestamptz := (v_local_date::timestamp at time zone 'America/Los_Angeles');
  v_window_end timestamptz := ((v_local_date + 1)::timestamp at time zone 'America/Los_Angeles');
  v_daily_limit integer := 10;
  v_daily_count integer := 0;
  v_application_id bigint;
  v_existing_id bigint;
  v_existing_status text;
begin
  perform pg_advisory_xact_lock(hashtext('beta_daily_limit:' || v_local_date::text));

  select id, status
  into v_existing_id, v_existing_status
  from public.beta_applications
  where email_normalized = v_email
  for update;

  if v_existing_status = 'approved' then
    insert into public.beta_allowlist (
      email,
      source_application_id,
      approved_by_user_id,
      active,
      notes,
      approved_at,
      created_at,
      updated_at
    )
    values (
      v_email,
      v_existing_id,
      null,
      true,
      null,
      coalesce(
        (select reviewed_at from public.beta_applications where id = v_existing_id),
        v_now
      ),
      v_now,
      v_now
    )
    on conflict (email_normalized)
    do update
      set source_application_id = excluded.source_application_id,
          active = true,
          updated_at = v_now;

    select count(*)::integer
    into v_daily_count
    from public.beta_applications
    where status = 'approved'
      and reviewed_at >= v_window_start
      and reviewed_at < v_window_end;

    return query
    select
      v_existing_id,
      'approved'::text,
      false,
      false,
      v_daily_count,
      greatest(0, v_daily_limit - v_daily_count);
    return;
  end if;

  select count(*)::integer
  into v_daily_count
  from public.beta_applications
  where status = 'approved'
    and reviewed_at >= v_window_start
    and reviewed_at < v_window_end;

  if v_daily_count >= v_daily_limit then
    return query
    select
      v_existing_id,
      'daily_full'::text,
      false,
      true,
      v_daily_count,
      0;
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
    'approved',
    v_now,
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
        status = 'approved',
        reviewed_at = v_now,
        reviewed_by_user_id = null,
        updated_at = v_now
  returning id into v_application_id;

  insert into public.beta_allowlist (
    email,
    source_application_id,
    approved_by_user_id,
    active,
    notes,
    approved_at,
    created_at,
    updated_at
  )
  values (
    v_email,
    v_application_id,
    null,
    true,
    null,
    v_now,
    v_now,
    v_now
  )
  on conflict (email_normalized)
  do update
    set source_application_id = excluded.source_application_id,
        approved_by_user_id = null,
        active = true,
        notes = null,
        approved_at = v_now,
        updated_at = v_now;

  v_daily_count := v_daily_count + 1;

  return query
  select
    v_application_id,
    'approved'::text,
    true,
    false,
    v_daily_count,
    greatest(0, v_daily_limit - v_daily_count);
end;
$$;

grant execute on function public.submit_beta_application(text, text, text, text, text, text, text[], text) to anon, authenticated;
