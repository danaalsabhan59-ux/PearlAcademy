/* Server-side scoring tests.
   Part 1: src/submit.js (the rules).
   Part 2: the generated edge function itself (supabase/functions/pixel-er-submit/index.ts),
           run in Node with a mocked Deno runtime and an in-memory database.
   Run:  python3 build.py && node --experimental-strip-types tests/submit.test.js */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const Submit = require('../src/submit.js');

const ACS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cases', 'acs-inferior-stemi.json'), 'utf8'));
const IDEAL = ['tx_monitor', 'inv_ecg', 'hx_allergy', 'tx_aspirin', 'hx_onset', 'hx_character', 'hx_back',
  'inv_right_ecg', 'disp_cathlab', 'tx_iv', 'inv_trop', 'inv_bloods', 'tx_senior', 'hx_associated', 'hx_pmh',
  'ex_ab', 'ex_c', 'ex_d', 'ex_heart', 'dx_inf_rv', 'reassess', '__wait:5', 'reassess', '__wait:5', '__wait:5', 'disp_transfer'];
const DAY = 864e5, NOW = new Date('2026-11-10T12:00:00Z');
const live = (over) => Object.assign({ id: ACS.id, status: 'published', publish_at: new Date(NOW - DAY).toISOString(), close_at: new Date(+NOW + 6 * DAY).toISOString(), data: ACS }, over || {});

let passed = 0, failed = 0;
async function test(name, fn) { try { await fn(); passed++; console.log('  ✓ ' + name); } catch (e) { failed++; console.log('  ✗ ' + name + '\n    ' + e.message); } }

