-- =============================================================================
-- Access tests for supabase/schema.sql: 17 cases
-- =============================================================================
--
-- Run the whole file as ONE script, either in the Dashboard SQL editor or in
-- psql (`psql "$DATABASE_URL" -f supabase/tests/access.sql`). It runs as
-- postgres, seeds throwaway rows (all @example.test), switches identity with
-- `set local role` + request.jwt.claims (what PostgREST does for each API
-- request), and ends in ROLLBACK, so nothing it inserts is ever committed. A
-- failing case raises an exception, which aborts the transaction; the rows
-- are discarded in that case too.
--
-- Each passing case emits `NOTICE: PASS n: ...`. The last statement before the
-- rollback returns a one-row summary, because the SQL editor shows only the
-- final result set, not notices.
--
-- Safe to run on the live project: it never touches existing rows, and every
-- check only looks at rows it seeded, or at "can this caller see anything at
-- all", so real data does not affect the outcome.
-- =============================================================================

begin;

select set_config('access_test.passed', '', true);

-- -----------------------------------------------------------------------------
-- Seed data (as postgres, which owns the tables, so RLS does not apply)
-- -----------------------------------------------------------------------------
insert into public.allowed_emails (email, name, is_owner) values
  ('owner@example.test',  'Test Owner',  true),
  ('friend@example.test', 'Test Friend', false),
  ('other@example.test',  'Test Other',  false);
-- stranger@example.test is deliberately NOT invited.

-- Stays far in the future so they cannot clash with real confirmed stays.
--   s1  other   requested  2099-06-01 .. 06-05
--   s2  other   confirmed  2099-07-01 .. 07-05
--   s3  friend  confirmed  2099-08-01 .. 08-05
--   s4  friend  requested  2099-06-03 .. 06-07  (overlaps s1)
insert into public.stays (id, guest_email, guest_name, starts_on, ends_on, status, message) values
  ('00000000-0000-4000-8000-0000000000a1', 'other@example.test',  'Test Other',  '2099-06-01', '2099-06-05', 'requested', 'access test s1'),
  ('00000000-0000-4000-8000-0000000000a2', 'other@example.test',  'Test Other',  '2099-07-01', '2099-07-05', 'confirmed', 'access test s2'),
  ('00000000-0000-4000-8000-0000000000a3', 'friend@example.test', 'Test Friend', '2099-08-01', '2099-08-05', 'confirmed', 'access test s3'),
  ('00000000-0000-4000-8000-0000000000a4', 'friend@example.test', 'Test Friend', '2099-06-03', '2099-06-07', 'requested', 'access test s4');

-- =============================================================================
-- Signed out (anon)
-- =============================================================================

-- 1. anon sees no stays ------------------------------------------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
do $$
declare n int;
begin
  select count(*) into n from public.stays;
  if n <> 0 then
    raise exception 'FAIL 1: anon can see % stays (expected 0)', n;
  end if;
  raise notice 'PASS 1: anon sees no stays';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 1', true);
end
$$;

-- 2. anon sees no allowed_emails ---------------------------------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
do $$
declare n int;
begin
  select count(*) into n from public.allowed_emails;
  if n <> 0 then
    raise exception 'FAIL 2: anon can see % allowed_emails rows (expected 0)', n;
  end if;
  raise notice 'PASS 2: anon sees no allowed_emails';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 2', true);
end
$$;

-- 3. anon cannot execute am_invited() / am_owner() ---------------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
do $$
begin
  begin
    perform public.am_invited();
    raise exception 'FAIL 3: anon was able to execute am_invited()';
  exception when insufficient_privilege then null;  -- permission denied: expected
  end;
  begin
    perform public.am_owner();
    raise exception 'FAIL 3: anon was able to execute am_owner()';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS 3: anon gets permission denied on am_invited() and am_owner()';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 3', true);
end
$$;

