/* End-to-end smoke test in a real browser.
   Run:  python3 build.py && node tests/browser.test.js
   Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium). */
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('Playwright not installed — skipping browser tests.'); process.exit(0); }

const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'index.html');
let failed = 0;
function check(name, ok, extra) { console.log((ok ? '  ✓ ' : '  ✗ ') + name + (ok || !extra ? '' : ' — ' + extra)); if (!ok) failed++; }

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  /* never touch the real club server from tests: the game must work offline */
  const watch = p => { p.route('**/@supabase/**', r => r.abort()); p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); }); /* the blocked CDN request is expected */ p.on('dialog', d => d.accept()); };

  /* ---- play the ACS case through the UI ---- */
  const page = await browser.newPage({ viewport: { width: 1200, height: 860 } }); watch(page);
  await page.goto(FILE);
  check('home lists the case', (await page.locator('.home-card h3').allTextContents()).includes('The Heavy Chest'));
  await page.goto(FILE + '#play/acs-inferior-stemi');
  const skip = async () => { for (let i = 0; i < 25 && await page.locator('.px-dialog').isVisible(); i++) { await page.locator('.px-dialog').click(); await page.waitForTimeout(25); } };
  await skip();
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(1500); await page.keyboard.up('ArrowUp');
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(1200); await page.keyboard.up('ArrowLeft');
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(700); await page.keyboard.up('ArrowUp');
  check('walking to the bed shows the patient prompt', /patient/i.test(await page.locator('.px-prompt').textContent()));
  await page.keyboard.press('KeyE');
  check('E opens the patient panel', await page.locator('.px-panel h2').filter({ hasText: 'Mr. Khalid' }).isVisible());
  const station = async s => { await page.keyboard.press('Escape'); await page.click('[data-act="menu"]'); await page.click(`.px-panel [data-s="${s}"]`); };
  const act = async id => { await page.click(`.px-panel [data-a="${id}"]`); await page.waitForTimeout(30); await skip(); };
  const tab = async t => page.click(`.px-panel [data-tab="${t}"]`);
  await station('nurse'); await act('tx_monitor');
  check('monitor flag shows vitals in the HUD', /HR/.test(await page.locator('.px-vitals').textContent()));
  await station('workstation'); await act('inv_ecg');
  await station('patient'); await act('hx_allergy');
  check('history answer is shown', await page.locator('.px-resp').filter({ hasText: 'No allergies' }).isVisible());
  await station('nurse'); await act('tx_aspirin');
  await station('patient'); await act('hx_onset'); await act('hx_character'); await act('hx_back');
  await station('workstation'); await act('inv_right_ecg'); await tab('disp'); await act('disp_cathlab');
  await station('nurse'); await tab('proc'); await act('tx_iv'); await act('tx_senior');
  await station('workstation'); await act('inv_trop'); await act('inv_bloods');
  await tab('results'); await page.click('.px-panel [data-r="inv_ecg"]');
  const ecgW = await page.locator('.px-ecg canvas').evaluate(c => c.width);
  check('ECG renders', ecgW > 1000, 'width ' + ecgW);
  await station('patient'); await act('hx_associated'); await act('hx_pmh');
  await tab('exam'); await act('ex_ab'); await act('ex_c'); await act('ex_d'); await act('ex_heart');
  await station('workstation'); await tab('dx'); await act('dx_inf_rv');
  await station('patient'); await tab('exam'); await act('reassess');
  await page.keyboard.press('Escape');
  for (let i = 0; i < 3; i++) { await page.click('[data-act="wait"]'); await skip(); }
  await station('workstation'); await tab('disp'); await act('disp_transfer');
  await page.waitForTimeout(300); await skip(); await page.waitForTimeout(300);
  check('end screen appears', await page.locator('.px-end').isVisible());
  const score = Number(await page.locator('.px-ring b').textContent());
  check('ideal play scores ≥ 90', score >= 90, 'score ' + score);
  check('good outcome', await page.locator('.px-outcome.o-good').isVisible());

  /* ---- builder: edit, export, re-open ---- */
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const b = await ctx.newPage(); watch(b);
  await b.goto(FILE + '#admin');
  await b.click('[data-b="dup"]');
  await b.fill('[data-p="title"]', 'Builder Test Case');
  await b.click('[data-sec="publish"]');
  check('duplicated case validates', await b.locator('.bd-box.ok').isVisible());
  const [dl] = await Promise.all([b.waitForEvent('download'), b.click('[data-x="game"]')]);
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pxer-')), 'index.html');
  await dl.saveAs(out);
  const p2 = await (await browser.newContext()).newPage(); watch(p2);
  await p2.goto('file://' + out);
  check('exported game lists the new case', (await p2.locator('.home-card h3').allTextContents()).includes('Builder Test Case'));

  /* ---- phone ---- */
  const m = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage(); watch(m);
  await m.goto(FILE + '#play/acs-inferior-stemi');
  check('no horizontal scroll on phone', await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll browser checks passed');
  process.exit(failed ? 1 : 0);
})();
