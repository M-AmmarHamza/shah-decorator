alter table public.events
  add column if not exists discount_type text not null default 'percent' check (discount_type in ('percent','fixed')),
  add column if not exists discount_value numeric(12,2) not null default 0 check (discount_value >= 0),
  add column if not exists minimum_order numeric(12,2) not null default 0 check (minimum_order >= 0),
  add column if not exists product_scope text not null default 'all' check (product_scope in ('all','category','products')),
  add column if not exists target_category text,
  add column if not exists target_product_ids uuid[] not null default '{}',
  add column if not exists delivery_mode text not null default 'default' check (delivery_mode in ('default','included','separate','free')),
  add column if not exists delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0);

alter table public.orders
  add column if not exists event_id uuid references public.events(id) on delete set null,
  add column if not exists offer_code text,
  add column if not exists delivery_included boolean not null default false;
