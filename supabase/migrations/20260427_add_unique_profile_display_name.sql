create unique index if not exists profiles_display_name_lower_unique
on public.profiles (lower(display_name))
where display_name is not null;
