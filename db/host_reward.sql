-- Host Reward is separate from launch10. Only the server service role may access claims.
create table public.host_reward_claims (
 id bigint generated always as identity primary key,
 user_id uuid references public.profiles(id) on delete set null,
 match_id bigint references public.matches(id) on delete set null,
 comment_id bigint not null unique references public.discussion_comments(id),
 email text not null,
 status text not null default 'pending' check(status in ('pending','approved','paid','rejected','withdrawn')),
 submitted_at timestamptz not null default clock_timestamp(),
 reviewed_at timestamptz,
 paid_at timestamptz,
 reason text,
 payment_reference text,
 reviewed_by uuid references public.profiles(id) on delete set null,
 us_resident boolean not null check(us_resident),
 la_county boolean not null check(la_county),
 terms_version text not null default '2026-10-20'
);
create unique index host_reward_one_active_per_host on public.host_reward_claims(user_id) where status in ('pending','approved','paid');
create unique index host_reward_one_active_per_meetup on public.host_reward_claims(match_id) where status in ('pending','approved','paid');
alter table public.host_reward_claims enable row level security;
revoke all on public.host_reward_claims from anon, authenticated;
grant all on public.host_reward_claims to service_role;
grant usage,select on sequence public.host_reward_claims_id_seq to service_role;
alter table public.discussion_comments add column if not exists reward_program text check(reward_program is null or reward_program='host100');

create or replace function public.host_reward_eligibility(p_user uuid,p_match bigint)
returns text language plpgsql stable security invoker set search_path=public as $$
declare m public.matches%rowtype; p public.posts%rowtype; guest uuid; finish_at timestamptz;
begin
 select * into m from public.matches where id=p_match;
 if not found then return 'Meetup not found.'; end if;
 select * into p from public.posts where id=m.post_id;
 if not found or p.user_id is distinct from p_user or p_user not in (m.user_a,m.user_b) then return 'Only the host can apply.'; end if;
 if m.user_a=m.user_b then return 'A distinct guest is required.'; end if;
 if lower(trim(coalesce(m.status,''))) not in ('active','matched') or lower(coalesce(p.status,''))='cancelled' or coalesce(p.admin_hidden,false) then return 'This meetup is not eligible.'; end if;
 if not exists(select 1 from public.profiles where id=p_user and is_adult_confirmed=true) then return 'Confirm that you are 18 or older in your account first.'; end if;
 if p.meeting_time is null or p.meeting_time < timestamp '2026-10-20 00:00' or p.meeting_time >= timestamp '2026-12-01 00:00' then return 'The meetup must take place October 20–November 30, 2026 in LA County.'; end if;
 finish_at := (p.meeting_time at time zone 'America/Los_Angeles') + make_interval(mins=>greatest(coalesce(p.duration_minutes,60),1));
 if finish_at>now() then return 'Complete your meetup before applying.'; end if;
 guest:=case when m.user_a=p_user then m.user_b else m.user_a end;
 if not exists(select 1 from public.match_reviews where match_id=m.id and reviewer_user_id=p_user and reviewee_user_id=guest and showed_up=true) then return 'Your review must be complete and confirm your guest attended.'; end if;
 if not exists(select 1 from public.match_reviews where match_id=m.id and reviewer_user_id=guest and reviewee_user_id=p_user and showed_up=true) then return 'Your guest must complete their review and confirm you attended.'; end if;
 return null;
end $$;
revoke all on function public.host_reward_eligibility(uuid,bigint) from public,anon,authenticated;
grant execute on function public.host_reward_eligibility(uuid,bigint) to service_role;

