/* =====================================================================
   PIXEL ER — Pixel art (all drawn in code, no external images)
   Native resolution 320×192 (20×12 tiles of 16 px), scaled up crisply.
   ===================================================================== */
(function (root) {
  'use strict';
  var T = 16, COLS = 20, ROWS = 12, W = COLS * T, H = ROWS * T;

  var MAP = [
    'WWWWWWWWWWWWWWWWWWWW',
    'VwwOwwwwwwwwwwwwLwwV',
    'V..MBI......DKd..S.V',
    'V...b........c.....V',
    'V..................V',
    'V.C...............HV',
    'V.................HV',
    'V..................V',
    'V..................V',
    'VP..............ccPV',
    'V..................V',
    'VVVVVVVVVXXVVVVVVVVV'
  ];
  var SOLID = 'WwOLVBbMIDKdSCHPX';
  var RESUS = { c0: 1, c1: 7, r0: 2, r1: 6 };

  function tileAt(c, r) { if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return 'W'; return MAP[r][c]; }
  function solidAt(px, py) { return SOLID.indexOf(tileAt(Math.floor(px / T), Math.floor(py / T))) !== -1; }

  /* deterministic pseudo-random for floor speckles */
  function hash(x, y) { var h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }

  function P(ctx, ox, oy) { return function (x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, w, h); }; }

  var C = {
    wallTop: '#22344d', wallTop2: '#2e4664', wallFace: '#dfe7ef', wallFace2: '#c9d5e1', base: '#8fa3b8',
    floor: '#e8edf2', floorLine: '#d9e1e9', resus: '#e3f1ee', resusLine: '#e2b100',
    wood: '#8a6a4a', woodD: '#6b5038', steel: '#9aa7b4', steelD: '#6c7a88', ink: '#0f2540'
  };

  function drawFloor(p, c, r) {
    var inResus = c >= RESUS.c0 && c <= RESUS.c1 && r >= RESUS.r0 && r <= RESUS.r1;
    p(0, 0, T, T, inResus ? C.resus : C.floor);
    p(0, 0, T, 1, C.floorLine); p(0, 0, 1, T, C.floorLine);
    for (var i = 0; i < 3; i++) { var hx = Math.floor(hash(c * 7 + i, r * 3) * 14) + 1, hy = Math.floor(hash(c, r * 11 + i) * 14) + 1; p(hx, hy, 1, 1, inResus ? '#d5e8e3' : '#dfe6ec'); }
    if (inResus) {
      if (c === RESUS.c0) p(0, 0, 2, T, C.resusLine);
      if (c === RESUS.c1) p(T - 2, 0, 2, T, C.resusLine);
      if (r === RESUS.r1) p(0, T - 2, T, 2, C.resusLine);
    }
  }

  function drawTile(ctx, ch, c, r) {
    var ox = c * T, oy = r * T, p = P(ctx, ox, oy);
    switch (ch) {
      case 'W': p(0, 0, T, T, C.wallTop); p(0, T - 3, T, 3, C.wallTop2); break;
      case 'V':
        p(0, 0, T, T, C.wallTop); if (r === ROWS - 1) { p(0, 0, T, 3, C.wallTop2); }
        else if (c === 0) p(T - 3, 0, 3, T, C.wallTop2); else p(0, 0, 3, T, C.wallTop2);
        break;
      case 'w': case 'O': case 'L':
        p(0, 0, T, T, C.wallFace); p(0, 0, T, 1, '#f4f8fb'); p(0, T - 3, T, 3, C.base); p(0, T - 4, T, 1, C.wallFace2);
        if (c % 4 === 0) p(0, 1, 1, T - 4, C.wallFace2);
        if (ch === 'O') { /* medical gas panel */
          p(2, 2, 12, 9, '#f7f9fb'); p(2, 10, 12, 1, '#b8c5d2');
          p(3, 4, 3, 3, '#2e9e4f'); p(7, 4, 3, 3, '#f2c230'); p(11, 4, 2, 3, '#ffffff'); p(11, 4, 2, 1, '#9fb0c3');
        }
        if (ch === 'L') { /* PACS screen */
          p(1, 1, 14, 10, '#1a1f26'); p(2, 2, 12, 8, '#0d2236'); p(3, 3, 4, 6, '#3b5b7a'); p(9, 3, 4, 6, '#3b5b7a'); p(7, 3, 2, 6, '#26405a');
          p(6, 11, 4, 1, '#56606b');
        }
        break;
      case 'X': /* sliding door */
        p(0, 0, T, T, C.wallTop); p(1, 0, 14, T - 2, '#9fc3e6'); p(1, 0, 14, 2, '#c8def3'); p(c % 2 ? 0 : T - 1, 0, 1, T, '#4d6b8a');
        p(3, 5, 10, 1, 'rgba(255,255,255,.6)');
        break;
      default: drawFloor(p, c, r);
    }
    /* furniture on top of floor */
    switch (ch) {
      case 'M': /* monitor pole (screen drawn live) */
        p(7, 9, 2, 6, C.steelD); p(4, 14, 8, 2, '#56606b'); p(2, 0, 12, 10, '#262b31'); p(3, 1, 10, 7, '#04130d'); p(3, 9, 10, 1, '#3d444c');
        break;
      case 'I': /* IV pole + bag */
        p(7, 2, 2, 13, C.steel); p(4, 14, 8, 2, '#56606b'); p(5, 0, 6, 2, C.steel);
        p(5, 2, 4, 6, 'rgba(205,232,255,.95)'); p(5, 2, 4, 1, '#9fc3e6'); p(6, 8, 1, 4, '#b9d6f0');
        break;
      case 'D': case 'K': case 'd':
        p(0, 4, T, 10, C.wood); p(0, 4, T, 1, '#a58360'); p(0, 13, T, 2, C.woodD);
        if (ch === 'K') { p(3, 0, 10, 8, '#2a2f36'); p(4, 1, 8, 5, '#4fb3ff'); p(5, 2, 5, 1, '#c8e9ff'); p(5, 4, 3, 1, '#c8e9ff'); p(7, 8, 2, 1, '#2a2f36'); p(4, 9, 8, 2, '#e3e8ee'); }
        if (ch === 'D') { p(3, 6, 6, 5, '#ffffff'); p(4, 7, 4, 1, '#b8c5d2'); p(4, 9, 3, 1, '#b8c5d2'); p(10, 6, 3, 4, '#d22b2b'); }
        if (ch === 'd') { p(3, 7, 5, 3, '#2f3640'); p(9, 6, 4, 5, '#f4f0e6'); p(10, 7, 2, 1, '#c4870a'); }
        break;
      case 'c':
        p(4, 3, 8, 3, '#3a4a5c'); p(3, 6, 10, 6, '#4a5d73'); p(4, 12, 1, 3, '#2a3644'); p(11, 12, 1, 3, '#2a3644');
        break;
      case 'C': /* crash cart */
        p(2, 3, 12, 12, '#c62828'); p(2, 3, 12, 1, '#e35454'); p(2, 7, 12, 1, '#8e1c1c'); p(2, 10, 12, 1, '#8e1c1c'); p(2, 13, 12, 1, '#8e1c1c');
        p(4, 0, 8, 4, '#f2c230'); p(5, 1, 4, 2, '#1b1f24'); p(10, 1, 1, 1, '#2e9e4f'); p(2, 15, 2, 1, '#222'); p(12, 15, 2, 1, '#222');
        break;
      case 'S':
        p(2, 3, 12, 9, '#cfd8e0'); p(4, 5, 8, 5, '#9fb3c8'); p(7, 1, 2, 4, C.steel); p(6, 1, 4, 1, C.steel); p(2, 12, 12, 2, '#b5c2ce');
        break;
      case 'H':
        p(1, 0, 14, T, C.steelD); p(2, 1, 12, 14, '#b9c4cf');
        p(2, 5, 12, 1, C.steelD); p(2, 10, 12, 1, C.steelD);
        p(3, 2, 3, 3, '#4fb3ff'); p(7, 2, 4, 3, '#f2c230'); p(3, 7, 5, 3, '#ffffff'); p(9, 7, 3, 3, '#2e9e4f'); p(4, 12, 7, 2, '#d22b2b');
        break;
      case 'P':
        p(5, 10, 6, 5, '#b5651d'); p(5, 10, 6, 1, '#d08040'); p(4, 4, 4, 6, '#2e7d32'); p(8, 2, 4, 8, '#3fa34d'); p(6, 6, 4, 4, '#4caf50');
        break;
    }
  }

  /* Static map → offscreen canvas */
  function renderMap() {
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var ch = MAP[r][c];
      if (ch === 'B' || ch === 'b') drawTile(ctx, '.', c, r); else drawTile(ctx, ch, c, r);
    }
    /* RESUS sign */
    var p = P(ctx, 0, 0);
    p(104, 18, 44, 11, '#d22b2b'); p(104, 18, 44, 1, '#ff6b6b'); p(104, 28, 44, 1, '#8e1c1c');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace'; ctx.textBaseline = 'top'; ctx.fillText('RESUS 1', 108, 20);
    /* wall clock */
    p(213, 19, 9, 9, '#ffffff'); p(213, 19, 9, 1, '#56606b'); p(217, 21, 1, 4, '#111'); p(217, 24, 3, 1, '#111');
    return cv;
  }

  /* -------------------- Characters -------------------- */
  var LOOKS = {
    doctor_m: { skin: '#d9a47e', hair: '#2b1d14', top: '#ffffff', under: '#3f7fbf', bottom: '#2f4e7a', shoes: '#1e2630', steth: true },
    doctor_f: { skin: '#e2b08d', hijab: '#1f3550', top: '#ffffff', under: '#3f7fbf', bottom: '#2f4e7a', shoes: '#1e2630', steth: true },
    nurse:    { skin: '#c99272', hijab: '#e8eef5', top: '#1f9e8f', bottom: '#1f9e8f', shoes: '#f4f6f8' },
    paramedic:{ skin: '#b98262', hair: '#1a1410', top: '#2e6b3a', bottom: '#2a3a2a', shoes: '#111', stripe: '#d8f000' },
    senior:   { skin: '#d6a07a', hijab: '#6b2d3d', top: '#ffffff', under: '#7b4fa0', bottom: '#33384a', shoes: '#1e2630', steth: true }
  };
  var PATIENT_LOOKS = {
    adult_m: { skin: '#cf9a74', hair: '#2b1d14', gown: '#8fb8de' },
    adult_f: { skin: '#e0b090', hair: '#3a2416', gown: '#e5a9c0', hijab: '#4a3a5a' },
    elder_m: { skin: '#cf9a74', hair: '#d8d8d8', gown: '#8fb8de' },
    elder_f: { skin: '#e0b090', hair: '#cfcfcf', gown: '#e5a9c0', hijab: '#7a6a5a' },
    child:   { skin: '#e2b08d', hair: '#2b1d14', gown: '#f6d365' }
  };

  /* Draw a 16×16 character with feet at (fx, fy). dir: 0 down 1 up 2 left 3 right */
  function drawChar(ctx, fx, fy, look, dir, frame) {
    var ox = Math.round(fx - 8), oy = Math.round(fy - 15), p = P(ctx, ox, oy);
    var walk = frame % 4, swing = (walk === 1) ? 1 : (walk === 3 ? -1 : 0);
    p(3, 14, 10, 2, 'rgba(15,37,64,.22)');
    /* legs */
    var lL = swing > 0 ? 2 : 3, lR = swing < 0 ? 2 : 3;
    if (dir < 2) { p(5, 11, 2, lL, look.bottom); p(9, 11, 2, lR, look.bottom); p(5, 11 + lL, 2, 1, look.shoes); p(9, 11 + lR, 2, 1, look.shoes); }
    else { p(6, 11, 2, lL, look.bottom); p(8, 11, 2, lR, look.bottom); p(6, 11 + lL, 2, 1, look.shoes); p(8, 11 + lR, 2, 1, look.shoes); }
    /* body */
    var bx = dir < 2 ? 4 : 5, bw = dir < 2 ? 8 : 6;
    p(bx, 6, bw, 6, look.top); p(bx, 11, bw, 1, shade(look.top));
    if (look.under && dir === 0) { p(7, 6, 2, 3, look.under); }
    if (look.stripe) p(bx, 9, bw, 1, look.stripe);
    if (look.steth && dir === 0) { p(6, 7, 1, 3, '#2d3540'); p(9, 7, 1, 3, '#2d3540'); p(7, 10, 2, 1, '#2d3540'); p(8, 10, 1, 1, '#9aa7b4'); }
    if (look.steth && dir === 0) p(10, 8, 1, 1, '#d22b2b'); /* badge */
    /* arms */
    var aw = swing;
    if (dir < 2) { p(3, 7 + Math.max(0, aw), 1, 4, look.top); p(12, 7 + Math.max(0, -aw), 1, 4, look.top); if (dir === 0) { p(3, 11 + Math.max(0, aw), 1, 1, look.skin); p(12, 11 + Math.max(0, -aw), 1, 1, look.skin); } }
    else { var ax = dir === 2 ? 6 + aw : 9 - aw; p(ax, 7, 1, 4, shade(look.top)); p(ax, 11, 1, 1, look.skin); }
    /* head */
    if (look.hijab) {
      p(3, 1, 10, 7, look.hijab); p(4, 0, 8, 1, look.hijab); p(3, 7, 10, 1, shade(look.hijab));
      if (dir === 0) { p(5, 3, 6, 4, look.skin); eyes(p, dir); }
      if (dir === 2) { p(4, 3, 4, 4, look.skin); eyes(p, dir); }
      if (dir === 3) { p(8, 3, 4, 4, look.skin); eyes(p, dir); }
    } else {
      p(4, 1, 8, 6, look.skin);
      if (dir === 0) { p(4, 1, 8, 2, look.hair); p(4, 3, 1, 2, look.hair); p(11, 3, 1, 2, look.hair); eyes(p, dir); }
      if (dir === 1) { p(4, 1, 8, 5, look.hair); }
      if (dir === 2) { p(4, 1, 8, 2, look.hair); p(8, 3, 4, 3, look.hair); eyes(p, dir); }
      if (dir === 3) { p(4, 1, 8, 2, look.hair); p(4, 3, 4, 3, look.hair); eyes(p, dir); }
      p(4, 6, 8, 1, shade(look.skin));
    }
  }
  function eyes(p, dir) {
    if (dir === 0) { p(6, 4, 1, 1, '#1b1b1b'); p(9, 4, 1, 1, '#1b1b1b'); }
    if (dir === 2) p(5, 4, 1, 1, '#1b1b1b');
    if (dir === 3) p(10, 4, 1, 1, '#1b1b1b');
  }
  function shade(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r * 0.78); g = Math.round(g * 0.78); b = Math.round(b * 0.78);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* Patient in bed. Bed occupies tile (4,2)-(4,3). */
  function drawBed(ctx, look, state, t) {
    var ox = 4 * T, oy = 2 * T, p = P(ctx, ox, oy);
    var rate = state === 'critical' ? 5 : state === 'deteriorating' ? 3.5 : 1.6;
    var breath = Math.sin(t * rate) > 0 ? 1 : 0;
    p(1, 1, 14, 30, C.steelD); p(2, 2, 12, 28, '#f4f6f8');
    p(1, 0, 14, 2, '#56606b');
    p(3, 3, 10, 5, '#ffffff'); p(3, 7, 10, 1, '#cfd8e0');
    /* head */
    if (look.hijab) { p(5, 2, 6, 6, look.hijab); p(6, 4, 4, 3, look.skin); }
    else { p(5, 3, 6, 5, look.skin); p(5, 3, 6, 2, look.hair); }
    var faceY = look.hijab ? 5 : 5;
    if (state === 'critical') { p(6, faceY + 1, 1, 1, '#555'); p(9, faceY + 1, 1, 1, '#555'); }
    else { p(6, faceY, 1, 1, '#1b1b1b'); p(9, faceY, 1, 1, '#1b1b1b'); }
    var pale = (state === 'deteriorating' || state === 'critical' || state === 'unchanged');
    if (pale) p(5, 7, 6, 1, 'rgba(200,210,220,.55)');
    /* gown + arms */
    p(3, 8 - breath, 10, 7 + breath, look.gown); p(3, 8 - breath, 10, 1, shade(look.gown));
    p(2, 9, 1, 5, look.skin); p(13, 9, 1, 5, look.skin);
    if (state === 'unchanged' || state === 'deteriorating') p(7, 9 - breath, 3, 2, look.skin); /* hand on chest */
    /* blanket */
    p(2, 15, 12, 14, '#3d6fa6'); p(2, 15, 12, 2, '#5b8cc4'); p(2, 28, 12, 1, '#2c5684');
    p(5, 20, 1, 7, '#355f8f'); p(10, 20, 1, 7, '#355f8f');
    /* sweat when unwell */
    if ((state === 'deteriorating' || state === 'critical' || state === 'unchanged') && Math.floor(t * 2) % 2 === 0) { p(4, 4, 1, 2, '#8fd0ff'); p(11, 5, 1, 1, '#8fd0ff'); }
    p(1, 30, 2, 2, '#222'); p(13, 30, 2, 2, '#222');
  }

  /* Live monitor screen on the pole (tile 3,2). */
  function drawMonitorScreen(ctx, attached, hr, state, t) {
    var p = P(ctx, 3 * T, 2 * T);
    p(3, 1, 10, 7, '#04130d');
    if (!attached) { if (Math.floor(t * 1.5) % 2) p(7, 4, 2, 1, '#3d444c'); return; }
    var rr = 60 / Math.max(30, hr || 80), pos = (t % rr) / rr;
    var cols = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var spike = Math.floor(pos * 10);
    for (var i = 0; i < 10; i++) {
      var y = 5;
      if (i === spike) y = 2; else if (i === spike + 1) y = 6;
      p(3 + i, 1 + y, 1, 1, '#3dffa0');
    }
    var alarm = state === 'deteriorating' || state === 'critical';
    p(12, 0, 2, 1, alarm && Math.floor(t * 4) % 2 ? '#ff3b3b' : '#3d444c');
  }

  /* A floating "!" bubble above a point. */
  function drawBubble(ctx, x, y, t, color) {
    var bob = Math.round(Math.sin(t * 5) * 1.5), p = P(ctx, Math.round(x - 4), Math.round(y - 12 + bob));
    p(0, 0, 8, 9, '#0f2540'); p(1, 1, 6, 7, color || '#ffd23f'); p(3, 2, 2, 3, '#0f2540'); p(3, 6, 2, 1, '#0f2540'); p(3, 9, 2, 1, '#0f2540');
  }

  /* Portrait: the character's head and shoulders, enlarged. */
  function drawPortrait(canvas, who, extra) {
    var ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    var tmp = document.createElement('canvas'); tmp.width = 16; tmp.height = 16;
    var tctx = tmp.getContext('2d');
    var look = LOOKS[who];
    if (!look && who === 'patient') {
      var pl = PATIENT_LOOKS[extra] || PATIENT_LOOKS.adult_m;
      look = { skin: pl.skin, hair: pl.hair, hijab: pl.hijab, top: pl.gown, bottom: pl.gown, shoes: '#ccc' };
    }
    if (!look) look = LOOKS.senior;
    drawChar(tctx, 8, 15, look, 0, 0);
    ctx.fillStyle = '#cfe3f5'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    /* crop rows 0..11 (head + shoulders) */
    ctx.drawImage(tmp, 2, 0, 12, 12, 0, 0, canvas.width, canvas.height);
  }

  root.PXArt = {
    T: T, COLS: COLS, ROWS: ROWS, W: W, H: H, MAP: MAP, tileAt: tileAt, solidAt: solidAt,
    renderMap: renderMap, drawChar: drawChar, drawBed: drawBed, drawMonitorScreen: drawMonitorScreen,
    drawBubble: drawBubble, drawPortrait: drawPortrait, LOOKS: LOOKS, PATIENT_LOOKS: PATIENT_LOOKS
  };
})(window);
