/* Accounts + leaderboard in a real browser, with the club server replaced by tests/mock-supabase.js.
   Run:  python3 build.py && node tests/online.test.js   (needs Playwright) */
'use strict';
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('Playwright not installed — skipping.'); process.exit(0); }

const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'index.html');
const MOCK = fs.readFileSync(path.join(__dirname, 'mock-supabase.js'), 'utf8');
const ACS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cases', 'acs-inferior-stemi.json'), 'utf8'));
const IDEAL = ['tx_monitor', 'inv_ecg', 'hx_allergy', 'tx_aspirin', 'hx_onset', 'hx_character', 'hx_back', 'inv_right_ecg', 'disp_cathlab', 'tx_iv', 'inv_trop', 'inv_bloods', 'tx_senior', 'hx_associated', 'hx_pmh', 'ex_ab', 'ex_c', 'ex_d', 'ex_heart', 'dx_inf_rv', 'reassess'];
const SHOTS = process.env.SHOTS || '';
let failed = 0;
function check(name, ok, extra) { console.log((ok ? '  ✓ ' : '  ✗ ') + name + (ok || !extra ? '' : ' — ' + extra)); if (!ok) failed++; }

const now = Date.now(), DAY = 864e5;
const published = Object.assign({}, ACS, { status: 'published', review: Object.assign({}, ACS.review, { facultyReviewer: 'د. فيصل الحسيني' }) });
const ROW = { id: ACS.id, status: 'published', publish_at: new Date(now - DAY).toISOString(), close_at: new Date(now + 6 * DAY).toISOString(), data: published };
const OTHERS = [
  { id: 'x1', case_id: ACS.id, member_id: 'm2', official: true, score: 88, xp: 132, sim_minutes: 41, ending: 'end_good', breakdown: {}, history: [], at: now - 5000 },
  { id: 'x2', case_id: ACS.id, member_id: 'm3', official: true, score: 64, xp: 96, sim_minutes: 52, ending: 'end_good', breakdown: {}, history: [], at: now - 4000 }
];

async function pageWith(browser, seed, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1200, height: 860 }, acceptDownloads: true }, opts || {}));
  const p = await ctx.newPage();
  p.errors = [];
  p.on('pageerror', e => p.errors.push(e.message));
  p.on('dialog', d => d.accept());
  await p.addInitScript(s => { window.__MOCK_SEED = s; }, seed);
  await p.route('**/@supabase/supabase-js@2/**', r => seed === null ? r.abort() : r.fulfill({ contentType: 'application/javascript', body: MOCK }));
  return p;
}
async function skip(p) { for (let i = 0; i < 25 && await p.locator('.px-dialog').isVisible(); i++) { await p.locator('.px-dialog').click(); await p.waitForTimeout(25); } }
async function playIdeal(p) {
  await p.waitForSelector('.px-canvas'); await skip(p);
  /* drive the game through its own engine API (UI path is covered by browser.test.js) */
  await p.evaluate(ids => { const g = document.querySelector('.px-game'); return ids; }, IDEAL);
  const station = async s => { await p.keyboard.press('Escape'); await p.click('[data-act="menu"]'); await p.click(`.px-panel [data-s="${s}"]`); };
  const act = async (id) => { await p.click(`.px-panel [data-a="${id}"]`); await p.waitForTimeout(20); await skip(p); };
  const map = { history: 'patient', exam: 'patient', reassess: 'patient', treatment: 'nurse', procedure: 'nurse', investigation: 'workstation', diagnosis: 'workstation', disposition: 'workstation' };
  const tabOf = { history: 'history', exam: 'exam', reassess: 'exam', treatment: 'tx', procedure: 'proc', investigation: 'inv', diagnosis: 'dx', disposition: 'disp' };
  for (const id of IDEAL) {
    const cat = ACS.actions.find(a => a.id === id).category;
    await station(map[cat]); await p.click(`.px-panel [data-tab="${tabOf[cat]}"]`); await act(id);
  }
  await p.keyboard.press('Escape');
  for (let i = 0; i < 3; i++) { await p.click('[data-act="wait"]'); await skip(p); }
  await station('workstation'); await p.click('.px-panel [data-tab="disp"]'); await act('disp_transfer');
  await p.waitForSelector('.px-end'); await skip(p);
}

