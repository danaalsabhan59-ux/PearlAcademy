/* =====================================================================
   PIXEL ER — App shell: home, sign-in, routing, leaderboard, results,
   preview and builder.
   ===================================================================== */
(function (root) {
  'use strict';
  /* Snapshot of the untouched page, used by the builder to export a new
     index.html with different cases inside. Must run before anything renders. */
  root.PX_PRISTINE = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

  var Core = root.PXCore, G = root.PXGame, Online = root.PXOnline, esc = G.esc, store = G.store;
  var app = document.getElementById('app');
  var LOCAL = [], CONFIG = { showUnreviewed: true };
  try { LOCAL = JSON.parse(document.getElementById('px-cases').textContent) || []; } catch (e) { LOCAL = []; }
  try { CONFIG = Object.assign(CONFIG, JSON.parse(document.getElementById('px-config').textContent || '{}')); } catch (e) { /* keep defaults */ }
  var current = null, sentTo = '', connecting = !!(CONFIG.supabaseUrl && CONFIG.supabaseKey);

  function stop() { if (current && current.destroy) current.destroy(); current = null; app.className = ''; }

  /* Members who are signed in play the cases from the club database; everyone else plays the built-in cases for practice. */
  function onlineMember() { return Online.status === 'signed-in' && !Online.setupMissing && Array.isArray(Online.cases); }
  function allCases() { return onlineMember() ? Online.cases : LOCAL; }
  function caseById(id) { return allCases().filter(function (c) { return c.id === id; })[0]; }
  function visibility(c) { return Core.caseVisibility(c, new Date(), { preview: onlineMember() ? Online.canManage() : CONFIG.showUnreviewed }); }
  function attemptMode(c, vis) {
    if (onlineMember() && Online.me && Online.me.is_supervisor) return 'supervisor';   /* faculty play freely, off the student leaderboard (even if also listed as a member) */
    if (!onlineMember() || !Online.me || !Online.me.member_id) return 'guest';
    var mine = Online.mine[c.id];
    return vis.mode === 'live' && !(mine && mine.official) ? 'official' : 'practice';
  }
  function fmtDate(v) { var d = new Date(v); return isNaN(d) ? '' : d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }

  /* ---------------- home ---------------- */
  /* Members-only: the game reuses the club platform's sign-in (same site, same session). */
  function allowed() { return onlineMember() && !!Online.me && !!(Online.me.member_id || Online.me.is_supervisor); }
  function gate(kind) {
    stop();
    app.className = 'home gate';
    var msg;
    if (connecting) msg = '<p class="g-muted">جاري الاتصال بمنصة النادي…</p>';
    else if (kind === 'admin' && allowed()) msg = '<h2>إدارة الحالات للرئيسة والنائبة فقط</h2><p><a class="px-btn" href="#">← رجوع للعبة</a></p>';
    else if (Online.status === 'offline') msg = '<h2>تحتاج اتصال بالإنترنت</h2><p>PIXEL ER مربوطة بمنصة النادي، فتأكد من اتصالك وحدّث الصفحة.</p><p><button class="px-btn" onclick="location.reload()">↻ تحديث</button></p>';
    else if (Online.setupMissing) msg = '<h2>اللعبة غير متاحة حاليًا</h2><p>حاول مرة ثانية بعد شوي.</p>';
    else if (Online.status === 'not-member') msg = '<h2>هذا الحساب غير مسجّل كعضو في النادي</h2><p>PIXEL ER لأعضاء نادي طب الطوارئ فقط.<br>إذا كنت عضوًا، سجّل دخولك في المنصة بالإيميل المسجّل في النادي.</p><p><a class="px-btn" href="' + esc(CONFIG.platformUrl || '/') + '">الذهاب لمنصة النادي</a></p>';
    else msg = '<h2>PIXEL ER لأعضاء النادي فقط</h2><p>سجّل دخولك في <b>منصة النادي</b> أولًا،<br>ثم افتح اللعبة من القائمة: <b>التعلّم ← PIXEL ER</b></p><p><a class="px-btn" href="' + esc(CONFIG.platformUrl || '/') + '">تسجيل الدخول في المنصة</a></p>';
    app.innerHTML = '<div class="gate-card" dir="rtl"><img class="logo" src="/*LOGO*/" alt="نادي طب الطوارئ"><h1 class="pixel-title" dir="ltr">PIXEL&nbsp;ER</h1><p class="tagline" dir="ltr">Your Shift. Your Decisions.</p>' + msg + '</div>';
  }
  function accountBar() {
    if (!allowed()) return '';
    var me = Online.me || {};
    return '<section class="acct"><div class="acct-in"><div>👋 <b>' + esc(Online.displayName() || Online.email()) + '</b>' + (me.study_level ? ' · ' + esc(me.study_level) : '') +
      (me.is_admin ? ' · <span class="chip">Club admin</span>' : me.is_supervisor ? ' · <span class="chip">Supervisor</span>' : '') + '</div>' +
      '<div class="acct-links"><a href="#board">🏆 Leaderboards</a>' + (Online.canManage() ? ' <a href="#results">📊 Results</a>' : '') + (Online.canPublish() ? ' <a href="#admin">🛠 Case Builder</a>' : '') +
      ' <a href="' + esc(CONFIG.platformUrl || '/') + '">↩ منصة النادي</a></div></div></section>';
  }

  function card(c, mode) {
    var p = c.patient || {}, best = store('pxer.best.' + c.id), mine = Online.mine[c.id];
    var chip = mode === 'live' ? '<span class="chip live">THIS WEEK</span>' : mode === 'archive' ? '<span class="chip">ARCHIVE · practice</span>' : '<span class="chip warn">' + esc(Core.STATUS_LABELS[c.status] || 'Draft') + ' — not yet approved</span>';
    var closes = mode === 'live' && c.schedule && c.schedule.closeAt ? '<span class="muted">Closes ' + esc(fmtDate(c.schedule.closeAt)) + '</span>' : '';
    var status = '';
    if (onlineMember() && Online.me && Online.me.member_id) {
      if (mine && mine.official) status = '<p class="official-done">✅ Your official score: <b>' + mine.official.score + '/100</b> · replays are practice</p>';
      else if (mode === 'live') status = '<p class="official-open">🏆 Official attempt available — your first completed shift counts</p>';
    }
    var boardBtn = onlineMember() && mode !== 'preview' ? '<a class="px-btn ghost" href="#board/' + encodeURIComponent(c.id) + '">🏆 Leaderboard</a>' : '';
    var localBest = !onlineMember() && best ? '<span class="best">Best on this device: ' + best.total + '/100</span>' : '';
    return '<article class="home-card ' + mode + '">' + chip +
      '<h3>' + esc(c.title) + '</h3><p class="tag">' + esc(c.tagline || '') + '</p>' +
      '<p class="meta">' + esc([c.category, c.difficulty, c.durationMin ? '~' + c.durationMin + ' min' : ''].filter(Boolean).join(' · ')) + '</p>' +
      '<p class="cc"><b>' + esc((p.age ? p.age + ' y ' : '') + (p.sex === 'F' ? 'female' : p.sex === 'M' ? 'male' : '')) + '</b> — ' + esc(p.chiefComplaint || '') + '</p>' +
      ((c.objectives || []).length ? '<details><summary>Learning objectives</summary><ul>' + c.objectives.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></details>' : '') +
      status +
      '<div class="row"><a class="px-btn" href="#play/' + encodeURIComponent(c.id) + '">▶ Start shift</a>' + boardBtn + localBest + closes + '</div></article>';
  }

  function home() {
    if (CONFIG.membersOnly !== false && !allowed()) { gate(); return; }
    stop();
    app.className = 'home';
    var live = [], prev = [], arch = [];
    allCases().forEach(function (c) {
      var v = visibility(c); if (!v.visible) return;
      (v.mode === 'live' ? live : v.mode === 'archive' ? arch : prev).push(c);
    });
    var avatar = store('pxer.avatar') || 'doctor_m';
    app.innerHTML =
      '<header class="home-hero">' +
        '<img class="logo" src="/*LOGO*/" alt="Emergency Medicine Club — Majmaah University">' +
        '<div><h1 class="pixel-title">PIXEL&nbsp;ER</h1><p class="tagline">Your Shift. Your Decisions.</p>' +
        '<p class="sub">Case of the Week · Emergency Medicine Club · Majmaah University</p></div>' +
      '</header>' + accountBar() +
      '<section class="avatar-pick" aria-label="Choose your doctor"><span>Your doctor:</span>' +
        ['doctor_m', 'doctor_f'].map(function (k) { return '<button data-av="' + k + '" aria-pressed="' + (avatar === k) + '" aria-label="' + (k === 'doctor_f' ? 'Female doctor' : 'Male doctor') + '"><canvas width="48" height="48"></canvas></button>'; }).join('') +
      '</section>' +
      (live.length ? '<h2 class="home-h">This week’s case</h2>' + live.map(function (c) { return card(c, 'live'); }).join('') : '') +
      (prev.length ? '<h2 class="home-h">' + (onlineMember() ? 'Not yet published (visible to admins only)' : live.length ? 'Preview cases' : 'Cases') + '</h2>' + prev.map(function (c) { return card(c, 'preview'); }).join('') : '') +
      (!live.length && !prev.length ? '<p class="empty">No case is live right now. Check back soon.</p>' : '') +
      (arch.length ? '<h2 class="home-h">Archive</h2>' + arch.map(function (c) { return card(c, 'archive'); }).join('') : '') +
      '<details class="howto"><summary>How to play</summary><ol>' +
        '<li>Listen to the handover, then walk around the resus room. <b>Arrow keys / WASD</b> on a computer, or the on-screen pad on a phone.</li>' +
        '<li>Stand next to someone or something and press <b>E</b> (or tap the prompt): the <b>patient</b> for history and examination, the <b>nurse</b> for treatments, the <b>workstation</b> for tests, your diagnosis and the plan, and the <b>monitor</b> for vital signs.</li>' +
        '<li>Every action takes simulated minutes, and the patient responds to your decisions. Results come back after a realistic delay. Use <b>⏱ Wait</b> when you need time to pass.</li>' +
        '<li>No time to walk? <b>☰ Stations</b> opens any station directly.</li>' +
        '<li>Your score rewards safe, structured care, not speed. <b>Your first completed shift each week is your official score</b>; replays are practice.</li></ol></details>' +
      '<footer class="home-foot"><p>Educational simulation for medical students. It is not clinical decision support. Every case is reviewed and approved by the club before it is published.</p>' +
        '<a href="#admin" class="admin-link">Case Builder (club admins)</a></footer>';
    Array.prototype.forEach.call(app.querySelectorAll('[data-av]'), function (b) {
      root.PXArt.drawPortrait(b.querySelector('canvas'), b.getAttribute('data-av'));
      b.onclick = function () { store('pxer.avatar', b.getAttribute('data-av')); Array.prototype.forEach.call(app.querySelectorAll('[data-av]'), function (x) { x.setAttribute('aria-pressed', x === b); }); };
    });
  }
  function alertMsg(el, msg) { var p = el.querySelector('.err') || el.appendChild(document.createElement('p')); p.className = 'err'; p.textContent = msg; }

  /* ---------------- play ---------------- */
  var SUBMIT_MSG = {
    not_signed_in: 'Your session expired — sign in again on the home page, then replay to submit.',
    not_a_member: 'This email isn\'t registered as a club member, so the score wasn\'t recorded.',
    case_not_available: 'This case isn\'t open for submissions.',
    not_finished: 'The case wasn\'t finished.',
    invalid_history: 'The server couldn\'t verify this attempt, so it wasn\'t recorded.',
    too_many_attempts: 'You\'ve reached the attempt limit for this case.',
    member_lookup_failed: 'The club server had a problem saving this attempt. It is kept on this device and will be sent automatically next time you open PIXEL ER.',
    network: 'Couldn\'t reach the club server. Your attempt is saved on this device and will be sent automatically next time you open PIXEL ER.'
  };

  function play(c, opts) {
    stop();
    opts = opts || {};
    if (CONFIG.membersOnly !== false && !opts.preview && !allowed()) { gate(); return; }
    var vis = visibility(c), mode = opts.preview ? 'preview' : attemptMode(c, vis);
    var el = document.createElement('div'); app.innerHTML = ''; app.appendChild(el); app.className = 'playing';
    var g = new G.Game(el, c, Object.assign({
      avatar: store('pxer.avatar') || 'doctor_m',
      mode: mode,
      onExit: function () { location.hash = opts.preview ? '#admin' : ''; if (!opts.preview) home(); },
      onReplay: function () { play(c, Object.assign({}, opts, { fresh: true })); },
      onFinish: function (res, slot) {
        if (!slot) return;
        if (mode === 'preview') return;
        slot.hidden = false;
        if (mode === 'supervisor') { slot.className = 'px-submit info'; slot.innerHTML = 'Supervisor play: your score is shown here only and is not added to the student leaderboard. <a href="#board/' + encodeURIComponent(c.id) + '">🏆 View the student leaderboard</a>'; return; }
        if (mode === 'guest') { slot.className = 'px-submit info'; slot.innerHTML = 'Practice score — <a href="#">sign in with your club email</a> to compete on the leaderboard.'; return; }
        slot.className = 'px-submit wait'; slot.textContent = mode === 'official' ? 'Saving your official attempt…' : 'Saving your practice attempt…';
        Online.submit(c.id, res.history).then(function (r) {
          if (!r || r.error) { slot.className = 'px-submit bad'; slot.textContent = SUBMIT_MSG[r && r.error] || ('Not recorded: ' + (r && r.error)); return; }
          var board = '<a href="#board/' + encodeURIComponent(c.id) + '">🏆 View leaderboard</a>';
          if (r.official) { slot.className = 'px-submit ok'; slot.innerHTML = '✅ <b>Official score recorded: ' + r.score + '/100</b> (+' + r.xp + ' XP) · Rank <b>#' + r.rank + '</b> of ' + r.of + ' · ' + board; }
          else { slot.className = 'px-submit info'; slot.innerHTML = 'Practice attempt saved (' + r.score + '/100).' + (r.officialScore != null ? ' Your official score for this case is <b>' + r.officialScore + '/100</b>.' : ' Official attempts are closed for this case.') + ' ' + board; }
        });
      }
    }, opts));
    g.mount(); current = g;
  }

  /* ---------------- leaderboard ---------------- */
  function needMember(title) {
    if (CONFIG.membersOnly !== false) { gate(); return; }
    app.className = 'home page';
    app.innerHTML = '<a class="back" href="#">← PIXEL ER</a><h1 class="page-h">' + title + '</h1>' +
      (connecting ? '<p class="muted">Connecting…</p>' : '<p>Leaderboards are for club members. <a href="#">Sign in on the home page</a> with your club email.</p>');
  }
  function bars(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return Number(r.participants); }).concat([1]));
    return rows.length ? '<div class="years">' + rows.map(function (r) {
      return '<div class="yr"><span>' + esc(r.study_level) + '</span><div><i style="width:' + Math.round(Number(r.participants) / max * 100) + '%"></i></div><b>' + r.participants + '</b></div>';
    }).join('') + '</div>' : '<p class="muted">No official attempts yet.</p>';
  }
  function caseOptions(sel, allowAll) {
    var list = allCases().filter(function (c) { var v = visibility(c); return v.visible && v.mode !== 'preview'; });
    return '<select class="case-pick">' + (allowAll ? '<option value=""' + (!sel ? ' selected' : '') + '>All cases — total XP</option>' : '') +
      list.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === sel ? ' selected' : '') + '>' + esc(c.title) + '</option>'; }).join('') + '</select>';
  }
  function medal(n) { return n === 1 ? '🥇' : n === 2 ? '🥈' : n === 3 ? '🥉' : '#' + n; }

  function board(caseId) {
    stop();
    if (!onlineMember()) { needMember('Leaderboard'); return; }
    if (caseId === null) { var v = allCases().filter(function (c) { return visibility(c).mode === 'live'; })[0]; location.replace(v ? '#board/' + encodeURIComponent(v.id) : '#board/all'); return; }
    var c = caseId ? caseById(caseId) : null;
    app.className = 'home page';
    app.innerHTML = '<a class="back" href="#">← PIXEL ER</a><h1 class="page-h">🏆 Leaderboard</h1>' + caseOptions(caseId, true) +
      (c ? '<p class="muted">' + esc(c.title) + (c.schedule && c.schedule.closeAt ? ' · ' + (new Date(c.schedule.closeAt) > new Date() ? 'closes ' : 'closed ') + esc(fmtDate(c.schedule.closeAt)) : '') + '</p>' : '<p class="muted">Total XP from official attempts across all cases.</p>') +
      '<div class="board-body"><p class="muted">Loading…</p></div>';
    app.querySelector('.case-pick').onchange = function (e) { location.hash = '#board' + (e.target.value ? '/' + encodeURIComponent(e.target.value) : '/all'); };
    var body = app.querySelector('.board-body');
    var jobs = caseId ? [Online.leaderboard(caseId), Online.participation(caseId), Online.participation(null)] : [Online.overall(), Online.participation(null), Promise.resolve(null)];
    Promise.all(jobs).then(function (r) {
      var rows = r[0], me = rows.filter(function (x) { return x.is_me; })[0], top = rows.slice(0, 50);
      if (me && top.indexOf(me) === -1) top = top.concat([{ gap: true }, me]);
      var html = '';
      if (me) html += '<div class="me-card">Your position: <b>' + medal(Number(me.rank)) + '</b> of ' + rows.length + ' · ' + (caseId ? '<b>' + me.score + '/100</b>' : '<b>' + me.total_xp + ' XP</b>') + '</div>';
      else if (caseId) html += '<div class="me-card muted">You haven\'t submitted an official attempt for this case yet.</div>';
      html += rows.length ? '<table class="board"><thead><tr><th>Rank</th><th>Name</th><th>Year</th><th>' + (caseId ? 'Score</th><th>Time' : 'Total XP</th><th>Cases') + '</th></tr></thead><tbody>' + top.map(function (x) {
        if (x.gap) return '<tr class="gap"><td colspan="5">…</td></tr>';
        var n = Number(x.rank);
        return '<tr class="' + (x.is_me ? 'me' : '') + (n <= 3 ? ' podium' : '') + '"><td class="rk">' + medal(n) + '</td><td>' + esc(x.name) + '</td><td>' + esc(x.study_level || '—') + '</td>' +
          (caseId ? '<td><b>' + x.score + '</b></td><td>' + x.sim_minutes + ' min</td>' : '<td><b>' + x.total_xp + '</b></td><td>' + x.cases_played + '</td>') + '</tr>';
      }).join('') + '</tbody></table><p class="fine">Ties are broken by less time inside the case, then by who submitted first. Only each member\'s first completed shift (official attempt) counts.</p>' : '<p class="muted">No official attempts yet — be the first!</p>';
      html += '<h2 class="home-h">Most participating years' + (caseId ? ' — this case' : ' — all cases') + '</h2>' + bars(r[1]);
      if (caseId && r[2]) html += '<h2 class="home-h">Most participating years — all cases</h2>' + bars(r[2]);
      body.innerHTML = html;
    }, function (e) { body.innerHTML = '<p class="err">Couldn\'t load the leaderboard: ' + esc(e.message || e) + '</p>'; });
  }

  /* ---------------- results (club admins; supervisors can view) ---------------- */
  function csvCell(v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function results(caseId) {
    stop();
    if (!onlineMember() || !Online.canManage()) { needMember('Results'); if (onlineMember()) app.querySelector('p').textContent = 'Results are for club admins.'; return; }
    var list = allCases();
    if (!caseId && list.length) { var lv = list.filter(function (c) { return visibility(c).mode === 'live'; })[0] || list[0]; location.replace('#results/' + encodeURIComponent(lv.id)); return; }
    var c = caseById(caseId);
    app.className = 'home page wide';
    app.innerHTML = '<a class="back" href="#">← PIXEL ER</a><h1 class="page-h">📊 Results</h1><select class="case-pick">' + list.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === caseId ? ' selected' : '') + '>' + esc(x.title) + ' (' + esc(Core.STATUS_LABELS[x.status] || x.status) + ')</option>'; }).join('') + '</select><div class="res-body"><p class="muted">Loading…</p></div>';
    app.querySelector('.case-pick').onchange = function (e) { location.hash = '#results/' + encodeURIComponent(e.target.value); };
    var body = app.querySelector('.res-body');
    Online.results(caseId).then(function (rows) {
      var off = rows.filter(function (r) { return r.official; });
      var avg = off.length ? Math.round(off.reduce(function (a, r) { return a + r.score; }, 0) / off.length) : 0;
      var dom = {}; off.forEach(function (r) { Object.keys(r.breakdown || {}).forEach(function (k) { var d = dom[k] || (dom[k] = { p: 0, of: 0 }); d.p += Number(r.breakdown[k].points); d.of += Number(r.breakdown[k].of); }); });
      var endings = {}; off.forEach(function (r) { endings[r.ending] = (endings[r.ending] || 0) + 1; });
      var actLabel = function (id) { var a = c && (c.actions || []).filter(function (x) { return x.id === id; })[0]; return a ? a.label : id.indexOf('__wait:') === 0 ? 'Wait ' + id.slice(7) + ' min' : id; };
      var endTitle = function (id) { var e = c && (c.endings || []).filter(function (x) { return x.id === id; })[0]; return e ? e.title : id; };
      var html = '<div class="stats"><div><b>' + off.length + '</b><span>official attempts</span></div><div><b>' + avg + '</b><span>average score</span></div><div><b>' + (rows.length - off.length) + '</b><span>practice attempts</span></div></div>';
      if (off.length) {
        html += '<h2 class="home-h">Class performance by domain</h2><div class="years">' + Core.DOMAINS.filter(function (k) { return dom[k]; }).map(function (k) {
          var pc = Math.round(dom[k].p / dom[k].of * 100); return '<div class="yr"><span>' + esc(Core.DOMAIN_LABELS[k]) + '</span><div><i style="width:' + Math.max(0, pc) + '%"></i></div><b>' + pc + '%</b></div>';
        }).join('') + '</div><h2 class="home-h">Outcomes</h2><ul class="endings">' + Object.keys(endings).map(function (k) { return '<li>' + esc(endTitle(k)) + ': <b>' + endings[k] + '</b></li>'; }).join('') + '</ul>';
      }
      html += '<p><button class="px-btn sm ghost" data-csv>⬇ Download CSV</button></p><div class="tbl-wrap"><table class="board res"><thead><tr><th>Name</th><th>Year</th><th>Committee</th><th>Type</th><th>Score</th><th>XP</th><th>Time</th><th>Outcome</th><th>Submitted</th><th></th></tr></thead><tbody>' +
        rows.map(function (r, i) {
          return '<tr class="' + (r.official ? '' : 'practice') + '"><td>' + esc(r.full_name) + '</td><td>' + esc(r.study_level || '—') + '</td><td>' + esc(r.committee || '—') + '</td><td>' + (r.official ? 'Official' : 'Practice') + '</td><td><b>' + r.score + '</b></td><td>' + r.xp + '</td><td>' + r.sim_minutes + ' min</td><td>' + esc(endTitle(r.ending)) + '</td><td>' + esc(fmtDate(r.created_at)) + '</td><td><button class="linkbtn" data-tl="' + i + '">Timeline</button></td></tr>' +
            '<tr class="tl" hidden data-tlrow="' + i + '"><td colspan="10"><ol>' + (r.history || []).map(function (h) { return '<li>' + esc(actLabel(h)) + '</li>'; }).join('') + '</ol></td></tr>';
        }).join('') + '</tbody></table></div>';
      if (!rows.length) html = '<p class="muted">No attempts yet.</p>';
      body.innerHTML = html;
      Array.prototype.forEach.call(body.querySelectorAll('[data-tl]'), function (b) { b.onclick = function () { var row = body.querySelector('[data-tlrow="' + b.getAttribute('data-tl') + '"]'); row.hidden = !row.hidden; }; });
      var csv = body.querySelector('[data-csv]');
      if (csv) csv.onclick = function () {
        var lines = [['name', 'study_year', 'committee', 'type', 'score', 'xp', 'sim_minutes', 'outcome', 'submitted_at'].join(',')].concat(rows.map(function (r) {
          return [r.full_name, r.study_level, r.committee, r.official ? 'official' : 'practice', r.score, r.xp, r.sim_minutes, endTitle(r.ending), r.created_at].map(csvCell).join(',');
        }));
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv' })); a.download = 'pixel-er-' + caseId + '-results.csv'; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 500);
      };
    }, function (e) { body.innerHTML = '<p class="err">Couldn\'t load results: ' + esc(e.message || e) + '</p>'; });
  }

  /* ---------------- builder ---------------- */
  function admin() {
    if (CONFIG.membersOnly !== false && !Online.canPublish()) { gate('admin'); return; }
    stop();
    var el = document.createElement('div'); app.innerHTML = ''; app.appendChild(el); app.className = 'admin';
    var b = new root.PXBuilder.Builder(el, {
      cases: LOCAL, config: CONFIG, online: Online,
      onPreview: function (c) { try { sessionStorage.setItem('pxer.preview', JSON.stringify(c)); } catch (e) { /* ignore */ } previewCase = c; location.hash = '#preview'; },
      onExit: function () { location.hash = ''; },
      onPublished: function () { Online.loadCases(); }
    });
    b.mount(); current = null; builderRef = b;
  }
  var builderRef = null;

  var previewCase = null;
  function route() {
    var hsh = location.hash || '';
    if (/access_token|error_description/.test(hsh)) { home(); return; }
    if (hsh.indexOf('#play/') === 0) {
      if (connecting) { stop(); app.className = 'home page'; app.innerHTML = '<p class="muted">Connecting to the club server…</p>'; return; }   /* so members never start in the wrong mode */
      var c = caseById(decodeURIComponent(hsh.slice(6)));
      if (c && visibility(c).visible) play(c, {}); else home();
    } else if (hsh.indexOf('#board') === 0) {
      var rest = hsh.slice(7);                       /* #board → this week · #board/all → total XP · #board/<id> */
      board(hsh === '#board' ? null : rest === 'all' ? '' : decodeURIComponent(rest));
    }
    else if (hsh.indexOf('#results') === 0) results(hsh.length > 9 ? decodeURIComponent(hsh.slice(9)) : '');
    else if (hsh === '#admin') admin();
    else if (hsh === '#preview') {
      var pc = previewCase;
      if (!pc) { try { pc = JSON.parse(sessionStorage.getItem('pxer.preview')); } catch (e) { pc = null; } }
      if (pc) play(pc, { preview: true, fresh: true }); else admin();
    } else home();
  }
  root.addEventListener('hashchange', route);
  route();

  /* Connect to the club server in the background; re-render when the account state is known. */
  function rerender() {
    if (location.hash === '#admin' && builderRef) builderRef.refreshOnline();   /* never remount the builder mid-edit */
    else if (!current || !current.running) route();
  }
  Online.onChange(rerender);
  Online.init(CONFIG).then(function () { connecting = false; rerender(); });
})(window);
