create table if not exists public.discussion_comments (
 id bigint generated always as identity primary key,
 nickname text not null check (char_length(nickname) between 1 and 40),
 body text not null check (char_length(body) between 1 and 2000),
 parent_id bigint references public.discussion_comments(id),
 writer_key text not null,
 hidden boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists discussion_comments_writer_time on public.discussion_comments(writer_key,created_at);
alter table public.discussion_comments enable row level security;
revoke all on public.discussion_comments from anon,authenticated;
grant all on public.discussion_comments to service_role;
grant usage,select on sequence public.discussion_comments_id_seq to service_role;
create or replace function public.submit_discussion_comment(p_nickname text,p_body text,p_parent_id bigint,p_writer_key text)
returns bigint language plpgsql security invoker set search_path=public as $$
declare new_id bigint;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_writer_key,0));
 if exists(select 1 from discussion_comments where writer_key=p_writer_key and created_at>now()-interval '60 seconds')
 or (select count(*) from discussion_comments where writer_key=p_writer_key and created_at>now()-interval '24 hours')>=20 then
   raise exception 'discussion_rate_limit';
 end if;
 if p_parent_id is not null and not exists(select 1 from discussion_comments where id=p_parent_id and hidden=false) then
   raise exception 'discussion_parent_unavailable';
 end if;
 insert into discussion_comments(nickname,body,parent_id,writer_key)
 values(p_nickname,p_body,p_parent_id,p_writer_key) returning id into new_id;
 return new_id;
end $$;
revoke all on function public.submit_discussion_comment(text,text,bigint,text) from public,anon,authenticated;
grant execute on function public.submit_discussion_comment(text,text,bigint,text) to service_role;
