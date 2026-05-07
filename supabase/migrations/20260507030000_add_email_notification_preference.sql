alter table public.profiles
add column if not exists email_notifications_enabled boolean not null default true;

update public.profiles
set email_notifications_enabled = true
where email_notifications_enabled is null;
