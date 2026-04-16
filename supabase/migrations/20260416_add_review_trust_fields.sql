alter table public.match_reviews
add column if not exists showed_up boolean,
add column if not exists host_paid_benefit boolean,
add column if not exists reviewee_is_host boolean;

update public.match_reviews mr
set reviewee_is_host = (p.user_id = mr.reviewee_user_id)
from public.matches m
join public.posts p on p.id = m.post_id
where mr.match_id = m.id
  and mr.reviewee_is_host is null;
