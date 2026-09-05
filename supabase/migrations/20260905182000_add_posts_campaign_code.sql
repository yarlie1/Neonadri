alter table public.posts
  add column if not exists campaign_code text;

create index if not exists posts_campaign_code_user_id_idx
  on public.posts (campaign_code, user_id)
  where campaign_code is not null;