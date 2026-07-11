create extension if not exists pgcrypto;
create schema if not exists private;

create type public.app_role as enum ('customer','content_editor','product_manager','order_manager','seo_manager','admin','super_admin');
create type public.approval_status as enum ('pending','approved','rejected');
create type public.publish_status as enum ('draft','published','archived');
create type public.order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled','returned');
create type public.payment_status as enum ('unpaid','pending_verification','paid','rejected','refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', phone text, avatar_url text,
  role public.app_role not null default 'customer', approval public.approval_status not null default 'approved',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text, image_url text, enabled boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now());
create table public.products (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id) on delete set null,
  name text not null, slug text not null unique, sku text not null unique, brand text, category_name text, image_url text, description text not null default '', specifications jsonb not null default '{}'::jsonb,
  price numeric(12,2) not null check(price>=0), compare_price numeric(12,2) check(compare_price>=0), cost_price numeric(12,2) check(cost_price>=0), stock integer not null default 0 check(stock>=0), low_stock_threshold integer not null default 5,
  status public.publish_status not null default 'draft', featured boolean not null default false, new_arrival boolean not null default false,
  sale_starts_at timestamptz, sale_ends_at timestamptz, seo_index boolean not null default false, seo_title text, meta_description text, keywords text[], image_alt text,
  variants jsonb not null default '[]'::jsonb, related_product_ids uuid[] not null default '{}', sort_order integer not null default 0,
  created_by uuid references public.profiles(id), updated_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, url text not null, alt_text text, sort_order integer not null default 0, created_at timestamptz not null default now());
