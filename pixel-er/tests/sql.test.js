/* Tests supabase/09_pixel_er.sql against a real Postgres (PGlite, in-process).
   Run:  npm i --no-save @electric-sql/pglite && node tests/sql.test.js
   The club's own tables/functions (migrations 01–07) are stubbed with the same definitions. */
'use strict';
const fs = require('fs');
const path = require('path');
let PGlite;
try { ({ PGlite } = require('@electric-sql/pglite')); } catch (e) { console.log('PGlite not installed — skipping SQL tests.'); process.exit(0); }

const MIGRATION = fs.readFileSync(path.join(__dirname, '..', 'supabase', '09_pixel_er.sql'), 'utf8');
const CASE = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cases', 'acs-inferior-stemi.json'), 'utf8'));

const STUB = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.jwt() to anon, authenticated, service_role;
create table public.committees (id uuid primary key default gen_random_uuid(), name_ar text);
create table public.members (id uuid primary key default gen_random_uuid(), email text unique, full_name text not null,
  committee_id uuid references public.committees(id), role text not null default 'member', study_level text default '');
create table public.supervisors (id uuid primary key default gen_random_uuid(), name text not null, title text default 'د.', email text default '');
create function public.me_id() returns uuid language sql stable security definer set search_path = public as $$
  select id from public.members where email is not null and lower(email) = lower(auth.jwt() ->> 'email') limit 1; $$;
create function public.me_role() returns text language sql stable security definer set search_path = public as $$
  select role from public.members where email is not null and lower(email) = lower(auth.jwt() ->> 'email') limit 1; $$;
create function public.is_admin() returns boolean language sql stable set search_path = public as $$
  select coalesce(public.me_role() in ('president','vice'), false); $$;
create function public.is_club_member() returns boolean language sql stable set search_path = public as $$
  select public.me_role() is not null; $$;
create function public.me_sup_id() returns uuid language sql stable security definer set search_path = public as $$
  select s.id from public.supervisors s where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email','')) limit 1; $$;
create function public.is_supervisor() returns boolean language sql stable security definer set search_path = public as $$
  select public.me_sup_id() is not null; $$;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.members, public.committees, public.supervisors to authenticated;
grant all on all tables in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;  -- as in Supabase
insert into public.committees (name_ar) values ('اللجنة العلمية');
insert into public.members (email, full_name, role, study_level, committee_id) values
  ('pres@s.mu.edu.sa', 'نورة سعد الدوسري', 'president', 'السنة الخامسة', null),
  ('sara@s.mu.edu.sa', 'سارة محمد عبدالله العتيبي', 'member', 'السنة الرابعة', (select id from public.committees limit 1)),
  ('ali@s.mu.edu.sa',  'عبد الله فهد آل سعود', 'member', 'السنة الثالثة', null),
  ('omar@s.mu.edu.sa', 'عمر خالد', 'member', '', null);