create or replace function public.submit_host_reward(p_user uuid,p_match bigint,p_body text,p_email text,p_us boolean,p_la boolean)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare c public.host_reward_claims%rowtype; why text; comment bigint;
begin
 perform pg_advisory_xact_lock(hashtext('host100'));
 select * into c from public.host_reward_claims where user_id=p_user and status in ('pending','approved','paid') order by id limit 1;
 if found then return jsonb_build_object('id',c.id,'commentId',c.comment_id,'existing',true); end if;
 if now()<timestamptz '2026-10-20 00:00 America/Los_Angeles' or now()>=timestamptz '2026-12-01 00:00 America/Los_Angeles' then raise exception 'Applications are open October 20–November 30, 2026 (Pacific Time).'; end if;
 if p_us is distinct from true or p_la is distinct from true then raise exception 'Confirm U.S. residency and an LA County meetup.'; end if;
 if p_body is null or length(trim(p_body))<1 or length(trim(p_body))>2000 or coalesce(p_email,'')='' then raise exception 'Enter your honest experience (1–2,000 characters).'; end if;
 why:=public.host_reward_eligibility(p_user,p_match);
 if why is not null then raise exception '%',why; end if;
 if (select count(*) from public.host_reward_claims where status in ('pending','approved','paid'))>=10 then raise exception 'All 10 spots are approved or under review. Please check back if a claim is declined.'; end if;
 insert into public.discussion_comments(nickname,body,writer_key,reward_program)
 values('Host',trim(p_body),'host100:'||p_user::text,'host100') returning id into comment;
 insert into public.host_reward_claims(user_id,match_id,comment_id,email,us_resident,la_county)
 values(p_user,p_match,comment,p_email,true,true) returning * into c;
 return jsonb_build_object('id',c.id,'commentId',c.comment_id,'existing',false);
end $$;
revoke all on function public.submit_host_reward(uuid,bigint,text,text,boolean,boolean) from public,anon,authenticated;
grant execute on function public.submit_host_reward(uuid,bigint,text,text,boolean,boolean) to service_role;

create or replace function public.review_host_reward(p_admin uuid,p_id bigint,p_action text,p_reason text,p_verified boolean)
returns void language plpgsql security invoker set search_path=public as $$
declare c public.host_reward_claims%rowtype; why text;
begin
 if not exists(select 1 from public.profiles where id=p_admin and is_admin=true) then raise exception 'Forbidden'; end if;
 perform pg_advisory_xact_lock(hashtext('host100'));
 select * into c from public.host_reward_claims where id=p_id for update;
 if not found then raise exception 'Claim not found'; end if;
 if p_action='approve' and c.status='pending' then
  if p_verified is distinct from true then raise exception 'Verify residency, LA County location and one reward per person.'; end if;
  if exists(select 1 from public.host_reward_claims where status='pending' and (submitted_at,id)<(c.submitted_at,c.id)) then raise exception 'Review earlier pending claims first.'; end if;
  why:=public.host_reward_eligibility(c.user_id,c.match_id);
  if why is not null then raise exception '%',why; end if;
  if not exists(select 1 from public.discussion_comments where id=c.comment_id and deleted_at is null and hidden=false) then raise exception 'The experience is unavailable. Review this claim before approving.'; end if;
  if (select count(*) from public.host_reward_claims where status in ('approved','paid'))>=10 then raise exception 'All 10 rewards are approved.'; end if;
  update public.host_reward_claims set status='approved',reviewed_at=clock_timestamp(),reviewed_by=p_admin where id=p_id;
 elsif p_action='reject' and c.status='pending' then
  if length(trim(coalesce(p_reason,'')))<1 then raise exception 'Enter an objective eligibility reason.'; end if;
  update public.host_reward_claims set status='rejected',reason=left(trim(p_reason),1000),reviewed_at=clock_timestamp(),reviewed_by=p_admin where id=p_id;
 elsif p_action='paid' and c.status='approved' then
  if length(trim(coalesce(p_reason,'')))<1 then raise exception 'Enter the Tango payment reference.'; end if;
  update public.host_reward_claims set status='paid',paid_at=clock_timestamp(),payment_reference=left(trim(p_reason),200),reviewed_by=p_admin where id=p_id;
 else raise exception 'Invalid status transition.';
 end if;
end $$;
revoke all on function public.review_host_reward(uuid,bigint,text,text,boolean) from public,anon,authenticated;
grant execute on function public.review_host_reward(uuid,bigint,text,text,boolean) to service_role;

create or replace function public.withdraw_deleted_host_reward()
returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if new.deleted_at is not null and old.deleted_at is null then
  perform pg_advisory_xact_lock(hashtext('host100'));
  update public.host_reward_claims set status='withdrawn',reason='Experience deleted before approval.',reviewed_at=clock_timestamp()
   where comment_id=new.id and status='pending';
 end if;
 return new;
end $$;
revoke all on function public.withdraw_deleted_host_reward() from public,anon,authenticated;
grant execute on function public.withdraw_deleted_host_reward() to service_role;
create trigger withdraw_deleted_host_reward after update of deleted_at on public.discussion_comments
for each row execute function public.withdraw_deleted_host_reward();

