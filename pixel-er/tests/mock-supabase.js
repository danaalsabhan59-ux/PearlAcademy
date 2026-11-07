/* A stand-in for supabase-js used by tests/online.test.js. It is served in place of the
   CDN script and mimics the club project's PIXEL ER tables, RPCs and edge function. */
(function () {
  'use strict';
  var seed = window.__MOCK_SEED || {};
  var S = window.__mock = {
    session: seed.email ? { user: { email: seed.email }, access_token: 'tok' } : null,
    members: [
      { id: 'm1', email: 'sara@s.mu.edu.sa', full_name: 'سارة محمد عبدالله العتيبي', study_level: 'السنة الرابعة', role: 'member' },
      { id: 'm2', email: 'ali@s.mu.edu.sa', full_name: 'عبد الله فهد آل سعود', study_level: 'السنة الثالثة', role: 'member' },
      { id: 'm3', email: 'reem@s.mu.edu.sa', full_name: 'ريم خالد الشمري', study_level: 'السنة الرابعة', role: 'member' },
      { id: 'm4', email: 'pres@s.mu.edu.sa', full_name: 'نورة سعد الدوسري', study_level: 'السنة الخامسة', role: 'president' }
    ],
    cases: seed.cases || [], attempts: seed.attempts || [], otp: null, upserts: [], listeners: []
  };
  function short(n) { var w = n.trim().split(/\s+/); if (w.length < 2) return w[0]; var f = w[0], fi = 0; if ((w[0] === 'عبد') && w.length >= 3) { f = w[0] + ' ' + w[1]; fi = 1; } var l = w[w.length - 1]; if (w.length - 2 > fi && ['آل', 'بن'].indexOf(w[w.length - 2]) !== -1) l = w[w.length - 2] + ' ' + l; return f + ' ' + l; }
  function me() { return S.session && S.members.filter(function (m) { return m.email === S.session.user.email; })[0]; }
  function official(caseId) { return S.attempts.filter(function (a) { return a.official && (!caseId || a.case_id === caseId); }); }
  function sorted(rows) { return rows.slice().sort(function (a, b) { return (b.score - a.score) || (a.sim_minutes - b.sim_minutes) || (a.at - b.at); }); }
  function mem(id) { return S.members.filter(function (m) { return m.id === id; })[0]; }

  var RPC = {
    pixel_whoami: function () { var m = me(); return m ? [{ member_id: m.id, full_name: m.full_name, study_level: m.study_level, is_admin: m.role === 'president', is_supervisor: false, supervisor_name: null }] : [{ member_id: null, full_name: null, study_level: null, is_admin: false, is_supervisor: false, supervisor_name: null }]; },
    pixel_leaderboard: function (a) { var m = me(); return sorted(official(a.p_case)).map(function (x, i) { var p = mem(x.member_id); return { rank: i + 1, name: short(p.full_name), study_level: p.study_level, score: x.score, sim_minutes: x.sim_minutes, is_me: !!m && m.id === x.member_id }; }); },
    pixel_leaderboard_overall: function () { var by = {}, m = me(); official().forEach(function (x) { var b = by[x.member_id] || (by[x.member_id] = { xp: 0, n: 0 }); b.xp += x.xp; b.n++; }); return Object.keys(by).sort(function (a, b) { return by[b].xp - by[a].xp; }).map(function (id, i) { var p = mem(id); return { rank: i + 1, name: short(p.full_name), study_level: p.study_level, total_xp: by[id].xp, cases_played: by[id].n, is_me: !!m && m.id === id }; }); },
    pixel_participation: function (a) { var by = {}; official(a.p_case).forEach(function (x) { var y = mem(x.member_id).study_level || 'غير محدد'; (by[y] = by[y] || {}); by[y][x.member_id] = 1; }); return Object.keys(by).map(function (y) { return { study_level: y, participants: Object.keys(by[y]).length, entries: Object.keys(by[y]).length }; }).sort(function (a, b) { return b.participants - a.participants; }); },
    pixel_results: function (a) { var m = me(); if (!m || m.role !== 'president') return []; return S.attempts.filter(function (x) { return x.case_id === a.p_case; }).map(function (x) { var p = mem(x.member_id); return { attempt_id: x.id, full_name: p.full_name, study_level: p.study_level, committee: 'اللجنة العلمية', official: x.official, score: x.score, xp: x.xp, sim_minutes: x.sim_minutes, ending: x.ending, breakdown: x.breakdown, history: x.history, created_at: new Date(x.at).toISOString() }; }); }
  };

  function query(table) {
    var rows = table === 'pixel_cases' ? S.cases.slice() : S.attempts.slice(), single = false, payload = null;
    var b = {
      select: function () { return b; },
      eq: function (k, v) { rows = rows.filter(function (r) { return r[k] === v; }); return b; },
      order: function () { return b; },
      upsert: function (p) { payload = p; return b; },
      single: function () { single = true; return b; },
      then: function (res, rej) {
        var out;
        if (payload) {
          var m = me();
          if (!m || m.role !== 'president') out = { data: null, error: { message: 'new row violates row-level security policy' } };
          else { S.upserts.push(payload); var i = S.cases.findIndex(function (c) { return c.id === payload.id; }); var row = { id: payload.id, status: payload.status, publish_at: payload.publish_at, close_at: payload.close_at, data: payload.data }; if (i === -1) S.cases.push(row); else S.cases[i] = row; out = { data: row, error: null }; }
        } else if (table === 'pixel_cases') {
          var mm = me(); rows = rows.filter(function (r) { return (mm && mm.role === 'president') || (['published', 'scheduled', 'archived'].indexOf(r.status) !== -1 && (!r.publish_at || new Date(r.publish_at) <= new Date())); });
          out = { data: single ? rows[0] : rows, error: null };
        } else out = { data: rows.map(function (r) { return { case_id: r.case_id, official: r.official, score: r.score, xp: r.xp, sim_minutes: r.sim_minutes, created_at: new Date(r.at).toISOString() }; }), error: null };
        return Promise.resolve(out).then(res, rej);
      }
    };
    return b;
  }

  var client = {
    auth: {
      getSession: function () { return Promise.resolve({ data: { session: S.session } }); },
      onAuthStateChange: function (cb) { S.listeners.push(cb); return { data: { subscription: { unsubscribe: function () {} } } }; },
      signInWithOtp: function (o) { S.otp = o.email; return Promise.resolve({ error: null }); },
      signOut: function () { S.session = null; S.listeners.forEach(function (cb) { cb('SIGNED_OUT', null); }); return Promise.resolve({ error: null }); }
    },
    rpc: function (fn, args) { return Promise.resolve(RPC[fn] ? { data: RPC[fn](args || {}), error: null } : { data: null, error: { message: 'Could not find the function ' + fn } }); },
    from: query,
    functions: {
      invoke: function (name, o) {
        var m = me(), body = o.body;
        var row = S.cases.filter(function (c) { return c.id === body.caseId; })[0];
        if (!m) return Promise.resolve({ data: null, error: { context: { json: function () { return Promise.resolve({ error: 'not_a_member' }); } } } });
        var sim = window.PXCore.replay(row.data, body.history), s = sim.score();
        if (sim.S.history.length !== body.history.length || !sim.S.ended) return Promise.resolve({ data: null, error: { context: { json: function () { return Promise.resolve({ error: 'invalid_history' }); } } } });
        var live = !row.close_at || new Date(row.close_at) > new Date();
        var prev = S.attempts.filter(function (a) { return a.official && a.case_id === row.id && a.member_id === m.id; })[0];
        var att = { id: 'a' + S.attempts.length, case_id: row.id, member_id: m.id, official: live && !prev, score: s.total, xp: s.xp, sim_minutes: sim.S.ended.t, ending: sim.S.ended.endingId, breakdown: {}, history: body.history, at: Date.now() };
        s.breakdown.forEach(function (b) { if (b.fraction !== null) att.breakdown[b.domain] = { points: b.points, of: b.of }; });
        S.attempts.push(att);
        var r = sorted(official(row.id)).findIndex(function (a) { return a.member_id === m.id; });
        return Promise.resolve({ data: { ok: true, official: att.official, live: live, score: att.score, xp: att.xp, ending: att.ending, officialScore: att.official ? att.score : (prev ? prev.score : null), rank: r + 1, of: official(row.id).length }, error: null });
      }
    }
  };
  window.supabase = { createClient: function () { return client; } };
})();
