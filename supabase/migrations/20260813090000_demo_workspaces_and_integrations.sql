create table if not exists public.demo_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','expired','activated')),
  store_data jsonb not null default '{"products":[],"settings":{}}'::jsonb,
  product_limit smallint not null default 3 check (product_limit between 1 and 3),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '72 hours'),
  activated_at timestamptz,
  check (expires_at > created_at)
);

create index if not exists demo_workspaces_owner_idx on public.demo_workspaces(owner_user_id);
create index if not exists demo_workspaces_expiry_idx on public.demo_workspaces(expires_at) where status = 'active';
alter table public.demo_workspaces enable row level security;

create policy "demo owner read" on public.demo_workspaces for select to authenticated
  using (owner_user_id = (select auth.uid()));
create policy "demo owner create" on public.demo_workspaces for insert to authenticated
  with check (owner_user_id = (select auth.uid()) and expires_at <= now() + interval '72 hours');
create policy "demo owner update" on public.demo_workspaces for update to authenticated
  using (owner_user_id = (select auth.uid()) and status = 'active' and expires_at > now())
  with check (owner_user_id = (select auth.uid()) and jsonb_array_length(coalesce(store_data->'products','[]'::jsonb)) <= product_limit);

create or replace function private.expire_demo_workspaces()
returns bigint language plpgsql security definer set search_path = '' as $$
declare affected bigint;
begin
  update public.demo_workspaces
     set status = 'expired', store_data = '{"products":[],"settings":{}}'::jsonb
   where status = 'active' and expires_at <= now();
  get diagnostics affected = row_count;
  return affected;
end;
$$;
revoke all on function private.expire_demo_workspaces() from public, anon, authenticated;

create table if not exists public.integration_configs (
  provider text primary key,
  enabled boolean not null default false,
  public_config jsonb not null default '{}'::jsonb,
  secret_reference text,
  health_status text not null default 'not_configured' check (health_status in ('not_configured','healthy','degraded','error')),
  last_tested_at timestamptz,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);
alter table public.integration_configs enable row level security;
create policy "admin integration configs" on public.integration_configs for all to authenticated
  using (private.is_admin(array['admin','super_admin']::public.app_role[]))
  with check (private.is_admin(array['admin','super_admin']::public.app_role[]));

grant select, insert, update, delete on public.demo_workspaces to authenticated;
grant select, insert, update, delete on public.integration_configs to authenticated;

comment on column public.integration_configs.secret_reference is
  'Reference to a server-side secret or Vault entry. Never store the secret value in this table or browser storage.';
comment on function private.expire_demo_workspaces() is
  'Run every 15 minutes with Supabase Cron after deployment: select private.expire_demo_workspaces();';
