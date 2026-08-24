alter table public.demo_workspaces
  alter column expires_at set default (now() + interval '3 hours');

drop policy if exists "demo owner create" on public.demo_workspaces;

create policy "demo owner create" on public.demo_workspaces
  for insert to authenticated
  with check (
    owner_user_id = (select auth.uid())
    and expires_at <= now() + interval '3 hours'
  );

comment on column public.demo_workspaces.expires_at is
  'Temporary demo workspaces expire no later than three hours after creation.';
