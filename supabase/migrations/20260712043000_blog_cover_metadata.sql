alter table public.blogs
  add column if not exists cover_alt text,
  add column if not exists cover_slug text;