(async () => {
  const browser = await chromium.launch();

  console.log('Offline (server unreachable)');
  let p = await pageWith(browser, null);
  await p.goto(FILE); await p.waitForTimeout(400);
  check('home says offline / practice', /Offline/.test(await p.locator('.acct').textContent()));
  check('built-in case still playable', (await p.locator('.home-card h3').allTextContents()).includes('The Heavy Chest'));
  await p.goto(FILE + '#play/acs-inferior-stemi'); await p.waitForSelector('.px-canvas');
  check('guest ribbon shown in game', /sign in with your club email/i.test(await p.locator('.px-ribbon').first().textContent()));
  check('no page errors (offline)', p.errors.length === 0, p.errors.join(' | '));

  console.log('Signed out');
  p = await pageWith(browser, { cases: [ROW] });
  await p.goto(FILE); await p.waitForSelector('.acct-form');
  await p.fill('#acct-mail', 'sara@s.mu.edu.sa'); await p.click('.acct-form button');
  await p.waitForSelector('text=We sent a sign-in link');
  check('sign-in link requested for the typed email', await p.evaluate(() => window.__mock.otp) === 'sara@s.mu.edu.sa');
  await p.goto(FILE + '#board'); await p.waitForTimeout(300);
  check('leaderboard asks guests to sign in', /for club members/.test(await p.textContent('#app')));

  console.log('Member: official attempt → leaderboard');
  p = await pageWith(browser, { email: 'sara@s.mu.edu.sa', cases: [ROW], attempts: OTHERS });
  await p.goto(FILE); await p.waitForSelector('.acct-in');
  const acct = await p.locator('.acct').textContent();
  check('shows full name and study year', acct.includes('سارة محمد عبدالله العتيبي') && acct.includes('السنة الرابعة'), acct);
  check('card says official attempt available', await p.locator('.official-open').isVisible());
  if (SHOTS) await p.screenshot({ path: SHOTS + '/o1-home.png' });
  await p.click('text=Start shift');
  check('official ribbon in game', /OFFICIAL ATTEMPT/.test(await p.locator('.px-ribbon').first().textContent()));
  await playIdeal(p);
  await p.waitForSelector('.px-submit.ok', { timeout: 5000 }).catch(() => {});
  const sub = await p.locator('.px-submit').textContent();
  check('end screen: official score recorded with rank', /Official score recorded/.test(sub) && /Rank #1 of 3/.test(sub), sub);
  if (SHOTS) await p.screenshot({ path: SHOTS + '/o2-end.png' });
  await p.click('.px-submit a');
  await p.waitForSelector('table.board');
  const names = await p.locator('table.board tbody tr td:nth-child(2)').allTextContents();
  check('leaderboard: first + last name, in score order', names.join(' | ') === 'سارة العتيبي | عبد الله آل سعود | ريم الشمري', names.join(' | '));
  const yearCells = await p.locator('table.board tbody tr td:nth-child(3)').allTextContents();
  check('leaderboard shows study year, no committee', yearCells[0] === 'السنة الرابعة' && !(await p.textContent('table.board')).includes('اللجنة'));
  check('my row highlighted', await p.locator('table.board tr.me').count() === 1);
  const years = await p.locator('.years .yr span').allTextContents();
  check('most participating years: 4th year first', years[0] === 'السنة الرابعة', years.join(','));
  if (SHOTS) await p.screenshot({ path: SHOTS + '/o3-board.png', fullPage: true });
  await p.selectOption('.case-pick', '');
  await p.waitForSelector('table.board th:has-text("Total XP")');
  check('overall XP board', (await p.locator('table.board tbody tr').count()) === 3);
  await p.evaluate(() => { location.hash = ''; }); await p.waitForSelector('.official-done');   /* same page: the mock server keeps its data */
  check('home now shows my official score', /Your official score/.test(await p.locator('.official-done').textContent()));
  await p.click('text=Start shift');
  check('replay is practice', /Practice mode/.test(await p.locator('.px-ribbon').first().textContent()));
  await playIdeal(p);
  await p.waitForSelector('.px-submit.info', { timeout: 5000 }).catch(() => {});
  check('practice attempt saved, official unchanged', /Practice attempt saved/.test(await p.locator('.px-submit').textContent()));
  check('server still has exactly one official attempt for me', await p.evaluate(() => window.__mock.attempts.filter(a => a.member_id === 'm1' && a.official).length) === 1);
  check('no page errors (member)', p.errors.length === 0, p.errors.join(' | '));

  console.log('Admin: results + builder publishing');
  p = await pageWith(browser, { email: 'pres@s.mu.edu.sa', cases: [ROW], attempts: OTHERS });
  await p.goto(FILE); await p.waitForSelector('.acct-in');
  check('admin links visible', await p.locator('a[href="#results"]').isVisible() && await p.locator('.acct-in a[href="#admin"]').isVisible());
  await p.goto(FILE + '#results'); await p.waitForSelector('table.res');
  const resText = await p.textContent('table.res');
  check('results show full names + committee', resText.includes('عبد الله فهد آل سعود') && resText.includes('اللجنة العلمية'));
  check('class stats computed', /official attempts/.test(await p.textContent('.stats')));
  if (SHOTS) await p.screenshot({ path: SHOTS + '/o4-results.png', fullPage: true });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-csv]')]);
  check('CSV export', /results\.csv$/.test(dl.suggestedFilename()));
  await p.goto(FILE + '#admin'); await p.waitForSelector('.bd-online.on');
  check('builder shows admin connection', /Club admin/.test(await p.textContent('.bd-online')));
  await p.click('[data-b="dup"]'); await p.fill('[data-p="title"]', 'Week 2 draft');
  await p.selectOption('[data-p="status"]', 'faculty_review');
  await p.click('[data-sec="publish"]');
  await p.click('[data-db="save"]'); await p.waitForSelector('.bd-dbmsg.ok');
  check('admin saves a draft to the database', await p.evaluate(() => window.__mock.upserts.some(u => u.data.title === 'Week 2 draft')));
  await p.click('[data-sec="basics"]'); await p.selectOption('[data-p="status"]', 'published');
  await p.click('[data-sec="publish"]'); await p.click('[data-db="save"]'); await p.waitForSelector('.bd-dbmsg.ok');
  check('president can approve and publish', await p.evaluate(() => window.__mock.upserts.some(u => u.data.title === 'Week 2 draft' && u.status === 'published')));
  await p.goto(FILE + '#admin');
  check('no page errors (admin)', p.errors.length === 0, p.errors.join(' | '));

  console.log('Faculty supervisor');
  p = await pageWith(browser, { email: 'faisal@mu.edu.sa', cases: [ROW], attempts: OTHERS });
  await p.goto(FILE); await p.waitForSelector('.acct-in');
  check('supervisor recognised by name', /فيصل الحسيني/.test(await p.textContent('.acct')) && /Supervisor/.test(await p.textContent('.acct')));
  check('supervisor sees the published case', (await p.locator('.home-card h3').allTextContents()).includes('The Heavy Chest'));
  check('supervisor has no Case Builder link', await p.locator('.acct-in a[href="#admin"]').count() === 0);
  await p.click('text=Start shift');
  check('supervisor ribbon in game', /Supervisor mode/.test(await p.locator('.px-ribbon').first().textContent()));
  await playIdeal(p);
  await p.waitForSelector('.px-submit.info');
  check('supervisor result not sent to the leaderboard', /not added to the student leaderboard/.test(await p.textContent('.px-submit')) && await p.evaluate(() => window.__mock.attempts.length) === 2);
  check('no page errors (supervisor)', p.errors.length === 0, p.errors.join(' | '));

  console.log('Phone');
  p = await pageWith(browser, { email: 'sara@s.mu.edu.sa', cases: [ROW], attempts: OTHERS }, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p.goto(FILE + '#board/' + ACS.id); await p.waitForSelector('table.board');
  check('leaderboard fits a phone (no sideways scroll)', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  if (SHOTS) await p.screenshot({ path: SHOTS + '/o5-phone-board.png' });

  await browser.close();
  console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll online checks passed');
  process.exit(failed ? 1 : 0);
})();