create table public.inventory_movements (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, quantity_change integer not null, reason text not null, note text, created_by uuid references public.profiles(id), created_at timestamptz not null default now());
create table public.pages (id uuid primary key default gen_random_uuid(), page_key text not null unique, title text not null, enabled boolean not null default true, seo_index boolean not null default false, content jsonb not null default '{}'::jsonb, meta_title text, meta_description text, keywords text[], canonical_url text, updated_by uuid references public.profiles(id), updated_at timestamptz not null default now());
create table public.site_settings (key text primary key, value jsonb not null default '{}'::jsonb, is_public boolean not null default true, updated_by uuid references public.profiles(id), updated_at timestamptz not null default now());
create table public.blogs (id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, category text, author_id uuid references public.profiles(id), author_name text, cover_url text, excerpt text, content text not null default '', status public.publish_status not null default 'draft', featured boolean not null default false, published_at timestamptz, seo_index boolean not null default false, seo_title text, meta_description text, keywords text[], og_image_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.events (id uuid primary key default gen_random_uuid(), name text not null, message text not null, secondary_message text, discount_code text, cta_label text, cta_url text, background_color text default '#007a58', text_color text default '#ffffff', starts_at timestamptz not null, ends_at timestamptz not null, enabled boolean not null default true, priority integer not null default 0, target_pages text[] not null default '{all}', created_at timestamptz not null default now(), check(ends_at>starts_at));
create table public.coming_soon (id uuid primary key default gen_random_uuid(), name text not null, image_url text not null, description text, starts_at timestamptz not null, launches_at timestamptz not null, enabled boolean not null default true, product_id uuid references public.products(id) on delete set null, created_at timestamptz not null default now(), check(launches_at>starts_at));
create table public.orders (id uuid primary key default gen_random_uuid(), order_number bigint generated always as identity unique, customer_id uuid references public.profiles(id), customer_name text not null, phone text not null, email text, address jsonb not null default '{}'::jsonb, subtotal numeric(12,2) not null default 0, delivery_fee numeric(12,2) not null default 0, discount numeric(12,2) not null default 0, total numeric(12,2) not null default 0, payment_method text, payment_status public.payment_status not null default 'unpaid', status public.order_status not null default 'pending', courier text, tracking_number text, whatsapp_url text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id) on delete set null, product_name text not null, sku text, variant jsonb, quantity integer not null check(quantity>0), unit_price numeric(12,2) not null, total numeric(12,2) not null);
create table public.payment_confirmations (id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete set null, customer_id uuid references public.profiles(id), customer_name text not null, amount numeric(12,2) not null check(amount>0), method text not null, slip_path text not null, status public.payment_status not null default 'pending_verification', reviewed_by uuid references public.profiles(id), reviewed_at timestamptz, created_at timestamptz not null default now());
create table public.wishlists (user_id uuid not null references public.profiles(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade, created_at timestamptz not null default now(), primary key(user_id,product_id));
create table public.product_reviews (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, user_id uuid not null references public.profiles(id), rating integer not null check(rating between 1 and 5), title text, body text, approved boolean not null default false, created_at timestamptz not null default now(), unique(product_id,user_id));
create table public.analytics_events (id bigint generated always as identity primary key, event_name text not null, entity_type text, entity_id text, user_id uuid references public.profiles(id), session_id text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table public.audit_logs (id bigint generated always as identity primary key, actor_id uuid references public.profiles(id), action text not null, entity_type text not null, entity_id text, previous_data jsonb, new_data jsonb, created_at timestamptz not null default now());

create or replace function private.is_admin(allowed public.app_role[] default array['admin','super_admin']::public.app_role[]) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.approval='approved' and p.role=any(allowed)); $$;
revoke all on function private.is_admin(public.app_role[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin(public.app_role[]) to authenticated;

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.profiles(id,full_name,phone,role,approval) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'phone',case when new.raw_user_meta_data->>'requested_role'='admin' then 'admin'::public.app_role else 'customer'::public.app_role end,case when new.raw_user_meta_data->>'requested_role'='admin' then 'pending'::public.approval_status else 'approved'::public.approval_status end); return new; end; $$;
revoke all on function private.handle_new_user() from public;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

alter table public.profiles enable row level security; alter table public.categories enable row level security; alter table public.products enable row level security; alter table public.product_images enable row level security; alter table public.inventory_movements enable row level security; alter table public.pages enable row level security; alter table public.site_settings enable row level security; alter table public.blogs enable row level security; alter table public.events enable row level security; alter table public.coming_soon enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.payment_confirmations enable row level security; alter table public.wishlists enable row level security; alter table public.product_reviews enable row level security; alter table public.analytics_events enable row level security; alter table public.audit_logs enable row level security;

create policy "public read categories" on public.categories for select to anon,authenticated using(enabled);
create policy "public read products" on public.products for select to anon,authenticated using(status='published');
create policy "public read product images" on public.product_images for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and p.status='published'));
create policy "public read pages" on public.pages for select to anon,authenticated using(enabled);
create policy "public read settings" on public.site_settings for select to anon,authenticated using(is_public);
create policy "public read blogs" on public.blogs for select to anon,authenticated using(status='published' and published_at<=now());
create policy "public read events" on public.events for select to anon,authenticated using(enabled and now() between starts_at and ends_at);
create policy "public read coming soon" on public.coming_soon for select to anon,authenticated using(enabled and now() between starts_at and launches_at);
create policy "public read approved reviews" on public.product_reviews for select to anon,authenticated using(approved);
create policy "profile owner read" on public.profiles for select to authenticated using(id=(select auth.uid()) or private.is_admin(array['admin','super_admin']::public.app_role[]));
create policy "super admin profiles" on public.profiles for update to authenticated using(private.is_admin(array['super_admin']::public.app_role[])) with check(private.is_admin(array['super_admin']::public.app_role[]));
create policy "wishlist owner all" on public.wishlists for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "review owner insert" on public.product_reviews for insert to authenticated with check(user_id=(select auth.uid()));
create policy "review owner update" on public.product_reviews for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "customer read orders" on public.orders for select to authenticated using(customer_id=(select auth.uid()) or private.is_admin(array['order_manager','admin','super_admin']::public.app_role[]));
create policy "customer create orders" on public.orders for insert to authenticated with check(customer_id=(select auth.uid()));
create policy "customer read order items" on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.customer_id=(select auth.uid()) or private.is_admin(array['order_manager','admin','super_admin']::public.app_role[]))));
create policy "customer payment confirmations" on public.payment_confirmations for select to authenticated using(customer_id=(select auth.uid()) or private.is_admin(array['order_manager','admin','super_admin']::public.app_role[]));
create policy "customer upload payment confirmation" on public.payment_confirmations for insert to authenticated with check(customer_id=(select auth.uid()));
create policy "anonymous analytics insert" on public.analytics_events for insert to anon,authenticated with check(user_id is null or user_id=(select auth.uid()));