-- 4. anon cannot insert a stay -----------------------------------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
do $$
begin
  begin
    insert into public.stays (guest_email, guest_name, starts_on, ends_on)
    values ('anon@example.test', 'Anon', '2099-09-01', '2099-09-03');
    raise exception 'FAIL 4: anon inserted a stay';
  exception when insufficient_privilege then null;  -- RLS violation: expected
  end;
  raise notice 'PASS 4: anon cannot insert a stay';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 4', true);
end
$$;

-- =============================================================================
-- Signed in, not invited (stranger@example.test)
-- =============================================================================

-- 5. stranger sees no stays (and no invite rows) -----------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'stranger@example.test', 'role', 'authenticated')::text, true);
do $$
declare n_stays int; n_invites int;
begin
  select count(*) into n_stays from public.stays;
  select count(*) into n_invites from public.allowed_emails;
  if n_stays <> 0 or n_invites <> 0 then
    raise exception 'FAIL 5: uninvited user sees % stays and % allowed_emails rows (expected 0 and 0)', n_stays, n_invites;
  end if;
  raise notice 'PASS 5: signed-in stranger sees no stays and no invites';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 5', true);
end
$$;

-- 6. stranger cannot insert a stay, even a valid one for themselves ----------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'stranger@example.test', 'role', 'authenticated')::text, true);
do $$
begin
  begin
    insert into public.stays (guest_email, guest_name, starts_on, ends_on)
    values ('stranger@example.test', 'Stranger', '2099-09-01', '2099-09-03');
    raise exception 'FAIL 6: uninvited user inserted a stay';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS 6: signed-in stranger cannot request a stay';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 6', true);
end
$$;

-- =============================================================================
-- Invited guest (friend@example.test)
-- =============================================================================

-- 7. friend sees the calendar, including other guests' stays -----------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'friend@example.test', 'role', 'authenticated')::text, true);
do $$
declare n int;
begin
  select count(*) into n from public.stays
  where id in ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a2',
               '00000000-0000-4000-8000-0000000000a3', '00000000-0000-4000-8000-0000000000a4');
  if n <> 4 then
    raise exception 'FAIL 7: invited friend sees % of the 4 seeded stays', n;
  end if;
  raise notice 'PASS 7: invited friend sees the whole calendar (4/4 seeded stays, incl. other guests)';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 7', true);
end
$$;

-- 8. friend sees only their own allowed_emails row, not the guest list -------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'friend@example.test', 'role', 'authenticated')::text, true);
do $$
declare visible text[];
begin
  select coalesce(array_agg(email order by email), '{}') into visible from public.allowed_emails;
  if visible is distinct from array['friend@example.test'] then
    raise exception 'FAIL 8: friend sees allowed_emails %, expected only {friend@example.test}', visible;
  end if;
  if not public.am_invited() or public.am_owner() then
    raise exception 'FAIL 8: friend am_invited()=% am_owner()=%, expected true/false', public.am_invited(), public.am_owner();
  end if;
  raise notice 'PASS 8: friend sees only their own invite row (am_invited=true, am_owner=false)';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 8', true);
end
$$;

-- 9. friend can request a future stay for themselves -------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'friend@example.test', 'role', 'authenticated')::text, true);
do $$
declare s text;
begin
  -- Mixed-case email on purpose: the policy compares lower() on both sides.
  -- status is omitted, so the default 'requested' applies.
  insert into public.stays (id, guest_email, guest_name, starts_on, ends_on, message)
  values ('00000000-0000-4000-8000-0000000000a9', 'Friend@Example.test', 'Test Friend',
          '2099-09-10', '2099-09-14', 'access test s9')
  returning status into s;
  if s is distinct from 'requested' then
    raise exception 'FAIL 9: new request has status %, expected requested', s;
  end if;
  raise notice 'PASS 9: friend requested a future stay for themselves (status requested)';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 9', true);
end
$$;

-- 10. friend cannot request a stay under someone else's email ----------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'friend@example.test', 'role', 'authenticated')::text, true);
do $$
begin
  begin
    insert into public.stays (guest_email, guest_name, starts_on, ends_on)
    values ('other@example.test', 'Test Other', '2099-10-01', '2099-10-03');
    raise exception 'FAIL 10: friend inserted a stay for other@example.test';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS 10: friend cannot request a stay for another email';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 10', true);
