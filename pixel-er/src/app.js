/* =====================================================================
   PIXEL ER — App shell: home screen, routing, preview, builder.
   ===================================================================== */
(function (root) {
  'use strict';
  /* Snapshot of the untouched page, used by the builder to export a new
     index.html with different cases inside. Must run before anything renders. */
  root.PX_PRISTINE = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

  var Core = root.PXCore, G = root.PXGame, esc = G.esc, store = G.store;
  var app = document.getElementById('app');
  var CASES = [], CONFIG = { showUnreviewed: true };
  try { CASES = JSON.parse(document.getElementById('px-cases').textContent) || []; } catch (e) { CASES = []; }
  try { CONFIG = Object.assign(CONFIG, JSON.parse(document.getElementById('px-config').textContent || '{}')); } catch (e) { /* keep defaults */ }
  var current = null;

  function stop() { if (current && current.destroy) current.destroy(); current = null; app.className = ''; }

  function caseById(id) { return CASES.filter(function (c) { return c.id === id; })[0]; }

  function card(c, mode) {
    var best = store('pxer.best.' + c.id), p = c.patient || {};
    var chip = mode === 'live' ? '<span class="chip live">THIS WEEK</span>' : mode === 'archive' ? '<span class="chip">ARCHIVE · practice</span>' : '<span class="chip warn">' + esc(Core.STATUS_LABELS[c.status] || 'Draft') + ' — not yet faculty-approved</span>';
    var closes = mode === 'live' && c.schedule && c.schedule.closeAt ? '<span class="muted">Closes ' + esc(new Date(c.schedule.closeAt).toLocaleString()) + '</span>' : '';
    return '<article class="home-card ' + mode + '">' + chip +
      '<h3>' + esc(c.title) + '</h3><p class="tag">' + esc(c.tagline || '') + '</p>' +
      '<p class="meta">' + esc([c.category, c.difficulty, c.durationMin ? '~' + c.durationMin + ' min' : ''].filter(Boolean).join(' · ')) + '</p>' +
      '<p class="cc"><b>' + esc((p.age ? p.age + ' y ' : '') + (p.sex === 'F' ? 'female' : p.sex === 'M' ? 'male' : '')) + '</b> — ' + esc(p.chiefComplaint || '') + '</p>' +
      ((c.objectives || []).length ? '<details><summary>Learning objectives</summary><ul>' + c.objectives.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></details>' : '') +
      '<div class="row"><a class="px-btn" href="#play/' + encodeURIComponent(c.id) + '">▶ Start shift</a>' + (best ? '<span class="best">Best: ' + best.total + '/100 · ' + best.xp + ' XP</span>' : '') + closes + '</div></article>';
  }

  function home() {
    stop();
    app.className = 'home';
    var now = new Date(), live = [], prev = [], arch = [];
    CASES.forEach(function (c) {
      var v = Core.caseVisibility(c, now, { preview: CONFIG.showUnreviewed });
      if (!v.visible) return;
      (v.mode === 'live' ? live : v.mode === 'archive' ? arch : prev).push(c);
    });
    var avatar = store('pxer.avatar') || 'doctor_m';
    app.innerHTML =
      '<header class="home-hero">' +
        '<img class="logo" src="/*LOGO*/" alt="Emergency Medicine Club — Majmaah University">' +
        '<div><h1 class="pixel-title">PIXEL&nbsp;ER</h1><p class="tagline">Your Shift. Your Decisions.</p>' +
        '<p class="sub">Case of the Week · Emergency Medicine Club · Majmaah University</p></div>' +
      '</header>' +
      '<section class="avatar-pick" aria-label="Choose your doctor"><span>Your doctor:</span>' +
        ['doctor_m', 'doctor_f'].map(function (k) { return '<button data-av="' + k + '" aria-pressed="' + (avatar === k) + '"><canvas width="48" height="48"></canvas></button>'; }).join('') +
      '</section>' +
      (live.length ? '<h2 class="home-h">This week’s case</h2>' + live.map(function (c) { return card(c, 'live'); }).join('') : '') +
      (prev.length ? '<h2 class="home-h">' + (live.length ? 'Preview cases' : 'Cases') + '</h2>' + prev.map(function (c) { return card(c, 'preview'); }).join('') : '') +
      (!live.length && !prev.length ? '<p class="empty">No case is live right now. Check back soon.</p>' : '') +
      (arch.length ? '<h2 class="home-h">Archive</h2>' + arch.map(function (c) { return card(c, 'archive'); }).join('') : '') +
      '<details class="howto"><summary>How to play</summary><ol>' +
        '<li>Listen to the handover, then walk around the resus room. <b>Arrow keys / WASD</b> on a computer, or the on-screen pad on a phone.</li>' +
        '<li>Stand next to someone or something and press <b>E</b> (or tap the prompt): the <b>patient</b> for history and examination, the <b>nurse</b> for treatments, the <b>workstation</b> for tests, your diagnosis and the plan, and the <b>monitor</b> for vital signs.</li>' +
        '<li>Every action takes simulated minutes, and the patient responds to your decisions. Results come back after a realistic delay. Use <b>⏱ Wait</b> when you need time to pass.</li>' +
        '<li>No time to walk? <b>☰ Stations</b> opens any station directly.</li>' +
        '<li>Your score rewards safe, structured care, not speed. You can replay any case for practice.</li></ol></details>' +
      '<footer class="home-foot"><p>Educational simulation for medical students. It is not clinical decision support. Cases follow the club\'s faculty review workflow.</p>' +
        '<a href="#admin" class="admin-link">Case Builder (club admins)</a></footer>';
    Array.prototype.forEach.call(app.querySelectorAll('[data-av]'), function (b) {
      root.PXArt.drawPortrait(b.querySelector('canvas'), b.getAttribute('data-av'));
      b.onclick = function () { store('pxer.avatar', b.getAttribute('data-av')); Array.prototype.forEach.call(app.querySelectorAll('[data-av]'), function (x) { x.setAttribute('aria-pressed', x === b); }); };
    });
  }

  function play(c, opts) {
    stop();
    var el = document.createElement('div'); app.innerHTML = ''; app.appendChild(el); app.className = 'playing';
    var g = new G.Game(el, c, Object.assign({
      avatar: store('pxer.avatar') || 'doctor_m',
      onExit: function () { location.hash = opts && opts.preview ? '#admin' : ''; if (!opts || !opts.preview) home(); },
      onReplay: function () { play(c, Object.assign({}, opts, { fresh: true })); }
    }, opts || {}));
    g.mount(); current = g;
  }

  function admin() {
    stop();
    var el = document.createElement('div'); app.innerHTML = ''; app.appendChild(el); app.className = 'admin';
    var b = new root.PXBuilder.Builder(el, {
      cases: CASES, config: CONFIG,
      onPreview: function (c) { try { sessionStorage.setItem('pxer.preview', JSON.stringify(c)); } catch (e) { /* ignore */ } previewCase = c; location.hash = '#preview'; },
      onExit: function () { location.hash = ''; }
    });
    b.mount(); current = null;
  }

  var previewCase = null;
  function route() {
    var hsh = location.hash || '';
    if (hsh.indexOf('#play/') === 0) {
      var c = caseById(decodeURIComponent(hsh.slice(6)));
      if (c && Core.caseVisibility(c, new Date(), { preview: CONFIG.showUnreviewed }).visible) play(c, {}); else home();
    } else if (hsh === '#admin') admin();
    else if (hsh === '#preview') {
      var pc = previewCase;
      if (!pc) { try { pc = JSON.parse(sessionStorage.getItem('pxer.preview')); } catch (e) { pc = null; } }
      if (pc) play(pc, { preview: true, fresh: true }); else admin();
    } else home();
  }
  root.addEventListener('hashchange', route);
  route();
})(window);