(async () => {
  console.log('Submission rules');
  await test('ideal play during the week → official, server score', () => {
    const r = Submit.evaluate({ caseRow: live(), history: IDEAL, now: NOW, hasOfficial: false });
    assert.ok(r.ok); assert.strictEqual(r.official, true); assert.ok(r.record.score >= 95, String(r.record.score));
    assert.strictEqual(r.record.ending, 'end_excellent');
  });
  await test('second completed attempt → practice only', () => {
    const r = Submit.evaluate({ caseRow: live(), history: IDEAL, now: NOW, hasOfficial: true });
    assert.ok(r.ok); assert.strictEqual(r.official, false);
  });
  await test('after the closing time → practice only', () => {
    const r = Submit.evaluate({ caseRow: live({ close_at: new Date(NOW - 1000).toISOString() }), history: IDEAL, now: NOW, hasOfficial: false });
    assert.ok(r.ok); assert.strictEqual(r.official, false);
  });
  await test('archived case → practice only', () => {
    assert.strictEqual(Submit.evaluate({ caseRow: live({ status: 'archived' }), history: IDEAL, now: NOW }).official, false);
  });
  await test('draft / not-yet-published case is refused', () => {
    assert.strictEqual(Submit.evaluate({ caseRow: live({ status: 'draft' }), history: IDEAL, now: NOW }).error, 'case_not_available');
    assert.strictEqual(Submit.evaluate({ caseRow: live({ publish_at: new Date(+NOW + DAY).toISOString() }), history: IDEAL, now: NOW }).error, 'case_not_available');
  });
  await test('unfinished case is refused', () => {
    assert.strictEqual(Submit.evaluate({ caseRow: live(), history: ['tx_monitor', 'inv_ecg'], now: NOW }).error, 'not_finished');
  });
  await test('made-up action ids are refused', () => {
    assert.strictEqual(Submit.evaluate({ caseRow: live(), history: ['win_game'], now: NOW }).error, 'invalid_history');
  });
  await test('steps the engine would block are refused (e.g. transfer before the team arrives)', () => {
    assert.strictEqual(Submit.evaluate({ caseRow: live(), history: ['inv_ecg', 'disp_cathlab', 'disp_transfer'], now: NOW }).error, 'invalid_history');
  });
  await test('absurd waits / non-strings / huge histories are refused', () => {
    assert.strictEqual(Submit.evaluate({ caseRow: live(), history: ['__wait:999'], now: NOW }).error, 'invalid_history');
    assert.strictEqual(Submit.evaluate({ caseRow: live(), history: [{ score: 100 }], now: NOW }).error, 'invalid_history');
    assert.strictEqual(Submit.evaluate({ caseRow: live(), history: new Array(500).fill('reassess'), now: NOW }).error, 'invalid_history');
    assert.strictEqual(Submit.evaluate({ caseRow: live(), history: 'x', now: NOW }).error, 'invalid_history');
  });
  await test('rank uses score ↓, time ↑, then first to submit', () => {
    const rows = [{ member_id: 'a', score: 90, sim_minutes: 40, created_at: '2026-11-10T10:00Z' }, { member_id: 'b', score: 90, sim_minutes: 35, created_at: '2026-11-10T11:00Z' }, { member_id: 'c', score: 95, sim_minutes: 50, created_at: '2026-11-10T12:00Z' }];
    assert.deepStrictEqual(Submit.rankOf(rows, 'a'), { rank: 3, of: 3 });
    assert.deepStrictEqual(Submit.rankOf(rows, 'c'), { rank: 1, of: 3 });
  });

  /* ---------------- Part 2: the generated edge function ---------------- */
  console.log('Edge function (generated index.ts, mocked Deno + database)');
  const src = path.join(__dirname, '..', 'supabase', 'functions', 'pixel-er-submit', 'index.ts');
  if (!fs.existsSync(src)) { console.log('  (run python3 build.py first)'); process.exit(1); }
  let code = fs.readFileSync(src, 'utf8').replace(/^import \{ createClient \} from 'npm:@supabase\/supabase-js@2';$/m, 'const createClient = (globalThis as any).__createClient;');
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pxedge-')), 'index.mts');
  fs.writeFileSync(tmp, code);

  /* in-memory "database" with a chainable query builder */
  const DB = {
    members: [{ id: 'm1', email: 'Sara@s.mu.edu.sa' }, { id: 'm2', email: 'ali@s.mu.edu.sa' }],
    pixel_cases: [live({ publish_at: new Date(Date.now() - DAY).toISOString(), close_at: new Date(Date.now() + 6 * DAY).toISOString() })], /* the function uses the real clock */
    pixel_attempts: []
  };
  const USERS = { 'tok-sara': 'sara@s.mu.edu.sa', 'tok-ali': 'ali@s.mu.edu.sa', 'tok-guest': 'guest@gmail.com' };
  function q(table) {
    let rows = DB[table].slice();
    const b = {
      select() { return b; },
      eq(k, v) { rows = rows.filter(r => r[k] === v); return b; },
      ilike(k, v) { const re = new RegExp('^' + v.replace(/\\([\\%_])/g, '$1').replace(/[.*+?^${}()|[\]]/g, '\\$&') + '$', 'i'); rows = rows.filter(r => re.test(r[k] || '')); return b; },
      maybeSingle() { return Promise.resolve({ data: rows[0] || null, error: null }); },
      then(res, rej) { return Promise.resolve({ data: rows, error: null }).then(res, rej); },
      insert(rec) {
        if (rec.official && DB.pixel_attempts.some(a => a.official && a.case_id === rec.case_id && a.member_id === rec.member_id))
          return Promise.resolve({ error: { code: '23505', message: 'duplicate key' } });
        DB.pixel_attempts.push(Object.assign({ created_at: new Date().toISOString() }, JSON.parse(JSON.stringify(rec))));
        return Promise.resolve({ error: null });
      }
    };
    return b;
  }
  globalThis.__createClient = () => ({
    auth: { getUser: async (t) => USERS[t] ? { data: { user: { email: USERS[t] } }, error: null } : { data: { user: null }, error: { message: 'bad jwt' } } },
    from: q
  });
  let handler;
  globalThis.Deno = { env: { get: (k) => ({ SUPABASE_URL: 'http://x', SUPABASE_SERVICE_ROLE_KEY: 'secret' })[k] }, serve: (h) => { handler = h; } };
  await import(tmp);
  const call = async (token, body, method) => {
    const res = await handler(new Request('http://x/pixel-er-submit', { method: method || 'POST', headers: token ? { Authorization: 'Bearer ' + token } : {}, body: body === undefined ? undefined : JSON.stringify(body) }));
    return { status: res.status, body: method === 'OPTIONS' ? null : await res.json(), headers: res.headers };
  };

  await test('CORS preflight', async () => { const r = await call(null, undefined, 'OPTIONS'); assert.strictEqual(r.status, 200); assert.ok(r.headers.get('access-control-allow-origin')); });
  await test('no / bad token → 401', async () => { assert.strictEqual((await call(null, { caseId: ACS.id, history: IDEAL })).status, 401); assert.strictEqual((await call('nope', { caseId: ACS.id, history: IDEAL })).status, 401); });
  await test('signed in but not a club member → 403', async () => { assert.strictEqual((await call('tok-guest', { caseId: ACS.id, history: IDEAL })).body.error, 'not_a_member'); });
  await test('member submits → official attempt saved with server score (email case-insensitive)', async () => {
    const r = await call('tok-sara', { caseId: ACS.id, history: IDEAL, score: 100 });
    assert.strictEqual(r.status, 200, JSON.stringify(r.body)); assert.strictEqual(r.body.official, true); assert.strictEqual(r.body.rank, 1);
    const saved = DB.pixel_attempts.filter(a => a.member_id === 'm1');
    assert.strictEqual(saved.length, 1); assert.strictEqual(saved[0].score, r.body.score); assert.ok(saved[0].score < 100 || r.body.score === 100);
  });
  await test('a client-sent score is ignored', async () => {
    const r = await call('tok-ali', { caseId: ACS.id, history: ['inv_ecg', 'disp_ccu'], score: 100 });
    assert.strictEqual(r.body.official, true); assert.ok(r.body.score < 60, String(r.body.score)); assert.strictEqual(r.body.rank, 2); assert.strictEqual(r.body.of, 2);
  });
  await test('replay after the official attempt → practice, official score unchanged', async () => {
    const r = await call('tok-ali', { caseId: ACS.id, history: IDEAL });
    assert.strictEqual(r.body.official, false); assert.ok(r.body.officialScore < 60);
    assert.strictEqual(DB.pixel_attempts.filter(a => a.member_id === 'm2' && a.official).length, 1);
  });
  await test('tampered history → 400, nothing saved', async () => {
    const before = DB.pixel_attempts.length;
    const r = await call('tok-sara', { caseId: ACS.id, history: ['disp_transfer'] });
    assert.strictEqual(r.status, 400); assert.strictEqual(DB.pixel_attempts.length, before);
  });
  await test('unknown case → 404', async () => { assert.strictEqual((await call('tok-sara', { caseId: 'nope', history: IDEAL })).status, 404); });

  console.log(`\n${passed} passed${failed ? ', ' + failed + ' FAILED' : ''}`);
  process.exit(failed ? 1 : 0);
})();
