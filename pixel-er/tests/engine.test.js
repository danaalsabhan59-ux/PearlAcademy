/* Run: node tests/engine.test.js  (no dependencies) */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const core = require('../src/core.js');

const casesDir = path.join(__dirname, '..', 'cases');
const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + e.message); process.exitCode = 1; }
}

console.log('Case files');
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(casesDir, f), 'utf8'));
  test(f + ' validates with no errors', () => {
    const r = core.validateCase(c);
    assert.deepStrictEqual(r.errors, [], r.errors.join('\n'));
  });
  test(f + ' id matches file name', () => assert.strictEqual(c.id + '.json', f));
}

const acs = JSON.parse(fs.readFileSync(path.join(casesDir, 'acs-inferior-stemi.json'), 'utf8'));

console.log('ACS case — clinical paths');
const ideal = ['tx_monitor', 'inv_ecg', 'hx_allergy', 'tx_aspirin', 'hx_onset', 'hx_character', 'hx_back',
  'inv_right_ecg', 'disp_cathlab', 'tx_iv', 'inv_trop', 'inv_bloods', 'tx_senior', 'hx_associated', 'hx_pmh',
  'ex_ab', 'ex_c', 'ex_d', 'ex_heart', 'dx_inf_rv', 'reassess', '__wait:5', 'reassess', '__wait:5', '__wait:5', 'disp_transfer'];

test('ideal path ends well with a high score', () => {
  const sim = core.replay(acs, ideal);
  assert.ok(sim.S.ended, 'case should have ended');
  assert.strictEqual(sim.S.ended.endingId, 'end_excellent');
  const s = sim.score();
  assert.ok(s.total >= 95, 'score was ' + s.total + ' misses: ' + JSON.stringify(s.misses));
  assert.strictEqual(s.penalties.length, 0);
});

test('GTN causes hypotension 2 minutes later; fluids reverse it', () => {
  const sim = new core.Sim(acs);
  sim.perform('tx_monitor'); sim.perform('inv_ecg');
  sim.perform('tx_gtn');
  assert.strictEqual(sim.S.vitals.sbp, 150, 'not yet — event is delayed');
  sim.perform('hx_onset'); sim.perform('hx_pmh');
  assert.strictEqual(sim.S.vitals.sbp, 82);
  assert.strictEqual(sim.S.state, 'deteriorating');
  sim.perform('tx_iv'); sim.perform('tx_fluids');
  assert.strictEqual(sim.S.vitals.sbp, 104);
  assert.strictEqual(sim.S.state, 'improving');
  assert.ok(sim.S.flags.includes('hypotension_treated'));
});

test('morphine while hypotensive -> critical, safety penalty', () => {
  const sim = core.replay(acs, ['tx_iv', 'tx_gtn', '__wait:5', 'tx_morphine']);
  assert.strictEqual(sim.S.state, 'critical');
  const s = sim.score();
  assert.ok(s.penalties.some(p => p.id === 's_morphine_shock'));
});

test('morphine before any hypotension does not crash BP', () => {
  const sim = core.replay(acs, ['tx_iv', 'tx_morphine', '__wait:5']);
  assert.strictEqual(sim.S.vitals.sbp, 150);
});

test('cannot transfer before the team arrives; can after waiting', () => {
  const sim = core.replay(acs, ['inv_ecg', 'disp_cathlab']);
  const r = sim.perform('disp_transfer');
  assert.ok(r.blocked);
  sim.wait(20);
  assert.ok(sim.S.flags.includes('team_ready'));
  sim.perform('disp_transfer');
  assert.ok(sim.S.ended);
});

test('requires blocks actions with reason', () => {
  const sim = new core.Sim(acs);
  const r = sim.perform('inv_trop');
  assert.strictEqual(r.blocked, 'Bloods need IV access first.');
});

test('troponin result only ready after 60 minutes', () => {
  const sim = core.replay(acs, ['tx_iv', 'inv_trop']);
  assert.strictEqual(sim.resultReady('inv_trop').ready, false);
  sim.wait(30); assert.strictEqual(sim.resultReady('inv_trop').ready, false);
});

test('diagnosis group is exclusive', () => {
  const sim = core.replay(acs, ['dx_inf']);
  assert.ok(sim.perform('dx_inf_rv').blocked);
});

test('time limit ends the case with the timeout ending', () => {
  const sim = core.replay(acs, ['__wait:30', '__wait:30']);
  assert.ok(sim.S.ended);
  assert.strictEqual(sim.S.ended.endingId, 'end_timeout');
});

test('CCU admission -> poor ending and penalty', () => {
  const sim = core.replay(acs, ['inv_ecg', 'disp_ccu']);
  assert.strictEqual(sim.S.ended.endingId, 'end_ccu');
  assert.ok(sim.score().penalties.some(p => p.id === 'm_ccu'));
});

test('replay is deterministic', () => {
  const a = core.replay(acs, ideal).score();
  const b = core.replay(acs, ideal).score();
  assert.deepStrictEqual(a, b);
});

test('score never exceeds 100 or drops below 0', () => {
  const all = acs.actions.map(a => a.id);
  const s = core.replay(acs, all).score();
  assert.ok(s.total >= 0 && s.total <= 100, String(s.total));
  const s0 = core.replay(acs, []).score();
  assert.ok(s0.total >= 0 && s0.total <= 100);
});

console.log('Validator');
test('catches broken references and weights', () => {
  const bad = core.clone(acs);
  bad.actions[0].requires = { done: 'nope' };
  bad.scoring.weights.safety = 50;
  bad.actions.push({ id: 'hx_onset', category: 'history', label: 'dup' });
  const r = core.validateCase(bad);
  assert.ok(r.errors.some(e => e.includes('unknown action “nope”')));
  assert.ok(r.errors.some(e => e.includes('add up to 100')));
  assert.ok(r.errors.some(e => e.includes('duplicate id “hx_onset”')));
});

test('published case requires the approver name', () => {
  const c = core.clone(acs); c.status = 'published'; c.review.facultyReviewer = '';
  assert.ok(core.validateCase(c).errors.some(e => e.includes('person who approved')));
});

test('visibility follows status and schedule', () => {
  const c = core.clone(acs);
  c.status = 'published'; c.schedule = { publishAt: '2026-11-10T00:00:00Z', closeAt: '2026-11-17T00:00:00Z' };
  assert.strictEqual(core.caseVisibility(c, new Date('2026-11-08')).visible, false);
  assert.strictEqual(core.caseVisibility(c, new Date('2026-11-12')).mode, 'live');
  assert.strictEqual(core.caseVisibility(c, new Date('2026-11-20')).mode, 'archive');
  c.status = 'draft';
  assert.strictEqual(core.caseVisibility(c, new Date()).visible, false);
  assert.strictEqual(core.caseVisibility(c, new Date(), { preview: true }).visible, true);
});

console.log('\n' + passed + ' passed' + (process.exitCode ? ', some FAILED' : ''));
