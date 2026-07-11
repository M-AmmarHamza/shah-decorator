alter table public.coming_soon
  add column if not exists category_name text;

create index if not exists coming_soon_category_idx
  on public.coming_soon(category_name)
  where category_name is not null;