end
$$;

-- 11. friend cannot insert an already-confirmed stay -------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'friend@example.test', 'role', 'authenticated')::text, true);
do $$
begin
  begin
    insert into public.stays (guest_email, guest_name, starts_on, ends_on, status)
    values ('friend@example.test', 'Test Friend', '2099-10-10', '2099-10-12', 'confirmed');
    raise exception 'FAIL 11: friend inserted a stay with status confirmed';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS 11: friend cannot insert status confirmed';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 11', true);
end
$$;

-- 12. friend cannot request a stay that starts in the past -------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'friend@example.test', 'role', 'authenticated')::text, true);
do $$
begin
  begin
    insert into public.stays (guest_email, guest_name, starts_on, ends_on)
    values ('friend@example.test', 'Test Friend', current_date - 1, current_date + 2);
    raise exception 'FAIL 12: friend requested a stay starting yesterday';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS 12: friend cannot request a past start date';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 12', true);
end
$$;

-- 13. friend cannot update (confirm) any stay, including their own -----------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'friend@example.test', 'role', 'authenticated')::text, true);
do $$
declare n int; still_requested int;
begin
  -- s1 and s9 do not overlap, so a policy leak shows up as a clean FAIL here
  -- rather than as an exclusion-constraint error.
  update public.stays set status = 'confirmed'
  where id in ('00000000-0000-4000-8000-0000000000a1',   -- other's request
               '00000000-0000-4000-8000-0000000000a9');  -- own request from case 9
  get diagnostics n = row_count;
  select count(*) into still_requested from public.stays
  where status = 'requested'
    and id in ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a9');
  if n <> 0 or still_requested <> 2 then
    raise exception 'FAIL 13: friend updated % stays (% of 2 still requested)', n, still_requested;
  end if;
  raise notice 'PASS 13: friend cannot confirm any stay (0 rows updated)';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 13', true);
end
$$;

-- 14. friend can withdraw (delete) their own pending request -----------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'friend@example.test', 'role', 'authenticated')::text, true);
do $$
declare n int;
begin
  delete from public.stays where id = '00000000-0000-4000-8000-0000000000a9';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'FAIL 14: friend withdrew % rows of their own request (expected 1)', n;
  end if;
  if exists (select 1 from public.stays where id = '00000000-0000-4000-8000-0000000000a9') then
    raise exception 'FAIL 14: withdrawn request is still there';
  end if;
  raise notice 'PASS 14: friend withdrew their own requested stay';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 14', true);
end
$$;

-- 15. friend cannot delete a confirmed stay or anyone else's request ---------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'friend@example.test', 'role', 'authenticated')::text, true);
do $$
declare n int; remaining int;
begin
  delete from public.stays
  where id in ('00000000-0000-4000-8000-0000000000a3',   -- own, but confirmed
               '00000000-0000-4000-8000-0000000000a1',   -- other's request
               '00000000-0000-4000-8000-0000000000a2');  -- other's confirmed stay
  get diagnostics n = row_count;
  select count(*) into remaining from public.stays
  where id in ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a2',
               '00000000-0000-4000-8000-0000000000a3');
  if n <> 0 or remaining <> 3 then
    raise exception 'FAIL 15: friend deleted % rows (% of 3 remain)', n, remaining;
  end if;
  raise notice 'PASS 15: friend cannot delete a confirmed stay or another guest''s request';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 15', true);
end
$$;

-- =============================================================================
-- Owner (owner@example.test)
-- =============================================================================

