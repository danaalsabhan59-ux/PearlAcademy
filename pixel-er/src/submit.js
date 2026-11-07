/* =====================================================================
   PIXEL ER — Submission check (runs on the SERVER, inside the
   pixel-er-submit edge function; also unit-tested in Node).
   The browser only sends the list of decisions. The score is
   recomputed here from the case stored in the database.
   ===================================================================== */
(function (root) {
  'use strict';
  var Core = (typeof module !== 'undefined' && module.exports) ? require('./core.js') : root.PXCore;
  var MAX_STEPS = 400, MAX_WAIT = 60;
  var VISIBLE = ['published', 'scheduled', 'archived'], LIVE = ['published', 'scheduled'];

  function fail(error, status, detail) { return { ok: false, error: error, status: status || 400, detail: detail || '' }; }

  /* opts: { caseRow: {id,status,publish_at,close_at,data}, history, now: Date, hasOfficial: bool } */
  function evaluate(opts) {
    var row = opts.caseRow, now = opts.now || new Date(), history = opts.history;
    if (!row || !row.data) return fail('case_not_found', 404);
    var pub = row.publish_at ? new Date(row.publish_at) : null, close = row.close_at ? new Date(row.close_at) : null;
    if (VISIBLE.indexOf(row.status) === -1 || (pub && now < pub)) return fail('case_not_available', 403);

    if (!Array.isArray(history) || !history.length || history.length > MAX_STEPS) return fail('invalid_history', 400, 'history must be a non-empty list');
    var ids = {};
    (row.data.actions || []).forEach(function (a) { ids[a.id] = 1; });
    for (var i = 0; i < history.length; i++) {
      var h = history[i];
      if (typeof h !== 'string') return fail('invalid_history', 400, 'step ' + i);
      var m = /^__wait:(\d+)$/.exec(h);
      if (m) { var n = Number(m[1]); if (n < 1 || n > MAX_WAIT) return fail('invalid_history', 400, 'step ' + i); }
      else if (!ids[h]) return fail('invalid_history', 400, 'unknown action ' + h);
    }

    var sim = Core.replay(row.data, history);
    /* Every step must have been accepted by the engine (no blocked or post-ending steps). */
    if (sim.S.history.length !== history.length) return fail('invalid_history', 400, 'steps rejected by the engine');
    if (!sim.S.ended) return fail('not_finished', 400);

    var s = sim.score();
    var live = LIVE.indexOf(row.status) !== -1 && (!close || now < close);
    var breakdown = {};
    s.breakdown.forEach(function (b) { if (b.fraction !== null) breakdown[b.domain] = { points: b.points, of: b.of }; });
    return {
      ok: true,
      official: live && !opts.hasOfficial,
      live: live,
      record: {
        case_id: row.id, official: live && !opts.hasOfficial, score: s.total, xp: s.xp,
        sim_minutes: sim.S.ended.t, ending: sim.S.ended.endingId, breakdown: breakdown, history: history
      }
    };
  }

  /* Rank of a member among official attempts (same order as the SQL leaderboard). */
  function rankOf(rows, memberId) {
    var sorted = rows.slice().sort(function (a, b) {
      return (b.score - a.score) || (a.sim_minutes - b.sim_minutes) || (new Date(a.created_at) - new Date(b.created_at));
    });
    for (var i = 0; i < sorted.length; i++) if (sorted[i].member_id === memberId) return { rank: i + 1, of: sorted.length };
    return { rank: null, of: sorted.length };
  }

  var api = { evaluate: evaluate, rankOf: rankOf, MAX_STEPS: MAX_STEPS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PXSubmit = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
