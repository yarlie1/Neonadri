alter function public.accept_match_request(bigint)
set search_path = public;

alter function public.reject_match_request(bigint)
set search_path = public;

alter function public.get_profile_stats(uuid)
set search_path = public;

alter function public.can_insert_match_review(bigint, uuid, uuid)
set search_path = public;

revoke execute on function public.accept_match_request(bigint) from public, anon;
grant execute on function public.accept_match_request(bigint) to authenticated;

revoke execute on function public.reject_match_request(bigint) from public, anon;
grant execute on function public.reject_match_request(bigint) to authenticated;

revoke execute on function public.get_or_create_match_chat_for_viewer(bigint) from public, anon;
grant execute on function public.get_or_create_match_chat_for_viewer(bigint) to authenticated;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "beta applications insert" on public.beta_applications;