-- 16. owner confirms a request; an overlapping confirmation is rejected ------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('email', 'owner@example.test', 'role', 'authenticated')::text, true);
do $$
declare n int; s1 text; s4 text;
begin
  if not public.am_owner() then
    raise exception 'FAIL 16: am_owner() is false for the owner';
  end if;

  update public.stays set status = 'confirmed' where id = '00000000-0000-4000-8000-0000000000a1';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'FAIL 16: owner confirmed % rows (expected 1)', n;
  end if;

  -- s4 (06-03..06-07) overlaps the now-confirmed s1 (06-01..06-05).
  begin
    update public.stays set status = 'confirmed' where id = '00000000-0000-4000-8000-0000000000a4';
    raise exception 'FAIL 16: overlapping stay was confirmed (stays_no_overlap did not fire)';
  exception when exclusion_violation then null;  -- expected
  end;

  -- The owner can still decline the clashing request instead.
  update public.stays set status = 'declined' where id = '00000000-0000-4000-8000-0000000000a4';
  get diagnostics n = row_count;

  select status into s1 from public.stays where id = '00000000-0000-4000-8000-0000000000a1';
  select status into s4 from public.stays where id = '00000000-0000-4000-8000-0000000000a4';
  if s1 is distinct from 'confirmed' or s4 is distinct from 'declined' or n <> 1 then
    raise exception 'FAIL 16: after owner actions s1=% s4=% (expected confirmed/declined)', s1, s4;
  end if;
  raise notice 'PASS 16: owner confirmed a request; overlapping confirmation rejected by stays_no_overlap';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 16', true);
end
$$;

-- =============================================================================
-- Sign-up hook
-- =============================================================================

-- 17. hook_allowlist_signup: invited -> {}, uninvited -> 403; not callable by
--     anon or authenticated. Auth calls it as supabase_auth_admin, which this
--     script cannot become, so that role's access is checked in the catalog.
reset role;
select set_config('request.jwt.claims', '', true);
do $$
declare r jsonb;
begin
  r := public.hook_allowlist_signup('{"user": {"email": "Friend@Example.TEST"}}'::jsonb);
  if r is distinct from '{}'::jsonb then
    raise exception 'FAIL 17: invited address (mixed case) was rejected: %', r;
  end if;

  r := public.hook_allowlist_signup('{"user": {"email": "stranger@example.test"}}'::jsonb);
  if r is distinct from '{"error": {"http_code": 403, "message": "This address has not been invited."}}'::jsonb then
    raise exception 'FAIL 17: uninvited address got % (expected the 403 error)', r;
  end if;

  if not has_function_privilege('supabase_auth_admin', 'public.hook_allowlist_signup(jsonb)', 'execute')
     or not has_table_privilege('supabase_auth_admin', 'public.allowed_emails', 'select')
     or not exists (select 1 from pg_policies
                    where schemaname = 'public' and tablename = 'allowed_emails'
                      and cmd = 'SELECT' and 'supabase_auth_admin' = any (roles) and qual = 'true') then
    raise exception 'FAIL 17: supabase_auth_admin lacks execute, select or its RLS policy, so the hook would reject everyone';
  end if;

  set local role anon;
  begin
    r := public.hook_allowlist_signup('{"user": {"email": "friend@example.test"}}'::jsonb);
    raise exception 'FAIL 17: anon was able to execute hook_allowlist_signup';
  exception when insufficient_privilege then null;
  end;

  set local role authenticated;
  begin
    r := public.hook_allowlist_signup('{"user": {"email": "friend@example.test"}}'::jsonb);
    raise exception 'FAIL 17: authenticated was able to execute hook_allowlist_signup';
  exception when insufficient_privilege then null;
  end;
  reset role;

  raise notice 'PASS 17: hook allows invited (case-insensitive), 403s uninvited; anon/authenticated cannot call it';
  perform set_config('access_test.passed', current_setting('access_test.passed') || ' 17', true);
end
$$;

-- -----------------------------------------------------------------------------
-- Summary (the SQL editor shows this row), then throw everything away.
-- -----------------------------------------------------------------------------
reset role;
do $$
declare passed text[] := string_to_array(trim(current_setting('access_test.passed')), ' ');
begin
  if coalesce(array_length(passed, 1), 0) <> 17 then
    raise exception 'Only % of 17 access tests passed: %', coalesce(array_length(passed, 1), 0), passed;
  end if;
end
$$;
select '17/17 access tests passed' as result,
       trim(current_setting('access_test.passed')) as cases;

rollback;
