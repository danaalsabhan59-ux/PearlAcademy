/* =====================================================================
   PIXEL ER — Game layer (world, movement, dialogue, panels, end screen)
   Knows nothing about any specific case: everything comes from case data.
   ===================================================================== */
(function (root) {
  'use strict';
  var Core = root.PXCore, Art = root.PXArt, Ecg = root.PXEcg;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function $(sel, el) { return (el || document).querySelector(sel); }
  function h(tag, attrs, html) { var e = document.createElement(tag); if (attrs) Object.keys(attrs).forEach(function (k) { if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }); if (html !== undefined) e.innerHTML = html; return e; }
  function store(k, v) { try { if (v === undefined) { var x = localStorage.getItem(k); return x ? JSON.parse(x) : null; } if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function sig(c) { var s = JSON.stringify(c), x = 0; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return (x >>> 0).toString(36); }
  var reducedMotion = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- tiny sound kit (off by default) ---------------- */
  var Sound = {
    on: !!store('pxer.sound'), ctx: null,
    beep: function (f, d, type, vol) {
      if (!this.on) return;
      try {
        this.ctx = this.ctx || new (root.AudioContext || root.webkitAudioContext)();
        var o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type || 'square'; o.frequency.value = f; g.gain.value = vol || 0.04;
        o.connect(g); g.connect(this.ctx.destination); o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + (d || 0.08)); o.stop(this.ctx.currentTime + (d || 0.08));
      } catch (e) { /* audio unavailable */ }
    },
    ui: function () { this.beep(660, 0.05); },
    alert: function () { this.beep(880, 0.15, 'square', 0.05); var s = this; setTimeout(function () { s.beep(660, 0.15, 'square', 0.05); }, 170); },
    toggle: function () { this.on = !this.on; store('pxer.sound', this.on); if (this.on) this.ui(); return this.on; }
  };

  var STATIONS = {
    patient:     { label: 'Talk to / examine the patient', rect: { x: 64, y: 32, w: 16, h: 32 } },
    monitor:     { label: 'Check the monitor', rect: { x: 48, y: 32, w: 16, h: 16 } },
    workstation: { label: 'Use the workstation (tests, results, plan)', rect: { x: 192, y: 32, w: 48, h: 16 } },
    pacs:        { label: 'View results screen', rect: { x: 256, y: 16, w: 16, h: 16 } },
    cart:        { label: 'Crash cart (treatments)', rect: { x: 32, y: 80, w: 16, h: 16 } },
    nurse:       { label: 'Talk to the nurse', dynamic: true },
    paramedic:   { label: 'Hear the handover', dynamic: true }
  };

  function Game(container, caseData, opts) {
    this.el = container; this.c = caseData; this.opts = opts || {};
    this.look = Art.LOOKS[this.opts.avatar] || Art.LOOKS.doctor_m;
    this.patientLook = Art.PATIENT_LOOKS[(caseData.patient && caseData.patient.sprite) || 'adult_m'] || Art.PATIENT_LOOKS.adult_m;
    this.saveKey = 'pxer.save.' + caseData.id + '.' + sig(caseData) + (this.opts.preview ? '.preview' : '');
    this.keys = {}; this.queue = []; this.dialog = null; this.panel = null; this.seen = {}; this.responses = {};
    this.player = { x: 160, y: 172, dir: 1, frame: 0, moving: false, acc: 0 };
    this.nurse = { x: 104, y: 62, dir: 2, busy: 0, look: Art.LOOKS.nurse };
    this.medic = { x: 184, y: 152, dir: 2, frame: 0, present: true, leaving: false, alpha: 1, look: Art.LOOKS.paramedic };
    this.t = 0; this.last = 0; this.running = false;
  }

  Game.prototype.mount = function () {
    var self = this, c = this.c;
    this.el.innerHTML = '';
    this.el.className = 'px-game';
    var draftBanner = (c.status !== 'published' && c.status !== 'archived' && c.status !== 'scheduled')
      ? '<div class="px-ribbon">' + esc(Core.STATUS_LABELS[c.status] || 'Draft') + ' — not yet approved</div>' : '';
    var modeBanner = ({
      official: '<div class="px-ribbon official">🏆 OFFICIAL ATTEMPT — your first completed shift counts for the leaderboard</div>',
      practice: '<div class="px-ribbon practice">Practice mode — your official score for this case is already recorded</div>',
      guest: '<div class="px-ribbon practice">Practice mode — sign in with your club email on the home page to compete</div>',
      preview: '<div class="px-ribbon">PREVIEW — nothing is saved</div>'
    })[this.opts.mode] || '';
    this.el.innerHTML =
      modeBanner + draftBanner +
      '<header class="px-hud">' +
        '<div class="px-hud-l"><button class="px-ico" data-act="exit" aria-label="Exit to case list">✕</button>' +
        '<div class="px-hud-title"><b>' + esc(c.title) + '</b><span>' + esc(c.category || '') + '</span></div></div>' +
        '<div class="px-hud-m"><span class="px-clock" aria-live="polite"></span><span class="px-pill"></span><span class="px-vitals"></span></div>' +
        '<div class="px-hud-r">' +
          '<button class="px-btn sm" data-act="wait" title="Let time pass (results, team arrival)">⏱ Wait 5 min</button>' +
          '<button class="px-btn sm" data-act="notes">📋 Notes</button>' +
          '<button class="px-btn sm" data-act="menu" title="Open any station without walking">☰ Stations</button>' +
          '<button class="px-ico" data-act="sound" aria-label="Toggle sound">' + (Sound.on ? '🔊' : '🔈') + '</button>' +
        '</div>' +
      '</header>' +
      '<div class="px-stage"><canvas class="px-canvas" width="' + Art.W + '" height="' + Art.H + '" aria-label="Emergency department. Use arrow keys or WASD to move, E to interact." role="img"></canvas>' +
        '<button class="px-prompt" hidden></button>' +
        '<div class="px-toast" aria-live="polite"></div>' +
      '</div>' +
      '<div class="px-touch" aria-hidden="true">' +
        '<div class="px-dpad"><button data-k="up">▲</button><button data-k="left">◀</button><button data-k="right">▶</button><button data-k="down">▼</button></div>' +
        '<button class="px-abtn" data-act="interact">A</button>' +
      '</div>' +
      '<p class="px-help">Move: <kbd>←↑→↓</kbd> / <kbd>WASD</kbd> · Interact: <kbd>E</kbd> / <kbd>Space</kbd> · Close: <kbd>Esc</kbd> · Or use <b>☰ Stations</b> to open anything directly.</p>' +
      '<div class="px-dialog" hidden role="dialog" aria-live="polite"><canvas width="48" height="48" class="px-portrait"></canvas><div class="px-dtext"><b class="px-dname"></b><p class="px-dline"></p></div><span class="px-dnext">▶</span></div>' +
      '<div class="px-panel-wrap" hidden><section class="px-panel" role="dialog" aria-modal="true"></section></div>';

    this.canvas = $('.px-canvas', this.el); this.ctx = this.canvas.getContext('2d'); this.ctx.imageSmoothingEnabled = false;
    this.mapCv = Art.renderMap();
    this.el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var a = b.getAttribute('data-act');
      if (a === 'exit') self.confirmExit();
      else if (a === 'wait') self.doWait();
      else if (a === 'notes') self.openNotes();
      else if (a === 'menu') self.openMenu();
      else if (a === 'sound') { b.textContent = Sound.toggle() ? '🔊' : '🔈'; }
      else if (a === 'interact') self.interact();
    });
    $('.px-prompt', this.el).addEventListener('click', function () { self.interact(); });
    $('.px-dialog', this.el).addEventListener('click', function () { self.nextLine(); });
    $('.px-panel-wrap', this.el).addEventListener('click', function (e) { if (e.target.classList.contains('px-panel-wrap')) self.closePanel(); });
    /* touch d-pad */
    Array.prototype.forEach.call(this.el.querySelectorAll('.px-dpad button'), function (b) {
      var k = b.getAttribute('data-k');
      function on(e) { e.preventDefault(); self.keys[k] = true; }
      function off(e) { e.preventDefault(); self.keys[k] = false; }
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    });
    this.onKey = function (e) { self.key(e, true); };
    this.offKey = function (e) { self.key(e, false); };
    root.addEventListener('keydown', this.onKey); root.addEventListener('keyup', this.offKey);

    /* sim — resume a saved shift if there is one */
    var saved = store(this.saveKey);
    this.sim = new Core.Sim(this.c);
    var self2 = this;
    if (saved && saved.history && saved.history.length && !this.opts.fresh) {
      this.sim = Core.replay(this.c, saved.history);
      this.medic.present = false;
      (saved.seen || []).forEach(function (id) { self2.seen[id] = 1; });
      this.collectResponses();
      if (this.sim.S.ended) { store(this.saveKey, null); this.sim = new Core.Sim(this.c); this.medic.present = true; this.responses = {}; this.seen = {}; this.handover(); }
      else { this.toast('Shift resumed where you left off.'); this.warned = {}; var lft = this.sim.timeLimit - this.sim.S.t; if (lft <= this.sim.timeLimit / 2) this.warned.w0 = 1; if (lft <= this.sim.timeLimit / 4) this.warned.w1 = 1; if (lft <= 10) this.warned.w2 = 1; }
    } else this.handover();
    this.updateHud();
    this.running = true; this.last = performance.now();
    this.raf = requestAnimationFrame(function loop(now) { if (!self.running) return; self.frame(now); self.raf = requestAnimationFrame(loop); });
  };

  Game.prototype.destroy = function () {
    this.running = false; cancelAnimationFrame(this.raf);
    root.removeEventListener('keydown', this.onKey); root.removeEventListener('keyup', this.offKey);
    if (this.stopTrace) this.stopTrace();
  };

  Game.prototype.collectResponses = function () {
    var self = this;
    this.sim.S.log.forEach(function (m) { if (m.ref && m.kind !== 'event' && m.kind !== 'system' && m.kind !== 'result') self.responses[m.ref] = m.text; });
  };

  Game.prototype.handover = function () {
    var ho = this.c.handover || {}, who = ho.by === 'nurse' ? 'nurse' : 'paramedic';
    var name = who === 'nurse' ? 'Triage nurse' : 'Paramedic';
    var self = this;
    (ho.lines || []).forEach(function (l) { self.say(who, name, l); });
    this.say(this.opts.avatar === 'doctor_f' ? 'doctor_f' : 'doctor_m', 'You', 'Thanks. I\'ll take it from here.', function () { self.medic.leaving = true; });
    this.say('nurse', 'Nurse', 'Quick tip, doctor: the clock at the top is shift time, not real time. Every action uses the minutes shown on its button. You have ' + this.sim.timeLimit + ' minutes on the clock, so think as long as you like. Only your actions move the clock.');
  };

  /* ---------------- input ---------------- */
  Game.prototype.key = function (e, down) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    var map = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
    var k = map[e.code];
    if (k) { if (!this.panel) { this.keys[k] = down; e.preventDefault(); } return; }
    if (!down) return;
    if (e.code === 'Escape') { if (this.panel) this.closePanel(); return; }
    if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
      if (this.dialog) { e.preventDefault(); this.nextLine(); return; }
      if (!this.panel) { e.preventDefault(); this.interact(); }
    }
  };

  Game.prototype.blocked = function (x, y) {
    var hw = 5, hh = 3;
    if (Art.solidAt(x - hw, y - hh) || Art.solidAt(x + hw, y - hh) || Art.solidAt(x - hw, y + hh) || Art.solidAt(x + hw, y + hh)) return true;
    var npcs = [this.nurse]; if (this.medic.present) npcs.push(this.medic);
    for (var i = 0; i < npcs.length; i++) { var n = npcs[i]; if (Math.abs(n.x - x) < 10 && Math.abs(n.y - y) < 6) return true; }
    return false;
  };

  Game.prototype.stationRect = function (id) {
    if (id === 'nurse') return { x: this.nurse.x - 7, y: this.nurse.y - 14, w: 14, h: 16 };
    if (id === 'paramedic') return this.medic.present ? { x: this.medic.x - 7, y: this.medic.y - 14, w: 14, h: 16 } : null;
    return STATIONS[id].rect;
  };

  Game.prototype.nearest = function () {
    var p = this.player, best = null, bd = 1e9, self = this;
    Object.keys(STATIONS).forEach(function (id) {
      var r = self.stationRect(id); if (!r) return;
      var cx = Math.max(r.x, Math.min(p.x, r.x + r.w)), cy = Math.max(r.y, Math.min(p.y - 4, r.y + r.h));
      var d = Math.hypot(cx - p.x, cy - (p.y - 4));
      if (d < 16 && d < bd) { bd = d; best = id; }
    });
    return best;
  };

  Game.prototype.interact = function () {
    if (this.dialog) { this.nextLine(); return; }
    var id = this.near; if (!id) return;
    Sound.ui();
    if (id === 'paramedic') { this.handover(); return; }
    this.openStation(id);
  };

  /* ---------------- main loop ---------------- */
  Game.prototype.frame = function (now) {
    var dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.t += dt;
    var p = this.player, k = this.keys, sp = 62;
    var dx = (k.right ? 1 : 0) - (k.left ? 1 : 0), dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
    if (this.dialog || this.panel) { dx = 0; dy = 0; }
    p.moving = !!(dx || dy);
    if (p.moving) {
      if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
      var nx = p.x + dx * sp * dt, ny = p.y + dy * sp * dt;
      if (!this.blocked(nx, p.y)) p.x = nx;
      if (!this.blocked(p.x, ny)) p.y = ny;
      p.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
      p.acc += dt; if (p.acc > 0.14) { p.acc = 0; p.frame = (p.frame + 1) % 4; }
    } else p.frame = 0;
    /* paramedic leaves through the door */
    var m = this.medic;
    if (m.present && m.leaving && !this.dialog) {
      var tx = 164, ty = 190;
      if (Math.abs(m.x - tx) > 1) { m.x += Math.sign(tx - m.x) * 40 * dt; m.dir = m.x > tx ? 2 : 3; }
      else { m.y += 40 * dt; m.dir = 0; }
      m.frame = Math.floor(this.t * 7) % 4;
      if (m.y > 182) { m.alpha -= dt * 3; if (m.alpha <= 0) m.present = false; }
    }
    if (this.nurse.busy > 0) this.nurse.busy -= dt;
    var near = this.dialog || this.panel ? null : this.nearest();
    if (near !== this.near) {
      this.near = near;
      var pr = $('.px-prompt', this.el);
      if (near) { pr.hidden = false; pr.innerHTML = '<kbd>E</kbd> ' + esc(STATIONS[near].label); } else pr.hidden = true;
    }
    this.draw();
  };

  Game.prototype.draw = function () {
    var ctx = this.ctx, t = this.t, S = this.sim.S;
    ctx.drawImage(this.mapCv, 0, 0);
    Art.drawMonitorScreen(ctx, S.flags.indexOf('monitor') !== -1, S.vitals.hr, S.state, t);
    Art.drawBed(ctx, this.patientLook, S.state, t);
    var ents = [{ y: this.player.y, f: function () { Art.drawChar(ctx, this.player.x, this.player.y, this.look, this.player.dir, this.player.frame); }.bind(this) },
      { y: this.nurse.y, f: function () { var b = this.nurse.busy > 0 ? Math.floor(t * 8) % 2 : 0; Art.drawChar(ctx, this.nurse.x, this.nurse.y - b, this.nurse.look, this.nurse.dir, 0); }.bind(this) }];
    if (this.medic.present) ents.push({ y: this.medic.y, f: function () { ctx.globalAlpha = Math.max(0, this.medic.alpha); Art.drawChar(ctx, this.medic.x, this.medic.y, this.medic.look, this.medic.dir, this.medic.frame); ctx.globalAlpha = 1; }.bind(this) });
    ents.sort(function (a, b) { return a.y - b.y; }).forEach(function (e) { e.f(); });
    /* highlight nearest station */
    if (this.near && Math.floor(t * 3) % 2 === 0) {
      var r = this.stationRect(this.near);
      if (r) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1; ctx.strokeRect(r.x - 1.5, r.y - 1.5, r.w + 3, r.h + 3); }
    }
    /* bubbles: unseen results */
    if (this.unseenResults().length) { Art.drawBubble(ctx, 216, 32, t, '#4fb3ff'); Art.drawBubble(ctx, 264, 16, t, '#4fb3ff'); }
    if (this.medic.present && !this.medic.leaving) Art.drawBubble(ctx, this.medic.x, this.medic.y - 14, t);
    if (S.state === 'deteriorating' || S.state === 'critical') Art.drawBubble(ctx, 72, 30, t, '#ff5a5a');
  };

  Game.prototype.unseenResults = function () {
    var S = this.sim.S, self = this;
    return S.results.filter(function (r) { return r.readyAt <= S.t && !self.seen[r.id]; });
  };

  /* ---------------- dialogue ---------------- */
  Game.prototype.say = function (who, name, text, cb) {
    this.queue.push({ who: who, name: name, text: text, cb: cb });
    if (!this.dialog) this.nextLine(true);
  };
  Game.prototype.nextLine = function (first) {
    var d = this.dialog;
    if (d && d.typing) { d.typing = false; $('.px-dline', this.el).textContent = d.text; return; }
    if (d && d.cb) d.cb();
    var box = $('.px-dialog', this.el);
    if (!this.queue.length) {
      this.dialog = null; box.hidden = true;
      if (this.pendingEnd) { var self = this; this.pendingEnd = false; setTimeout(function () { self.showEnd(); }, 250); }
      return;
    }
    d = this.dialog = this.queue.shift();
    box.hidden = false;
    var who = d.who;
    if (who === 'patient') Art.drawPortrait($('.px-portrait', box), 'patient', (this.c.patient && this.c.patient.sprite) || 'adult_m');
    else Art.drawPortrait($('.px-portrait', box), who);
    $('.px-dname', box).textContent = d.name;
    var line = $('.px-dline', box);
    if (reducedMotion) { line.textContent = d.text; d.typing = false; return; }
    d.typing = true; line.textContent = '';
    var i = 0, self2 = this, cur = d;
    (function tick() {
      if (self2.dialog !== cur || !cur.typing) return;
      i += 2; line.textContent = cur.text.slice(0, i);
      if (i < cur.text.length) setTimeout(tick, 16); else cur.typing = false;
    })();
  };

  Game.prototype.toast = function (msg, kind) {
    var t = $('.px-toast', this.el), n = h('div', { class: 'px-toast-item ' + (kind || '') }, esc(msg));
    t.appendChild(n);
    setTimeout(function () { n.classList.add('out'); }, 2600);
    setTimeout(function () { n.remove(); }, 3100);
  };

  /* ---------------- HUD ---------------- */
  Game.prototype.updateHud = function () {
    var S = this.sim.S, lim = this.sim.timeLimit;
    var left = Math.max(0, lim - S.t), clock = $('.px-clock', this.el);
    clock.innerHTML = '⏱ <b>T+' + S.t + '</b> / ' + lim + ' min <span class="px-left">· ' + left + ' left</span>';
    clock.className = 'px-clock' + (left <= 10 ? ' low' : left <= lim / 4 ? ' warn' : '');
    var pill = $('.px-pill', this.el); pill.textContent = S.state; pill.className = 'px-pill st-' + S.state;
    var v = S.vitals, vEl = $('.px-vitals', this.el);
    if (S.flags.indexOf('monitor') !== -1)
      vEl.innerHTML = '<span>HR <b>' + v.hr + '</b></span><span>BP <b class="' + (v.sbp < 90 ? 'bad' : '') + '">' + v.sbp + '/' + v.dbp + '</b></span><span>SpO₂ <b class="' + (v.spo2 < 92 ? 'bad' : '') + '">' + v.spo2 + '</b></span>';
    else vEl.innerHTML = '<span class="muted">Monitor not attached</span>';
  };

  /* Nurse reminders as the shift clock runs down (once each; none for thresholds already passed on resume). */
  Game.prototype.timeWarnings = function () {
    var S = this.sim.S, lim = this.sim.timeLimit, left = lim - S.t;
    if (S.ended) return;
    this.warned = this.warned || {};
    var marks = [[lim / 2, 'Doctor, we\'re halfway through the shift: ' + Math.round(left) + ' minutes left. What\'s the plan?'],
                 [lim / 4, 'Only ' + Math.round(left) + ' minutes left on the shift, doctor. Time to decide where he\'s going.'],
                 [10, 'Ten minutes left! Make your final decision now.']];
    for (var i = 0; i < marks.length; i++) {
      var k = 'w' + i;
      if (left <= marks[i][0] && !this.warned[k]) {
        for (var j = i; j < marks.length; j++) if (left <= marks[j][0]) this.warned['w' + j] = 1;   /* skip earlier ones if several were crossed at once */
        var last = i; for (var m = marks.length - 1; m >= 0; m--) if (left <= marks[m][0]) { last = m; break; }
        this.say('nurse', 'Nurse', marks[last][1]);
        break;
      }
    }
  };

  /* ---------------- actions ---------------- */
  Game.prototype.save = function () { store(this.saveKey, { history: this.sim.S.history, seen: Object.keys(this.seen) }); };

  Game.prototype.handle = function (out) {
    var self = this;
    if (out.blocked) { this.toast(out.blocked, 'warn'); return; }
    out.messages.forEach(function (m) {
      if (m.kind === 'event') {
        var who = /nurse/i.test(m.speaker) ? 'nurse' : /senior/i.test(m.speaker) ? 'senior' : 'nurse';
        self.say(who, m.speaker, m.text);
        if (self.sim.S.state === 'deteriorating' || self.sim.S.state === 'critical') Sound.alert();
      } else if (m.kind === 'result') self.toast(m.text, 'info');
      if (m.ref && m.kind !== 'event' && m.kind !== 'system' && m.kind !== 'result') self.responses[m.ref] = m.text;
    });
    this.updateHud(); this.save(); this.timeWarnings();
    if (out.ended) {
      store(this.saveKey, null);
      this.closePanel();
      if (this.dialog || this.queue.length) this.pendingEnd = true; else this.showEnd();
    }
  };

  Game.prototype.doAction = function (id) {
    var a = this.sim.actionsById[id];
    Sound.ui();
    var out = this.sim.perform(id);
    if (!out.blocked && a && (a.category === 'treatment' || a.category === 'procedure')) this.nurse.busy = 1.2;
    this.handle(out);
    if (!out.ended && this.panel) this.renderPanel();
  };

  Game.prototype.doWait = function () {
    if (this.sim.S.ended) return;
    var out = this.sim.wait(5);
    this.toast('5 minutes pass…');
    this.handle(out);
    if (!out.ended && this.panel) this.renderPanel();
  };

  /* ---------------- panels ---------------- */
  var TABS = {
    patient: [['history', 'History', ['history']], ['exam', 'Examination', ['exam', 'reassess']]],
    nurse: [['tx', 'Treatments', ['treatment']], ['proc', 'Procedures & help', ['procedure']]],
    cart: [['tx', 'Treatments', ['treatment']], ['proc', 'Procedures', ['procedure']]],
    workstation: [['inv', 'Order tests', ['investigation']], ['results', 'Results', null], ['dx', 'Diagnosis', ['diagnosis']], ['disp', 'Plan & disposition', ['disposition']]],
    pacs: [['results', 'Results', null]],
    monitor: [['mon', 'Monitor', null]],
    notes: [['notes', 'Shift notes', null]],
    menu: [['menu', 'Stations', null]]
  };
  var TITLES = {
    patient: function (g) { var p = g.c.patient || {}; return esc(p.name || 'Patient') + ' <small>' + esc((p.age || '') + (p.sex ? ' ' + p.sex : '')) + ' · ' + esc(p.chiefComplaint || '') + '</small>'; },
    nurse: function () { return 'Nurse <small>“What do you need, doctor?”</small>'; },
    cart: function () { return 'Crash cart'; },
    workstation: function () { return 'Clinical workstation'; },
    pacs: function () { return 'Results'; },
    monitor: function () { return 'Patient monitor'; },
    notes: function () { return 'Shift notes'; },
    menu: function () { return 'Stations <small>Open any station without walking</small>'; }
  };

  Game.prototype.openStation = function (id) { this.panel = { id: id, tab: TABS[id][0][0], view: null }; this.renderPanel(); };
  Game.prototype.openNotes = function () { this.openStation('notes'); };
  Game.prototype.openMenu = function () { this.openStation('menu'); };
  Game.prototype.closePanel = function () {
    this.panel = null; $('.px-panel-wrap', this.el).hidden = true;
    if (this.stopTrace) { this.stopTrace(); this.stopTrace = null; }
    this.canvas.focus && this.canvas.focus();
  };

  Game.prototype.renderPanel = function () {
    var P = this.panel; if (!P) return;
    var self = this, wrap = $('.px-panel-wrap', this.el), el = $('.px-panel', this.el);
    if (this.stopTrace) { this.stopTrace(); this.stopTrace = null; }
    wrap.hidden = false;
    var tabs = TABS[P.id];
    var html = '<header class="px-ph"><h2>' + TITLES[P.id](this) + '</h2><button class="px-ico" data-x aria-label="Close">✕</button></header>';
    if (tabs.length > 1) html += '<nav class="px-tabs" role="tablist">' + tabs.map(function (t) {
      var badge = t[0] === 'results' && self.unseenResults().length ? ' <i class="px-badge">' + self.unseenResults().length + '</i>' : '';
      return '<button role="tab" aria-selected="' + (P.tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + badge + '</button>';
    }).join('') + '</nav>';
    html += '<div class="px-pbody"></div>';
    el.innerHTML = html;
    var body = $('.px-pbody', el);
    var tab = tabs.filter(function (t) { return t[0] === P.tab; })[0] || tabs[0];
    if (P.view) this.renderResult(body, P.view);
    else if (tab[0] === 'results') this.renderResults(body);
    else if (tab[0] === 'mon') this.renderMonitor(body);
    else if (tab[0] === 'notes') this.renderNotes(body);
    else if (tab[0] === 'menu') this.renderMenu(body);
    else this.renderActions(body, P.id === 'cart' ? 'nurse' : P.id, tab[2]);
    $('[data-x]', el).onclick = function () { self.closePanel(); };
    Array.prototype.forEach.call(el.querySelectorAll('[data-tab]'), function (b) { b.onclick = function () { P.tab = b.getAttribute('data-tab'); P.view = null; self.renderPanel(); }; });
  };

  Game.prototype.renderActions = function (body, station, cats) {
    var self = this, sim = this.sim;
    var list = sim.available(null).filter(function (x) { return cats.indexOf(x.action.category) !== -1 && ((x.action.station || Core.STATION_FOR[x.action.category]) === station || (station === 'nurse' && (x.action.station || Core.STATION_FOR[x.action.category]) === 'nurse')); });
    if (!list.length) { body.innerHTML = '<p class="px-empty">Nothing to do here in this case.</p>'; return; }
    var intro = '';
    if (cats.indexOf('diagnosis') !== -1) intro = '<p class="px-note">Record your working diagnosis. You can only choose once.</p>';
    if (cats.indexOf('investigation') !== -1) intro = '<p class="px-note">Order what is indicated. Every test takes time, and some results take a while to come back.</p>';
    body.innerHTML = intro + '<ul class="px-actions">' + list.map(function (x) {
      var a = x.action, resp = self.responses[a.id];
      var meta = (a.time ? a.time + ' min' : '') + (a.result && a.result.delay ? ' · result in ' + a.result.delay + ' min' : '');
      var cls = x.done ? 'done' : (!x.ok ? 'locked' : '');
      return '<li class="' + cls + '"><button data-a="' + esc(a.id) + '" ' + (x.ok ? '' : 'aria-disabled="true"') + '>' +
        '<span class="px-al">' + (x.done ? '✓ ' : '') + esc(a.label) + '</span><span class="px-am">' + esc(meta) + '</span></button>' +
        (resp && x.done ? '<p class="px-resp">' + esc(resp) + '</p>' : '') +
        (!x.ok && !x.done && x.why ? '<p class="px-why">' + esc(x.why) + '</p>' : '') + '</li>';
    }).join('') + '</ul>';
    Array.prototype.forEach.call(body.querySelectorAll('[data-a]'), function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-a'), a = sim.actionsById[id], r = sim.check(a);
        if (!r.ok) { self.toast(r.why, 'warn'); return; }
        self.doAction(id);
      };
    });
  };

  Game.prototype.renderResults = function (body) {
    var self = this, sim = this.sim, S = sim.S;
    if (!S.results.length) { body.innerHTML = '<p class="px-empty">No tests ordered yet. Order them from the workstation.</p>'; return; }
    body.innerHTML = '<ul class="px-results">' + S.results.map(function (r) {
      var a = sim.actionsById[r.id], ready = r.readyAt <= S.t;
      return '<li><button data-r="' + esc(r.id) + '" ' + (ready ? '' : 'aria-disabled="true"') + '><span class="px-al">' + (ready && !self.seen[r.id] ? '<i class="px-dot"></i>' : '') + esc(a ? a.label : r.id) + '</span>' +
        '<span class="px-am">' + (ready ? 'Ready — view' : 'Pending · ready at T+' + r.readyAt) + '</span></button></li>';
    }).join('') + '</ul><p class="px-note">Pending results arrive as time passes. Use <b>⏱ Wait</b> if you have nothing else to do.</p>';
    Array.prototype.forEach.call(body.querySelectorAll('[data-r]'), function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-r'), rr = sim.resultReady(id);
        if (!rr.ready) { self.toast('Not back yet — ready at T+' + rr.readyAt + '.', 'warn'); return; }
        self.seen[id] = 1; self.save(); self.panel.view = id; self.renderPanel();
      };
    });
  };

  Game.prototype.renderResult = function (body, id) {
    var self = this, a = this.sim.actionsById[id], res = a.result || {};
    var html = '<button class="px-back">← All results</button><h3>' + esc(a.label) + '</h3>';
    if (res.type === 'ecg' && res.ecg) {
      html += '<div class="px-ecg-tools"><button data-z="-1">−</button><button data-z="1">+</button><span>Zoom · drag to scroll</span></div><div class="px-ecg"><canvas></canvas></div>';
    }
    if (res.type === 'labs') html += '<table class="px-labs"><thead><tr><th>Test</th><th>Result</th><th>Reference</th></tr></thead><tbody>' + (res.labs || []).map(function (l) {
      return '<tr class="' + (l.flag ? 'flag' : '') + '"><td>' + esc(l.name) + '</td><td><b>' + esc(l.value) + '</b> ' + esc(l.unit || '') + (l.flag ? ' <i>' + esc(l.flag) + '</i>' : '') + '</td><td>' + esc(l.ref || '') + '</td></tr>';
    }).join('') + '</tbody></table>';
    if (res.type === 'image' && res.image && res.image.url) {
      html += '<figure class="px-img"><img src="' + esc(res.image.url) + '" alt="' + esc(res.image.alt || a.label) + '"><figcaption>' + esc(res.image.credit || '') + (res.image.license ? ' · ' + esc(res.image.license) : '') + '</figcaption></figure>';
    }
    if (res.text) {
      if (res.type === 'ecg' || res.type === 'image') html += '<button class="px-btn sm px-reveal">Show interpretation</button><p class="px-interp" hidden>' + esc(res.text) + '</p>';
      else html += '<p class="px-interp">' + esc(res.text) + '</p>';
    }
    body.innerHTML = html;
    $('.px-back', body).onclick = function () { self.panel.view = null; self.renderPanel(); };
    var rv = $('.px-reveal', body); if (rv) rv.onclick = function () { rv.remove(); $('.px-interp', body).hidden = false; };
    if (res.type === 'ecg' && res.ecg) {
      var cv = $('.px-ecg canvas', body); Ecg.drawSheet(cv, res.ecg);
      var z = 1; cv.style.width = '100%';
      Array.prototype.forEach.call(body.querySelectorAll('[data-z]'), function (b) { b.onclick = function () { z = Math.max(1, Math.min(3, z + Number(b.getAttribute('data-z')) * 0.5)); cv.style.width = (z * 100) + '%'; }; });
    }
  };

  Game.prototype.renderMonitor = function (body) {
    var S = this.sim.S, v = S.vitals, self = this;
    if (S.flags.indexOf('monitor') === -1) { body.innerHTML = '<p class="px-empty">The monitor isn\'t connected yet. Ask the nurse to attach it.</p><p class="px-note">Last vitals from the handover: ' + esc(this.sim.vitalsLine()) + '</p>'; return; }
    function tile(k, val, unit, bad) { return '<div class="px-vt ' + (bad ? 'bad' : '') + ' vt-' + k + '"><span>' + k + '</span><b>' + val + '</b><small>' + unit + '</small></div>'; }
    body.innerHTML = '<div class="px-mon"><canvas width="560" height="120"></canvas><div class="px-vgrid">' +
      tile('HR', v.hr, '/min', v.hr > 120 || v.hr < 50) + tile('BP', v.sbp + '/' + v.dbp, 'mmHg', v.sbp < 90) +
      tile('SpO₂', v.spo2, '%', v.spo2 < 92) + tile('RR', v.rr, '/min', v.rr > 24) +
      (v.temp !== undefined ? tile('Temp', v.temp, '°C', v.temp > 38.3) : '') + (v.gcs !== undefined ? tile('GCS', v.gcs, '/15', v.gcs < 15) : '') +
      '</div></div><h3>Trend</h3><table class="px-labs"><thead><tr><th>Time</th><th>HR</th><th>BP</th><th>SpO₂</th><th>State</th></tr></thead><tbody>' +
      S.vitalsTrail.map(function (x) { return '<tr><td>T+' + x.t + '</td><td>' + x.vitals.hr + '</td><td>' + x.vitals.sbp + '/' + x.vitals.dbp + '</td><td>' + x.vitals.spo2 + '</td><td>' + esc(x.state) + '</td></tr>'; }).join('') + '</tbody></table>';
    /* The live trace shows lead II of the case's standard ECG (if it has one). */
    var ecgDef = (this.c.actions || []).filter(function (a) { return a.result && a.result.type === 'ecg' && a.result.ecg && (a.result.ecg.layout || 'standard12') === 'standard12'; })[0];
    var st = ecgDef ? (ecgDef.result.ecg.st || {}) : {};
    this.stopTrace = Ecg.liveMonitor($('.px-mon canvas', body), function () { return { rate: self.sim.S.vitals.hr, st: st }; });
  };

  Game.prototype.renderNotes = function (body) {
    var S = this.sim.S, ho = this.c.handover || {};
    var html = '<h3>Handover</h3><ul class="px-log">' + (ho.lines || []).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul><h3>Timeline</h3><ul class="px-log">';
    html += S.log.map(function (m) { return '<li><span class="px-t">T+' + m.t + '</span> <b>' + esc(m.speaker) + ':</b> ' + esc(m.text) + '</li>'; }).join('') || '<li class="muted">Nothing yet.</li>';
    body.innerHTML = html + '</ul>';
  };

  Game.prototype.renderMenu = function (body) {
    var self = this;
    var ids = ['patient', 'nurse', 'monitor', 'workstation', 'pacs', 'cart'];
    body.innerHTML = '<ul class="px-actions">' + ids.map(function (id) { return '<li><button data-s="' + id + '"><span class="px-al">' + esc(STATIONS[id].label) + '</span></button></li>'; }).join('') + '</ul>';
    Array.prototype.forEach.call(body.querySelectorAll('[data-s]'), function (b) { b.onclick = function () { self.openStation(b.getAttribute('data-s')); }; });
  };

  Game.prototype.confirmExit = function () {
    if (this.sim.S.ended || !this.sim.S.history.length || root.confirm('Leave this shift? Your progress is saved on this device, and you can resume later.')) {
      if (this.opts.onExit) this.opts.onExit();
    }
  };

  /* ---------------- end screen ---------------- */
  Game.prototype.showEnd = function () {
    var self = this, sim = this.sim, c = this.c, s = sim.score(), e = sim.ending() || {};
    var bestKey = 'pxer.best.' + c.id, best = store(bestKey);
    if (!this.opts.preview && (!best || s.total > best.total)) store(bestKey, { total: s.total, xp: s.xp, at: new Date().toISOString() });
    var outcome = e.outcome || 'fair';
    function li(arr, cls) { return arr.length ? '<ul class="px-fb ' + cls + '">' + arr.map(function (x) { return '<li>' + esc(x.text) + (x.points ? ' <i>' + (x.points > 0 ? '+' : '') + x.points + '</i>' : '') + '</li>'; }).join('') + '</ul>' : '<p class="muted">None.</p>'; }
    var timeline = sim.S.done.map(function (d) { var a = sim.actionsById[d.id]; return '<li><span class="px-t">T+' + d.t + '</span> ' + esc(a ? a.label : d.id) + '</li>'; }).join('');
    var ov = h('div', { class: 'px-end', role: 'dialog', 'aria-modal': 'true' });
    ov.innerHTML =
      '<div class="px-end-card">' +
        '<div class="px-outcome o-' + outcome + '"><span>' + ({ good: 'GOOD OUTCOME', fair: 'MIXED OUTCOME', poor: 'POOR OUTCOME' })[outcome] + '</span><h2>' + esc(e.title || 'Case complete') + '</h2><p>' + esc(e.text || '') + '</p></div>' +
        '<div class="px-score"><div class="px-ring" style="--p:' + s.total + '"><b>' + s.total + '</b><small>/100</small></div>' +
          '<div><div class="px-xp">+' + s.xp + ' XP <small>of ' + s.maxXP + '</small></div>' +
          (best && !this.opts.preview ? '<div class="muted">Your best on this device: ' + Math.max(best.total, s.total) + '/100</div>' : '') +
          '<div class="muted">Finished at T+' + sim.S.t + ' min</div></div></div>' +
        '<div class="px-submit" aria-live="polite" hidden></div>' +
        '<div class="px-bars">' + s.breakdown.map(function (b) {
          if (b.fraction === null) return '';
          return '<div class="px-bar"><span>' + esc(b.label) + '</span><div><i style="width:' + Math.round(b.fraction * 100) + '%"></i></div><b>' + b.points + '/' + b.of + '</b></div>';
        }).join('') + '</div>' +
        (s.penalties.length ? '<h3 class="warn">⚠ Safety &amp; quality issues</h3>' + li(s.penalties, 'bad') : '') +
        '<h3>✓ What you did well</h3>' + li(s.hits, 'good') +
        '<h3>✗ What you missed</h3>' + li(s.misses, 'miss') +
        '<h3>Key learning points</h3><ul class="px-fb">' + ((c.teaching && c.teaching.keyPoints) || []).map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul>' +
        (((c.teaching && c.teaching.pearls) || []).length ? '<h3>Clinical pearls</h3><ul class="px-fb">' + c.teaching.pearls.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul>' : '') +
        '<details><summary>Your timeline</summary><ul class="px-log">' + timeline + '</ul></details>' +
        '<details><summary>References</summary><ol class="px-refs">' + (c.references || []).map(function (r) { return '<li>' + esc(r.text) + (r.url ? ' <a href="' + esc(r.url) + '" target="_blank" rel="noopener">link</a>' : '') + '</li>'; }).join('') + '</ol></details>' +
        '<p class="px-disclaimer">Educational simulation — not clinical decision support. Review status: ' + esc(Core.STATUS_LABELS[c.status] || c.status) + (c.review && c.review.lastReviewed ? ' · last reviewed ' + esc(c.review.lastReviewed) : '') + '.</p>' +
        '<div class="px-end-actions"><button class="px-btn" data-e="replay">↻ Play again (practice)</button><button class="px-btn ghost" data-e="home">Back to cases</button></div>' +
      '</div>';
    this.el.appendChild(ov);
    ov.querySelector('[data-e="replay"]').onclick = function () { if (self.opts.onReplay) self.opts.onReplay(); };
    ov.querySelector('[data-e="home"]').onclick = function () { if (self.opts.onExit) self.opts.onExit(); };
    if (this.opts.onFinish) this.opts.onFinish({ caseId: c.id, score: s, history: sim.S.history.slice(), ending: e.id }, ov.querySelector('.px-submit'));
  };

  root.PXGame = { Game: Game, Sound: Sound, esc: esc, store: store };
})(window);