create policy "admin categories" on public.categories for all to authenticated using(private.is_admin(array['product_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['product_manager','admin','super_admin']::public.app_role[]));
create policy "admin products" on public.products for all to authenticated using(private.is_admin(array['product_manager','seo_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['product_manager','seo_manager','admin','super_admin']::public.app_role[]));
create policy "admin product images" on public.product_images for all to authenticated using(private.is_admin(array['product_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['product_manager','admin','super_admin']::public.app_role[]));
create policy "admin inventory" on public.inventory_movements for all to authenticated using(private.is_admin(array['product_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['product_manager','admin','super_admin']::public.app_role[]));
create policy "admin pages" on public.pages for all to authenticated using(private.is_admin(array['content_editor','seo_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['content_editor','seo_manager','admin','super_admin']::public.app_role[]));
create policy "admin settings" on public.site_settings for all to authenticated using(private.is_admin(array['admin','super_admin']::public.app_role[])) with check(private.is_admin(array['admin','super_admin']::public.app_role[]));
create policy "admin blogs" on public.blogs for all to authenticated using(private.is_admin(array['content_editor','seo_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['content_editor','seo_manager','admin','super_admin']::public.app_role[]));
create policy "admin events" on public.events for all to authenticated using(private.is_admin(array['content_editor','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['content_editor','admin','super_admin']::public.app_role[]));
create policy "admin coming soon" on public.coming_soon for all to authenticated using(private.is_admin(array['content_editor','product_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['content_editor','product_manager','admin','super_admin']::public.app_role[]));
create policy "admin orders" on public.orders for all to authenticated using(private.is_admin(array['order_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['order_manager','admin','super_admin']::public.app_role[]));
create policy "admin order items" on public.order_items for all to authenticated using(private.is_admin(array['order_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['order_manager','admin','super_admin']::public.app_role[]));
create policy "admin payments" on public.payment_confirmations for all to authenticated using(private.is_admin(array['order_manager','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['order_manager','admin','super_admin']::public.app_role[]));
create policy "admin reviews" on public.product_reviews for all to authenticated using(private.is_admin(array['content_editor','admin','super_admin']::public.app_role[])) with check(private.is_admin(array['content_editor','admin','super_admin']::public.app_role[]));
create policy "admin analytics read" on public.analytics_events for select to authenticated using(private.is_admin(array['admin','super_admin']::public.app_role[]));
create policy "admin audit read" on public.audit_logs for select to authenticated using(private.is_admin(array['super_admin']::public.app_role[]));

create or replace function private.update_my_profile(p_full_name text,p_phone text,p_avatar_url text) returns void language sql security definer set search_path='' as $$ update public.profiles set full_name=p_full_name,phone=p_phone,avatar_url=p_avatar_url,updated_at=now() where id=(select auth.uid()); $$;
revoke all on function private.update_my_profile(text,text,text) from public; grant execute on function private.update_my_profile(text,text,text) to authenticated;
create or replace function public.update_my_profile(p_full_name text,p_phone text,p_avatar_url text) returns void language sql security invoker set search_path='' as $$ select private.update_my_profile(p_full_name,p_phone,p_avatar_url); $$;
revoke all on function public.update_my_profile(text,text,text) from public; grant execute on function public.update_my_profile(text,text,text) to authenticated;

create or replace function private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.audit_logs(actor_id,action,entity_type,entity_id,previous_data,new_data) values((select auth.uid()),tg_op,tg_table_name,coalesce(new.id,old.id)::text,case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end); return coalesce(new,old); end; $$;
revoke all on function private.audit_change() from public;
create trigger audit_products after insert or update or delete on public.products for each row execute function private.audit_change();
create trigger audit_pages after insert or update or delete on public.pages for each row execute function private.audit_change();
create trigger audit_blogs after insert or update or delete on public.blogs for each row execute function private.audit_change();
create trigger audit_events after insert or update or delete on public.events for each row execute function private.audit_change();
create trigger audit_orders after insert or update or delete on public.orders for each row execute function private.audit_change();

grant select on public.categories,public.products,public.product_images,public.pages,public.site_settings,public.blogs,public.events,public.coming_soon,public.product_reviews to anon,authenticated;
grant insert on public.analytics_events to anon,authenticated;
grant select,insert,update,delete on all tables in schema public to authenticated;
grant usage,select on all sequences in schema public to authenticated;

create index products_public_idx on public.products(status,featured,sort_order); create index products_category_idx on public.products(category_id); create index blogs_public_idx on public.blogs(status,published_at desc); create index events_schedule_idx on public.events(enabled,starts_at,ends_at); create index coming_schedule_idx on public.coming_soon(enabled,starts_at,launches_at); create index orders_customer_idx on public.orders(customer_id,created_at desc); create index analytics_event_idx on public.analytics_events(event_name,created_at desc);

create policy "public product media" on storage.objects for select to anon,authenticated using(bucket_id='product-media');
create policy "public blog media" on storage.objects for select to anon,authenticated using(bucket_id='blog-media');
create policy "admins upload public media" on storage.objects for insert to authenticated with check(bucket_id in ('product-media','blog-media') and private.is_admin(array['content_editor','product_manager','admin','super_admin']::public.app_role[]));
create policy "admins update public media" on storage.objects for update to authenticated using(bucket_id in ('product-media','blog-media') and private.is_admin(array['content_editor','product_manager','admin','super_admin']::public.app_role[])) with check(bucket_id in ('product-media','blog-media') and private.is_admin(array['content_editor','product_manager','admin','super_admin']::public.app_role[]));
create policy "admins delete public media" on storage.objects for delete to authenticated using(bucket_id in ('product-media','blog-media') and private.is_admin(array['content_editor','product_manager','admin','super_admin']::public.app_role[]));
create policy "customers upload slips" on storage.objects for insert to authenticated with check(bucket_id='payment-slips' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "customers read own slips" on storage.objects for select to authenticated using(bucket_id='payment-slips' and ((storage.foldername(name))[1]=(select auth.uid())::text or private.is_admin(array['order_manager','admin','super_admin']::public.app_role[])));