insert into public.supervisors (name, title, email) values ('فيصل الحسيني', 'د.', 'faisal@mu.edu.sa');
`;

let failed = 0, passed = 0;
function check(name, ok, extra) { if (ok) { passed++; console.log('  ✓ ' + name); } else { failed++; console.log('  ✗ ' + name + (extra ? ' — ' + extra : '')); } }

(async () => {
  const db = new PGlite();
  await db.exec(STUB);
  await db.exec(MIGRATION);
  await db.exec(MIGRATION); /* idempotent */
  check('migration runs twice without error', true);

  async function as(email, fn) {
    await db.exec(`set role authenticated; select set_config('request.jwt.claims', '${JSON.stringify({ email })}', false);`);
    try { return await fn(); } finally { await db.exec(`reset role; select set_config('request.jwt.claims', '', false);`); }
  }
  async function expectError(p) { try { await p; return null; } catch (e) { return e.message; } }
  const svc = async (sql, params) => { await db.exec('set role service_role'); try { return await db.query(sql, params); } finally { await db.exec('reset role'); } };

  const draft = Object.assign({}, CASE, { status: 'faculty_review' });
  const pub = Object.assign({}, CASE, { status: 'published' });

  console.log('Case workflow');
  let err = await expectError(as('sara@s.mu.edu.sa', () => db.query('insert into public.pixel_cases (id, data) values ($1, $2)', [CASE.id, draft])));
  check('ordinary member cannot write cases (RLS)', /row-level security/.test(err || ''), err);

  await as('pres@s.mu.edu.sa', () => db.query('insert into public.pixel_cases (id, data) values ($1, $2)', [CASE.id, draft]));
  check('admin can save a draft', (await svc('select status from public.pixel_cases')).rows[0].status === 'faculty_review');

  err = await expectError(as('faisal@mu.edu.sa', () => db.query('update public.pixel_cases set data = $1 where id = $2', [pub, CASE.id])));
  check('supervisors cannot publish (president / vice only)', /row-level security|0 rows/.test(err || '0 rows') && (await svc('select status from public.pixel_cases')).rows[0].status === 'faculty_review', err);

  await as('pres@s.mu.edu.sa', () => db.query('update public.pixel_cases set data = $1, publish_at = now() - interval \'1 hour\', close_at = now() + interval \'6 days\' where id = $2', [Object.assign({}, pub, { review: Object.assign({}, CASE.review, { facultyReviewer: 'Fake Name' }) }), CASE.id]));
  let row = (await svc('select status, approved_by_member, data from public.pixel_cases')).rows[0];
  check('president publishes; approver name recorded by the server (typed name ignored)', row.status === 'published' && !!row.approved_by_member && row.data.review.facultyReviewer === 'نورة سعد الدوسري', JSON.stringify(row.data.review));

  const resched = JSON.parse(JSON.stringify(row.data)); resched.schedule = { publishAt: '2026-11-01T20:00', closeAt: '2026-11-30T20:00' }; resched.review.facultyReviewer = 'Fake Name';
  await as('pres@s.mu.edu.sa', () => db.query('update public.pixel_cases set data = $1 where id = $2', [resched, CASE.id]));
  row = (await svc('select data from public.pixel_cases')).rows[0];
  check('rescheduling keeps the original approver; name cannot be faked', row.data.schedule.closeAt === '2026-11-30T20:00' && row.data.review.facultyReviewer === 'نورة سعد الدوسري');

  await svc(`insert into public.members (email, full_name, role, study_level) values ('vice@s.mu.edu.sa', 'هند علي القحطاني', 'vice', 'السنة السادسة')`);
  const edited = JSON.parse(JSON.stringify(row.data)); edited.actions[0].response = 'changed';
  await as('vice@s.mu.edu.sa', () => db.query('update public.pixel_cases set data = $1 where id = $2', [edited, CASE.id]));
  row = (await svc('select data from public.pixel_cases')).rows[0];
  check('vice-president edits approved content → recorded as a new approval by her', row.data.actions[0].response === 'changed' && row.data.review.facultyReviewer === 'هند علي القحطاني');

  err = await expectError(as('sara@s.mu.edu.sa', () => db.query(`update public.pixel_cases set data = jsonb_set(data, '{status}', '"draft"') where id = $1 returning id`, [CASE.id]).then(r => { if (!r.rows.length) throw new Error('0 rows'); })));
  check('ordinary members cannot change a published case', /0 rows|row-level security/.test(err || ''), err);

  const seen = await as('sara@s.mu.edu.sa', () => db.query('select id from public.pixel_cases'));
  check('member sees the published case', seen.rows.length === 1);
  await svc(`insert into public.pixel_cases (id, data) values ('hidden-case', $1)`, [Object.assign({}, CASE, { id: 'hidden-case', status: 'draft' })]).catch(e => { throw e; });
  const seen2 = await as('sara@s.mu.edu.sa', () => db.query('select id from public.pixel_cases order by id'));
  check('member does not see drafts', seen2.rows.map(r => r.id).join() === CASE.id, seen2.rows.map(r => r.id).join());

  console.log('Attempts & leaderboard');
  err = await expectError(as('sara@s.mu.edu.sa', () => db.query(`insert into public.pixel_attempts (case_id, member_id, official, score, history) values ($1, public.me_id(), true, 100, '[]')`, [CASE.id])));
  check('members cannot insert attempts from the browser', /permission denied/.test(err || ''), err);

  const ids = Object.fromEntries((await svc('select email, id from public.members')).rows.map(r => [r.email, r.id]));
  const ins = (email, official, score, mins) => svc(`insert into public.pixel_attempts (case_id, member_id, official, score, xp, sim_minutes, history) values ($1,$2,$3,$4,$5,$6,'[]')`, [CASE.id, ids[email], official, score, Math.round(score * 1.5), mins]);
  await ins('sara@s.mu.edu.sa', true, 92, 40);
  await ins('ali@s.mu.edu.sa', true, 92, 35);
  await ins('omar@s.mu.edu.sa', true, 70, 50);
  await ins('sara@s.mu.edu.sa', false, 100, 30);
  err = await expectError(ins('sara@s.mu.edu.sa', true, 99, 20));
  check('only one official attempt per member per case', /duplicate key/.test(err || ''), err);

  const lb = (await as('sara@s.mu.edu.sa', () => db.query('select * from public.pixel_leaderboard($1)', [CASE.id]))).rows;
  check('leaderboard order: score ↓ then time ↑', lb.map(r => r.name).join(' | ') === 'عبد الله آل سعود | سارة العتيبي | عمر خالد', lb.map(r => r.name).join(' | '));
  check('first + last name only, with study year', lb[1].name === 'سارة العتيبي' && lb[1].study_level === 'السنة الرابعة');
  check('practice attempts excluded', lb.length === 3);
  check('is_me marks the caller', lb.filter(r => r.is_me).length === 1 && lb[1].is_me === true);
  check('no committee or email exposed', !('committee' in lb[0]) && !JSON.stringify(lb).includes('@'));

  const part = (await as('sara@s.mu.edu.sa', () => db.query('select * from public.pixel_participation($1)', [CASE.id]))).rows;
  check('participation by study year', part.length === 3 && part.some(p => p.study_level === 'غير محدد'), JSON.stringify(part));
  const overall = (await as('sara@s.mu.edu.sa', () => db.query('select * from public.pixel_leaderboard_overall()'))).rows;
  check('overall XP leaderboard', overall.length === 3 && Number(overall[0].total_xp) === 138);

  const own = (await as('sara@s.mu.edu.sa', () => db.query('select score from public.pixel_attempts'))).rows;
  check('member sees only their own attempts', own.length === 2);

  const resM = (await as('sara@s.mu.edu.sa', () => db.query('select * from public.pixel_results($1)', [CASE.id]))).rows;
  const resA = (await as('pres@s.mu.edu.sa', () => db.query('select * from public.pixel_results($1)', [CASE.id]))).rows;
  check('full results: admins only', resM.length === 0 && resA.length === 4 && resA[0].full_name && resA.some(r => r.committee === 'اللجنة العلمية'));
  const resS = (await as('faisal@mu.edu.sa', () => db.query('select * from public.pixel_results($1)', [CASE.id]))).rows;
  check('…and supervisors', resS.length === 4);

  const stranger = (await as('someone@gmail.com', () => db.query('select * from public.pixel_leaderboard($1)', [CASE.id]))).rows;
  check('non-members get nothing', stranger.length === 0);
  err = await expectError((async () => { await db.exec('set role anon'); try { return await db.query('select * from public.pixel_leaderboard($1)', [CASE.id]); } finally { await db.exec('reset role'); } })());
  check('anonymous visitors cannot call the leaderboard', /permission denied/.test(err || ''), err);

  const who = (await as('faisal@mu.edu.sa', () => db.query('select * from public.pixel_whoami()'))).rows[0];
  check('whoami for a supervisor', who.is_supervisor === true && who.supervisor_name === 'د. فيصل الحسيني' && who.member_id === null);

  console.log('Name shortening');
  const names = { 'سارة محمد عبدالله العتيبي': 'سارة العتيبي', 'عبد الله فهد آل سعود': 'عبد الله آل سعود', 'محمد بن سلمان': 'محمد بن سلمان',
    'عمر': 'عمر', '  ريم   علي  ': 'ريم علي', 'عبد الرحمن': 'عبد الرحمن', 'عبد الرحمن خالد الشمري': 'عبد الرحمن الشمري' };
  for (const [full, want] of Object.entries(names)) {
    const got = (await db.query('select public.pixel_short_name($1) as n', [full])).rows[0].n;
    check(`“${full.trim()}” → “${want}”`, got === want, got);
  }

  console.log(`\n${passed} passed${failed ? ', ' + failed + ' FAILED' : ''}`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
