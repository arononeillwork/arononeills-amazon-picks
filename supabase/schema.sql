-- =============================================================================
-- arononeillspicks: apartment calendar (tables, functions, grants, RLS)
-- Supabase project zmxkwaedfiqepyfywtbe (eu-west-3)
-- =============================================================================
--
-- This file mirrors the live database exactly. It is idempotent: running it on
-- an empty project builds everything, and re-running it on the live project
-- changes nothing. Run it in the Dashboard SQL editor (as postgres) or with
-- psql. Tests live in supabase/tests/access.sql.
--
-- SECURITY MODEL
--   Row Level Security is the security boundary. The browser holds only the
--   publishable key, which is public by design, so anon and authenticated keep
--   Supabase's default table grants and the policies below decide what each
--   caller can read or change:
--     * anon (signed out)           : nothing at all.
--     * signed in but not invited   : nothing at all.
--     * invited guest               : sees the calendar, may request a future
--                                     stay for their own email, and may
--                                     withdraw their own pending request.
--     * owner (is_owner = true)     : additionally confirms or declines stays.
--   No two confirmed stays can overlap (exclusion constraint stays_no_overlap).
--
--   There is deliberately NO client-callable "is this email invited?" function.
--   An earlier public.is_allowed(email) let anyone probe the guest list and was
--   removed (migration remove_allowlist_oracle). am_invited() and am_owner()
--   only answer for the caller's own JWT and cannot be called by anon. Do not
--   add an allowlist lookup that takes an email argument.
--
-- SIGN-UP ALLOWLIST: ONE MANUAL STEP (SQL cannot switch the hook on)
--   Dashboard -> Authentication -> Hooks -> "Before User Created"
--     -> Postgres -> schema public -> function hook_allowlist_signup
--   With the hook on, only addresses in public.allowed_emails can create an
--   account. Without it anyone can sign up (RLS still shows them nothing).
--
-- INVITING PEOPLE (SQL editor). Emails must be lower-case (check constraint).
--   A friend:
--     insert into public.allowed_emails (email, name)
--     values ('friend@example.com', 'Friend Name');
--   The owner (can confirm and decline stays):
--     insert into public.allowed_emails (email, name, is_owner)
--     values ('you@example.com', 'Your Name', true);
--   Uninvite:
--     delete from public.allowed_emails where email = 'friend@example.com';
--
-- CLIENT KEYS
--   The publishable key (sb_publishable_...) goes in the `apikey` header, never
--   as a Bearer token. `Authorization: Bearer ...` carries only the signed-in
--   user's access token (supabase-js handles both for you). The secret /
--   service_role key bypasses RLS and never goes anywhere near the browser.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Invite list
-- -----------------------------------------------------------------------------
create table if not exists public.allowed_emails (
  email      text primary key check (email = lower(email)),
  name       text,
  is_owner   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;

-- -----------------------------------------------------------------------------
-- "Am I invited / am I the owner?" for the caller's own JWT email only.
-- security invoker: they read allowed_emails through RLS, which lets a caller
-- see only their own row. Bodies are kept byte-identical to live.
-- -----------------------------------------------------------------------------
create or replace function public.am_invited()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$ select exists (select 1 from public.allowed_emails where email = lower((select auth.jwt()) ->> 'email')); $$;

create or replace function public.am_owner()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$ select exists (select 1 from public.allowed_emails where email = lower((select auth.jwt()) ->> 'email') and is_owner); $$;

revoke execute on function public.am_invited() from public, anon;
revoke execute on function public.am_owner()   from public, anon;
grant  execute on function public.am_invited() to authenticated, service_role;
grant  execute on function public.am_owner()   to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Before User Created auth hook. Runs as supabase_auth_admin (security
-- invoker), so that role needs USAGE on public, SELECT on allowed_emails and
-- the "auth admin reads allowlist" policy below. Nobody else may execute it.
-- -----------------------------------------------------------------------------
create or replace function public.hook_allowlist_signup(event jsonb)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
  if exists (
    select 1 from public.allowed_emails
    where email = lower(event -> 'user' ->> 'email')
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object('http_code', 403, 'message', 'This address has not been invited.')
  );
end;
$$;

revoke execute on function public.hook_allowlist_signup(jsonb) from public, anon, authenticated;
grant  execute on function public.hook_allowlist_signup(jsonb) to supabase_auth_admin, service_role;

grant usage on schema public to supabase_auth_admin;
grant select on table public.allowed_emails to supabase_auth_admin;

-- -----------------------------------------------------------------------------
-- allowed_emails policies. There is no insert/update/delete policy: the list
-- is managed from the SQL editor only.
-- -----------------------------------------------------------------------------
drop policy if exists "people read their own invite" on public.allowed_emails;
create policy "people read their own invite"
  on public.allowed_emails for select
  to authenticated
  using (email = lower((select auth.jwt()) ->> 'email'));

drop policy if exists "auth admin reads allowlist" on public.allowed_emails;
create policy "auth admin reads allowlist"
  on public.allowed_emails for select
  to supabase_auth_admin
  using (true);

-- -----------------------------------------------------------------------------
-- Stays. Dates are half-open: a stay occupies [starts_on, ends_on), so one
-- guest can leave on the day the next arrives.
-- -----------------------------------------------------------------------------
create table if not exists public.stays (
  id          uuid primary key default gen_random_uuid(),
  guest_email text not null,
  guest_name  text not null check (length(trim(guest_name)) > 0),
  starts_on   date not null,
  ends_on     date not null,
  status      text not null default 'requested'
              check (status in ('requested', 'confirmed', 'declined')),
  message     text,
  created_at  timestamptz not null default now(),
  constraint leaving_after_arriving check (ends_on > starts_on)
);

-- No two confirmed stays may overlap. Added only if missing, so a re-run does
-- not drop and rebuild the index.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.stays'::regclass
      and conname  = 'stays_no_overlap'
  ) then
    alter table public.stays add constraint stays_no_overlap
      exclude using gist (daterange(starts_on, ends_on, '[)') with &&)
      where (status = 'confirmed');
  end if;
end
$$;

alter table public.stays enable row level security;

-- -----------------------------------------------------------------------------
-- stays policies. auth.jwt() and the helper functions are wrapped in
-- (select ...) so Postgres evaluates them once per statement, not per row.
-- -----------------------------------------------------------------------------
drop policy if exists "invited guests see the calendar" on public.stays;
create policy "invited guests see the calendar"
  on public.stays for select
  to authenticated
  using ((select public.am_invited()));

drop policy if exists "invited guests request their own stays" on public.stays;
create policy "invited guests request their own stays"
  on public.stays for insert
  to authenticated
  with check (
    (select public.am_invited())
    and lower(guest_email) = lower((select auth.jwt()) ->> 'email')
    and status = 'requested'
    and starts_on >= current_date
  );

drop policy if exists "guests withdraw their own requests" on public.stays;
create policy "guests withdraw their own requests"
  on public.stays for delete
  to authenticated
  using (
    lower(guest_email) = lower((select auth.jwt()) ->> 'email')
    and status = 'requested'
  );

drop policy if exists "owners decide" on public.stays;
create policy "owners decide"
  on public.stays for update
  to authenticated
  using ((select public.am_owner()))
  with check ((select public.am_owner()));

commit;
