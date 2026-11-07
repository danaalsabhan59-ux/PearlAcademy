/* =====================================================================
   PIXEL ER — Schematic ECG renderer
   Draws a *teaching schematic* from parameters (rate + ST shift per lead).
   It is clearly labelled as generated — never presented as a real tracing.
   ===================================================================== */
(function (root) {
  'use strict';

  /* Baseline morphology per lead, in mm (10 mm = 1 mV). */
  var BASE = {
    I:   { p: 1.0, q: 0.3, r: 7,  s: 1.5, t: 2.0 },
    II:  { p: 1.5, q: 0.3, r: 10, s: 1.0, t: 2.5 },
    III: { p: 0.7, q: 0.3, r: 5,  s: 1.0, t: 1.2 },
    aVR: { p: -1.0, q: 0, r: 1,  s: 7.0, t: -2.0 },
    aVL: { p: 0.5, q: 0.3, r: 4,  s: 2.0, t: 1.0 },
    aVF: { p: 1.0, q: 0.3, r: 7,  s: 1.0, t: 1.8 },
    V1:  { p: 0.8, q: 0, r: 2,  s: 9.0, t: 0.5 },
    V2:  { p: 0.8, q: 0, r: 4,  s: 12,  t: 3.0 },
    V3:  { p: 0.8, q: 0, r: 7,  s: 7.0, t: 3.5 },
    V4:  { p: 0.8, q: 0.3, r: 12, s: 4.0, t: 3.5 },
    V5:  { p: 0.8, q: 0.5, r: 13, s: 2.0, t: 3.0 },
    V6:  { p: 0.8, q: 0.5, r: 10, s: 1.0, t: 2.5 },
    V1R: { p: 0.8, q: 0, r: 2,  s: 8.0, t: 0.5 },
    V2R: { p: 0.8, q: 0, r: 2,  s: 7.0, t: 0.5 },
    V3R: { p: 0.7, q: 0, r: 2,  s: 6.0, t: 0.5 },
    V4R: { p: 0.6, q: 0, r: 2,  s: 5.0, t: 0.5 },
    V5R: { p: 0.6, q: 0, r: 2,  s: 4.0, t: 0.5 },
    V6R: { p: 0.5, q: 0, r: 2,  s: 3.0, t: 0.5 }
  };
  var LAYOUTS = {
    standard12: [['I', 'aVR', 'V1', 'V4'], ['II', 'aVL', 'V2', 'V5'], ['III', 'aVF', 'V3', 'V6']],
    right: [['V1R', 'V2R', 'V3R'], ['V4R', 'V5R', 'V6R']]
  };

  function g(x, mu, sd) { var z = (x - mu) / sd; return Math.exp(-0.5 * z * z); }
  function sig(x, mu, k) { return 1 / (1 + Math.exp(-(x - mu) / k)); }

  /* Voltage (mm) at time x (s) within one beat. */
  function beat(m, st, x) {
    var v = 0;
    v += m.p * g(x, 0.09, 0.022);
    v -= m.q * g(x, 0.185, 0.008);
    v += m.r * g(x, 0.205, 0.011);
    /* With ST elevation the S wave is swallowed and the J point lifts. */
    var s = st > 0 ? m.s * Math.max(0, 1 - st / 2) : m.s;
    v -= s * g(x, 0.228, 0.010);
    if (st > 0) {
      /* STEMI: straight (slightly convex) take-off from the J point that merges with the T wave. */
      var on = sig(x, 0.232, 0.004), off = 1 - sig(x, 0.43, 0.022);
      var ramp = Math.min(1, Math.max(0, (x - 0.232) / 0.12));
      v += st * on * off * (0.85 + 0.15 * Math.sin(ramp * Math.PI));
      v += (m.t * 0.6 + st * 0.25) * g(x, 0.37, 0.04);
    } else {
      /* ST depression (reciprocal change): horizontal / down-sloping segment, flattened T. */
      var w = sig(x, 0.24, 0.005) * (1 - sig(x, 0.34, 0.02));
      v += st * w;
      v += (st < 0 ? m.t * 0.4 : m.t) * g(x, 0.37, 0.045);
    }
    return v;
  }

  function sample(lead, params, tSec) {
    var m = BASE[lead] || BASE.II;
    var st = (params.st && Number(params.st[lead])) || 0;
    var rr = 60 / Math.max(30, Math.min(220, params.rate || 75));
    var x = ((tSec % rr) + rr) % rr;
    return beat(m, st, x);
  }

  /* Full 12-lead (or custom) sheet. */
  function drawSheet(canvas, params) {
    var layout = LAYOUTS[params.layout] || LAYOUTS.standard12;
    var cols = layout[0].length, rows = layout.length;
    var PX = 5;                        /* px per mm */
    var colSec = 2.5;                  /* seconds per column (25 mm/s) */
    var rowH = 30;                     /* mm per row */
    var rhythm = params.layout === 'standard12' || !params.layout;
    var wmm = cols * colSec * 25, hmm = rows * rowH + (rhythm ? rowH : 0) + 8;
    canvas.width = Math.round(wmm * PX); canvas.height = Math.round(hmm * PX);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff6f4'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    /* grid */
    for (var i = 0; i <= wmm; i++) {
      ctx.strokeStyle = i % 5 === 0 ? 'rgba(220,80,80,.45)' : 'rgba(230,120,120,.18)';
      ctx.lineWidth = i % 5 === 0 ? 1 : 0.6;
      ctx.beginPath(); ctx.moveTo(i * PX + 0.5, 0); ctx.lineTo(i * PX + 0.5, canvas.height); ctx.stroke();
    }
    for (var j = 0; j <= hmm; j++) {
      ctx.strokeStyle = j % 5 === 0 ? 'rgba(220,80,80,.45)' : 'rgba(230,120,120,.18)';
      ctx.lineWidth = j % 5 === 0 ? 1 : 0.6;
      ctx.beginPath(); ctx.moveTo(0, j * PX + 0.5); ctx.lineTo(canvas.width, j * PX + 0.5); ctx.stroke();
    }
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
    ctx.font = 'bold ' + (4 * PX) + 'px system-ui, sans-serif'; ctx.fillStyle = '#111';
    function trace(lead, x0mm, y0mm, seconds, tOffset) {
      ctx.beginPath();
      var steps = Math.round(seconds * 25 * PX);
      for (var k = 0; k <= steps; k++) {
        var tt = tOffset + k / (25 * PX);
        var y = y0mm * PX - sample(lead, params, tt) * PX;
        var x = x0mm * PX + k;
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillText(lead, x0mm * PX + 6, (y0mm - 18) * PX + 4 * PX);
    }
    layout.forEach(function (row, r) {
      row.forEach(function (lead, c) {
        trace(lead, c * colSec * 25, r * rowH + rowH * 0.62 + 4, colSec, c * colSec);
        if (c > 0) { ctx.save(); ctx.lineWidth = 2; ctx.beginPath(); var xx = c * colSec * 25 * PX; var yy = (r * rowH + rowH * 0.62 + 4) * PX; ctx.moveTo(xx, yy - 5 * PX); ctx.lineTo(xx, yy + 5 * PX); ctx.stroke(); ctx.restore(); }
      });
    });
    if (rhythm) trace('II', 0, rows * rowH + rowH * 0.62 + 4, cols * colSec, 0);
    ctx.font = (3 * PX) + 'px system-ui, sans-serif'; ctx.fillStyle = '#7a2a2a';
    ctx.fillText('25 mm/s · 10 mm/mV · Schematic ECG generated for teaching — not a real patient tracing', 6, canvas.height - 2 * PX);
  }

  /* Live scrolling monitor trace (lead II). Returns a stop() function. */
  function liveMonitor(canvas, getParams) {
    var ctx = canvas.getContext('2d'), raf = 0, t0 = performance.now();
    var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function frame(now) {
      var p = getParams(); if (!p) { raf = requestAnimationFrame(frame); return; }
      var W = canvas.width, H = canvas.height;
      ctx.fillStyle = '#04130d'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(60,255,160,.08)'; ctx.lineWidth = 1;
      for (var x = 0; x < W; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      var secs = 4, tEnd = reduced ? 4 : (now - t0) / 1000;
      ctx.strokeStyle = '#3dffa0'; ctx.lineWidth = 2; ctx.beginPath();
      for (var i = 0; i < W; i++) {
        var tt = tEnd - secs + (i / W) * secs;
        var y = H * 0.62 - sample('II', p, tt) * (H / 30);
        if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
      }
      ctx.stroke();
      if (!reduced) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return function () { cancelAnimationFrame(raf); };
  }

  var api = { drawSheet: drawSheet, liveMonitor: liveMonitor, sample: sample, LEADS: Object.keys(BASE), LAYOUTS: LAYOUTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PXEcg = api;
})(typeof window !== 'undefined' ? window : this);
