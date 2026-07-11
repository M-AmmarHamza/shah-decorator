alter table public.products
  add column if not exists image_slug text;

alter table public.product_images
  add column if not exists slug text,
  add column if not exists width integer not null default 1080,
  add column if not exists height integer not null default 1080;

alter table public.coming_soon
  add column if not exists image_alt text,
  add column if not exists image_slug text;
