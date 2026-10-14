-- Applied via add_discussion_author_deletion migration.
alter table public.discussion_comments add column if not exists deleted_at timestamptz;
