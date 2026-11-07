/* =====================================================================
   PIXEL ER — Case Builder (no-code editor for weekly cases)
   Edits case data with forms, validates it, previews it in the real game
   and exports either a .json case or a ready-to-upload index.html.
   ===================================================================== */
(function (root) {
  'use strict';
  var Core = root.PXCore, Art = root.PXArt, G = root.PXGame;
  var esc = G.esc, store = G.store;
  var WS_KEY = 'pxer.builder.workspace';

  var SECTIONS = [
    ['basics', 'Basics'], ['patient', 'Patient & handover'], ['actions', 'Actions'], ['events', 'Events'],
    ['endings', 'Endings'], ['scoring', 'Scoring'], ['teaching', 'Teaching & references'], ['publish', 'Check & publish'], ['json', 'JSON']
  ];
  var CAT_LABELS = { history: 'History question', exam: 'Examination', reassess: 'Reassessment', treatment: 'Treatment', procedure: 'Procedure / help',
    investigation: 'Investigation', diagnosis: 'Diagnosis option', disposition: 'Plan / disposition' };
  var CLAUSES = {
    done: { label: 'action was done', args: ['action'] },
    notDone: { label: 'action was NOT done', args: ['action'] },
    last: { label: 'action was just done', args: ['action'] },
    flag: { label: 'flag is set', args: ['flag'] },
    noFlag: { label: 'flag is NOT set', args: ['flag'] },
    before: { label: 'A done before B', args: ['action', 'action'] },
    after: { label: 'A done (again) after B', args: ['action', 'action'] },
    within: { label: 'action done within N min of arrival', args: ['action', 'num'] },
    withinAfter: { label: 'B done within N min after A', args: ['action', 'action', 'num'] },
    count: { label: 'action done N times', args: ['action', 'op', 'num'] },
    vital: { label: 'vital sign compared', args: ['vital', 'op', 'num'] },
    state: { label: 'patient state is', args: ['state'] },
    time: { label: 'clock compared (min)', args: ['op', 'num'] }
  };
  var SCALAR = { done: 1, notDone: 1, last: 1, flag: 1, noFlag: 1, state: 1 };
  var OPS = ['<', '<=', '>', '>=', '==', '!='];

  function getPath(o, path) { return path.split('.').reduce(function (x, k) { return x == null ? undefined : x[k]; }, o); }
  function setPath(o, path, v) {
    var ks = path.split('.'), x = o;
    for (var i = 0; i < ks.length - 1; i++) { if (x[ks[i]] == null || typeof x[ks[i]] !== 'object') x[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; x = x[ks[i]]; }
    if (v === undefined) { if (Array.isArray(x)) x.splice(Number(ks[ks.length - 1]), 1); else delete x[ks[ks.length - 1]]; } else x[ks[ks.length - 1]] = v;
  }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30) || 'item'; }
  function uniqueId(base, list) { var id = base, n = 2; var has = function (x) { return list.some(function (a) { return a.id === x; }); }; while (has(id)) id = base + '_' + (n++); return id; }

  function blankCase() {
    return {
      schemaVersion: 1, id: 'new-case-' + Date.now().toString(36), title: 'New case', category: '', difficulty: 'Intermediate', durationMin: 15,
      tagline: '', objectives: [], status: 'draft',
      review: { lastReviewed: '', aiReviewed: false, facultyReviewer: '', notes: '' },
      schedule: { publishAt: '', closeAt: '' }, maxXP: 100, setting: { timeLimitMin: 60, scene: 'resus' },
      patient: { name: 'Patient', age: 40, sex: 'M', sprite: 'adult_m', chiefComplaint: '', background: '' },
      handover: { by: 'paramedic', lines: [''] },
      initial: { vitals: { hr: 80, sbp: 120, dbp: 80, rr: 16, spo2: 98, temp: 37, gcs: 15, glucose: 6 }, state: 'stable', flags: [], monitorAttached: false },
      stateText: { stable: '', improving: '', unchanged: '', deteriorating: '', critical: '' },
      actions: [
        { id: 'hx_main', category: 'history', label: 'Tell me what happened.', time: 1, response: '' },
        { id: 'ex_abcde', category: 'exam', label: 'ABCDE assessment', time: 2, response: '' },
        { id: 'reassess', category: 'reassess', label: 'Reassess the patient', time: 2, response: '' },
        { id: 'tx_monitor', category: 'treatment', label: 'Attach cardiac monitor', time: 1, response: 'Monitor on.', effects: { flags: ['monitor'] } },
        { id: 'disp_admit', category: 'disposition', label: 'Admit / refer', time: 2, response: '', endCase: true }
      ],
      events: [],
      endings: [{ id: 'end_default', title: 'Case complete', outcome: 'fair', text: '' }],
      scoring: { weights: Core.clone(Core.DEFAULT_WEIGHTS), rubric: [] },
      teaching: { keyPoints: [], pearls: [] },
      references: []
    };
  }

  function Builder(container, opts) {
    this.el = container; this.opts = opts || {};
    var ws = store(WS_KEY);
    var embedded = Core.clone(opts.cases || []);
    var byId = {};
    embedded.forEach(function (c) { byId[c.id] = c; });
    if (ws && ws.cases) ws.cases.forEach(function (c) { byId[c.id] = c; });
    this.cases = Object.keys(byId).map(function (k) { return byId[k]; });
    this.embeddedIds = embedded.map(function (c) { return c.id; });
    this.sel = (ws && ws.sel && byId[ws.sel]) ? ws.sel : (this.cases[0] ? this.cases[0].id : null);
    this.section = (ws && ws.section) || 'basics';
    this.actFilter = 'all';
    this.config = Core.clone(opts.config || { showUnreviewed: true });
  }

  Builder.prototype.cur = function () { var s = this.sel; return this.cases.filter(function (c) { return c.id === s; })[0]; };
  Builder.prototype.persist = function () {
    var self = this; clearTimeout(this._t);
    this._t = setTimeout(function () { store(WS_KEY, { cases: self.cases, sel: self.sel, section: self.section }); self.flashSaved(); }, 250);
  };
  Builder.prototype.flashSaved = function () { var s = this.el.querySelector('.bd-saved'); if (s) { s.textContent = 'Saved on this device ✓'; s.classList.add('on'); setTimeout(function () { s.classList.remove('on'); }, 1200); } };

  Builder.prototype.mount = function () {
    var self = this;
    this.el.className = 'bd';
    this.el.innerHTML =
      '<header class="bd-top"><div><b>PIXEL ER</b> · Case Builder <span class="bd-saved"></span></div>' +
      '<div class="bd-top-r"><button class="px-btn sm" data-b="new">＋ New case</button><button class="px-btn sm" data-b="dup">⧉ Duplicate</button>' +
      '<label class="px-btn sm ghost">⇪ Import .json<input type="file" accept=".json,application/json" hidden data-b="import"></label>' +
      '<button class="px-btn sm" data-b="play">▶ Preview</button><button class="px-btn sm ghost" data-b="exit">← Back to game</button></div></header>' +
      '<div class="bd-note">Changes are saved on <b>this device only</b>. Members only see a case after you download the game file and upload it to Netlify (see <b>Check &amp; publish</b>).</div>' +
      '<div class="bd-body"><aside class="bd-list"></aside><main class="bd-main"><nav class="bd-secs"></nav><div class="bd-form"></div></main></div>';
    this.el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-b]'); if (!b) return;
      var a = b.getAttribute('data-b');
      if (a === 'new') { var c = blankCase(); self.cases.push(c); self.sel = c.id; self.section = 'basics'; self.render(); self.persist(); }
      if (a === 'dup') { var cur = self.cur(); if (!cur) return; var d = Core.clone(cur); d.id = uniqueId(cur.id + '-copy', self.cases); d.title = cur.title + ' (copy)'; d.status = 'draft'; d.review = { lastReviewed: '', aiReviewed: false, facultyReviewer: '', notes: '' }; d.schedule = { publishAt: '', closeAt: '' }; self.cases.push(d); self.sel = d.id; self.render(); self.persist(); }
      if (a === 'play') { if (self.cur() && self.opts.onPreview) self.opts.onPreview(Core.clone(self.cur())); }
      if (a === 'exit') { if (self.opts.onExit) self.opts.onExit(); }
    });
    this.el.querySelector('[data-b="import"]').addEventListener('change', function (e) { self.importFile(e.target.files[0]); e.target.value = ''; });
    this.bind(this.el.querySelector('.bd-form'));
    this.render();
  };

  Builder.prototype.importFile = function (file) {
    var self = this; if (!file) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var data = JSON.parse(r.result), list = Array.isArray(data) ? data : [data], n = 0;
        list.forEach(function (c) {
          if (!c || !c.id) return;
          var i = self.cases.findIndex(function (x) { return x.id === c.id; });
          if (i !== -1) { if (!root.confirm('A case with id “' + c.id + '” exists. Replace it?')) return; self.cases[i] = c; } else self.cases.push(c);
          self.sel = c.id; n++;
        });
        self.render(); self.persist(); root.alert(n + ' case(s) imported.');
      } catch (err) { root.alert('That file is not valid JSON: ' + err.message); }
    };
    r.readAsText(file);
  };

  Builder.prototype.render = function () {
    var self = this, c = this.cur();
    this.renderListOnly();
    var nav = this.el.querySelector('.bd-secs');
    nav.innerHTML = SECTIONS.map(function (s) { return '<button data-sec="' + s[0] + '" aria-selected="' + (self.section === s[0]) + '">' + s[1] + '</button>'; }).join('');
    Array.prototype.forEach.call(nav.querySelectorAll('[data-sec]'), function (b) { b.onclick = function () { self.section = b.getAttribute('data-sec'); self.render(); self.persist(); }; });
    var form = this.el.querySelector('.bd-form');
    if (!c) { form.innerHTML = '<p class="px-empty">No cases yet. Click <b>＋ New case</b>.</p>'; return; }
    form.innerHTML = '';
    this['sec_' + this.section](form, c);
  };

  /* ---------- field helpers (return HTML) ---------- */
  function fld(label, path, val, type, extra) {
    type = type || 'text'; extra = extra || {};
    var id = 'f_' + path.replace(/\./g, '_'), help = extra.help ? '<small>' + extra.help + '</small>' : '';
    var input;
    if (type === 'textarea' || type === 'lines') input = '<textarea id="' + id + '" data-p="' + path + '" data-t="' + type + '" rows="' + (extra.rows || 3) + '">' + esc(type === 'lines' ? (val || []).join('\n') : (val || '')) + '</textarea>';
    else if (type === 'select') input = '<select id="' + id + '" data-p="' + path + '" data-t="' + (extra.num ? 'num' : 'text') + '">' + extra.options.map(function (o) { var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>';
    else if (type === 'bool') return '<label class="bd-chk"><input type="checkbox" data-p="' + path + '" data-t="bool"' + (val ? ' checked' : '') + '> ' + label + help + '</label>';
    else if (type === 'csv') input = '<input id="' + id + '" data-p="' + path + '" data-t="csv" value="' + esc((val || []).join(', ')) + '">';
    else input = '<input id="' + id + '" type="' + (type === 'num' ? 'number' : type) + '" step="any" data-p="' + path + '" data-t="' + (type === 'num' ? 'num' : 'text') + '" value="' + esc(val == null ? '' : val) + '"' + (extra.list ? ' list="' + extra.list + '"' : '') + '>';
    return '<label class="bd-f ' + (extra.cls || '') + '" for="' + id + '"><span>' + label + '</span>' + input + help + '</label>';
  }

  Builder.prototype.actionOptions = function (c) { return (c.actions || []).map(function (a) { return [a.id, a.label + ' (' + a.id + ')']; }); };

  /* Condition editor: flat ALL / ANY lists, or raw JSON for anything nested. */
  Builder.prototype.condEditor = function (c, path, cond, label) {
    var flat = null, mode = 'always';
    function simple(x) { if (!x || typeof x !== 'object') return false; var k = Object.keys(x)[0]; return !!CLAUSES[k]; }
    if (cond === undefined || cond === null || cond === true) flat = [];
    else if (cond.all && cond.all.every(simple)) { mode = 'all'; flat = cond.all; }
    else if (cond.any && cond.any.every(simple)) { mode = 'any'; flat = cond.any; }
    else if (simple(cond)) { mode = 'all'; flat = [cond]; }
    if (flat && flat.length === 0) mode = 'always';
    var acts = this.actionOptions(c), self = this;
    var html = '<div class="bd-cond" data-cond="' + path + '"><div class="bd-cond-h"><span>' + label + '</span>';
    if (flat) {
      html += '<select data-cmode><option value="always"' + (mode === 'always' ? ' selected' : '') + '>Always</option><option value="all"' + (mode === 'all' ? ' selected' : '') + '>ALL of these are true</option><option value="any"' + (mode === 'any' ? ' selected' : '') + '>ANY of these is true</option><option value="json">Advanced (JSON)</option></select></div>';
      if (mode !== 'always') {
        html += '<div class="bd-rows">' + flat.map(function (cl, i) {
          var k = Object.keys(cl)[0], v = SCALAR[k] ? [cl[k]] : cl[k];
          return '<div class="bd-row" data-i="' + i + '"><select data-ck>' + Object.keys(CLAUSES).map(function (t) { return '<option value="' + t + '"' + (t === k ? ' selected' : '') + '>' + CLAUSES[t].label + '</option>'; }).join('') + '</select>' +
            CLAUSES[k].args.map(function (ty, j) { return self.argInput(ty, v[j], j, acts); }).join('') + '<button class="bd-x" data-crm title="Remove">✕</button></div>';
        }).join('') + '</div><button class="bd-add" data-cadd>＋ add condition</button>';
      } else html += '<button class="bd-add" data-cadd>＋ add condition</button>';
    } else {
      html += '<span class="muted">Advanced condition</span></div><textarea data-cjson rows="4">' + esc(JSON.stringify(cond, null, 1)) + '</textarea>';
    }
    html += '<p class="bd-desc">' + esc(Core.describeCond(cond, function (id) { var a = (c.actions || []).filter(function (x) { return x.id === id; })[0]; return a ? a.label : id + ' ⚠'; })) + '</p></div>';
    return html;
  };
  Builder.prototype.argInput = function (ty, v, j, acts) {
    if (ty === 'action') return '<select data-ca="' + j + '"><option value="">— choose action —</option>' + acts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === v ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
    if (ty === 'op') return '<select data-ca="' + j + '">' + OPS.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>';
    if (ty === 'vital') return '<select data-ca="' + j + '">' + Core.VITAL_KEYS.map(function (o) { return '<option value="' + o + '"' + (o === v ? ' selected' : '') + '>' + Core.VITAL_LABELS[o] + '</option>'; }).join('') + '</select>';
    if (ty === 'state') return '<select data-ca="' + j + '">' + Core.STATES.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>';
    if (ty === 'num') return '<input type="number" step="any" data-ca="' + j + '" data-num value="' + esc(v == null ? '' : v) + '" style="width:5em">';
    return '<input data-ca="' + j + '" value="' + esc(v || '') + '" placeholder="flag name" list="bd-flags" style="width:9em">';
  };

  function readCond(box) {
    var modeSel = box.querySelector('[data-cmode]');
    var js = box.querySelector('[data-cjson]');
    if (js) { try { return { ok: true, v: JSON.parse(js.value) }; } catch (e) { return { ok: false }; } }
    var mode = modeSel.value;
    if (mode === 'always') return { ok: true, v: undefined };
    var rows = Array.prototype.map.call(box.querySelectorAll('.bd-row'), function (row) {
      var k = row.querySelector('[data-ck]').value;
      var args = Array.prototype.map.call(row.querySelectorAll('[data-ca]'), function (inp) { return inp.hasAttribute('data-num') ? Number(inp.value) : inp.value; });
      var o = {}; o[k] = SCALAR[k] ? args[0] : args; return o;
    });
    if (!rows.length) return { ok: true, v: undefined };
    var out = {}; out[mode] = rows; return { ok: true, v: out };
  }

  function defaultClause(k, c) {
    var a = (c.actions && c.actions[0] && c.actions[0].id) || '';
    var args = CLAUSES[k].args.map(function (t) { return t === 'action' ? a : t === 'num' ? 10 : t === 'op' ? '>=' : t === 'vital' ? 'sbp' : t === 'state' ? 'stable' : ''; });
    var o = {}; o[k] = SCALAR[k] ? args[0] : args; return o;
  }

  /* ---------- binding ---------- */
  /* Attached once; always edits the currently selected case. */
  Builder.prototype.bind = function (form) {
    var self = this, c;
    function changed(rerenderList) { self.persist(); self.refreshStatus(c); if (rerenderList) self.renderListOnly(); }
    form.addEventListener('input', function (e) {
      c = self.cur(); if (!c) return;
      var t = e.target, p = t.getAttribute('data-p');
      if (p) {
        if (/\.result\.type$/.test(p)) return;
        var ty = t.getAttribute('data-t'), v = t.value;
        if (ty === 'num') v = v === '' ? undefined : Number(v);
        else if (ty === 'lines') v = v.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        else if (ty === 'csv') v = v.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        else if (ty === 'bool') v = t.checked;
        if (p === 'id') { var nv = slug(v).replace(/_/g, '-'); if (self.cases.some(function (x) { return x !== c && x.id === nv; })) return; self.sel = nv; v = nv; }
        setPath(c, p, v);
        changed(p === 'title' || p === 'status' || p === 'id');
        return;
      }
      var cb = t.closest('[data-cond]');
      if (cb && (t.matches('[data-ca]') || t.matches('[data-cjson]'))) {
        var r = readCond(cb); if (!r.ok) { t.classList.add('bad'); return; } t.classList.remove('bad');
        setPath(c, cb.getAttribute('data-cond'), r.v);
        cb.querySelector('.bd-desc').textContent = Core.describeCond(r.v, function (id) { var a = (c.actions || []).filter(function (x) { return x.id === id; })[0]; return a ? a.label : id + ' ⚠'; });
        changed();
      }
    });
    form.addEventListener('change', function (e) {
      c = self.cur(); if (!c) return;
      var t = e.target, p = t.getAttribute('data-p');
      if (p && /\.result\.type$/.test(p)) { self.setResultType(c, Number(p.split('.')[1]), t.value); return; }
      if (p && (t.type === 'checkbox' || t.tagName === 'SELECT')) {
        var v = t.type === 'checkbox' ? t.checked : (t.getAttribute('data-t') === 'num' ? Number(t.value) : t.value);
        setPath(c, p, v); changed(p === 'status');
        if (t.hasAttribute('data-rerender')) self.render();
        return;
      }
      var cb = t.closest('[data-cond]');
      if (!cb) return;
      if (t.matches('[data-cmode]')) {
        var cur = getPath(c, cb.getAttribute('data-cond')), m = t.value, rows = [];
        if (cur && (cur.all || cur.any)) rows = cur.all || cur.any; else if (cur) rows = [cur];
        var nv;
        if (m === 'always') nv = undefined;
        else if (m === 'json') { setPath(c, cb.getAttribute('data-cond'), cur || { all: [] }); self.render(); return; }
        else { nv = {}; nv[m] = rows.length ? rows : [defaultClause('done', c)]; }
        setPath(c, cb.getAttribute('data-cond'), nv); changed(); self.render(); return;
      }
      if (t.matches('[data-ck]')) {
        var row = t.closest('.bd-row'), i = Number(row.getAttribute('data-i'));
        var cond = getPath(c, cb.getAttribute('data-cond')), arr = cond.all || cond.any;
        if (!arr) { cond = { all: [cond] }; arr = cond.all; setPath(c, cb.getAttribute('data-cond'), cond); }
        arr[i] = defaultClause(t.value, c); changed(); self.render(); return;
      }
      if (t.matches('[data-ca]')) { var r = readCond(cb); if (r.ok) { setPath(c, cb.getAttribute('data-cond'), r.v); changed(); self.render(); } }
    });
    form.addEventListener('click', function (e) {
      c = self.cur(); if (!c) return;
      var t = e.target, cb = t.closest('[data-cond]');
      if (cb && t.matches('[data-cadd]')) {
        var p = cb.getAttribute('data-cond'), cur = getPath(c, p);
        if (!cur) cur = { all: [] }; else if (!cur.all && !cur.any) cur = { all: [cur] };
        (cur.all || cur.any).push(defaultClause('done', c)); setPath(c, p, cur); changed(); self.render(); return;
      }
      if (cb && t.matches('[data-crm]')) {
        var p2 = cb.getAttribute('data-cond'), cur2 = getPath(c, p2), i = Number(t.closest('.bd-row').getAttribute('data-i'));
        var arr = cur2.all || cur2.any; if (arr) { arr.splice(i, 1); if (!arr.length) cur2 = undefined; } else cur2 = undefined;
        setPath(c, p2, cur2); changed(); self.render(); return;
      }
      var op = t.closest('[data-op]'); if (!op) return;
      self.listOp(c, op.getAttribute('data-op'), op.getAttribute('data-arr'), Number(op.getAttribute('data-i')), op);
    });
  };

  Builder.prototype.setResultType = function (c, i, v) {
    var a = c.actions[i]; if (!a) return;
    if (v === 'none') delete a.result;
    else {
      a.result = a.result || { delay: 0, text: '' }; a.result.type = v;
      if (v === 'labs' && !a.result.labs) a.result.labs = [{ name: '', value: '', unit: '', ref: '', flag: '' }];
      if (v === 'ecg' && !a.result.ecg) a.result.ecg = { rate: 80, layout: 'standard12', st: {} };
      if (v === 'image' && !a.result.image) a.result.image = { url: '', alt: '', credit: '', license: '' };
    }
    this.openCard = i; this.persist(); this.render();
  };

  Builder.prototype.renderListOnly = function () {
    var self = this, c = this.cur(), list = this.el.querySelector('.bd-list');
    list.innerHTML = '<h3>Cases</h3><ul>' + this.cases.map(function (x) {
      var v = Core.validateCase(x);
      return '<li class="' + (x.id === self.sel ? 'on' : '') + '"><button data-sel="' + esc(x.id) + '"><b>' + esc(x.title || x.id) + '</b><span class="st st-' + esc(x.status) + '">' + esc(Core.STATUS_LABELS[x.status] || x.status) + '</span>' +
        (v.errors.length ? '<span class="err">' + v.errors.length + ' error' + (v.errors.length > 1 ? 's' : '') + '</span>' : '') + '</button></li>';
    }).join('') + '</ul>' + (c ? '<button class="bd-del" data-del>Delete this case</button>' : '');
    Array.prototype.forEach.call(list.querySelectorAll('[data-sel]'), function (b) { b.onclick = function () { self.sel = b.getAttribute('data-sel'); self.render(); self.persist(); }; });
    var del = list.querySelector('[data-del]');
    if (del) del.onclick = function () {
      if (!root.confirm('Delete “' + c.title + '” from this device? It cannot be recovered unless you exported it.')) return;
      self.cases = self.cases.filter(function (x) { return x.id !== c.id; }); self.sel = self.cases[0] ? self.cases[0].id : null; self.render(); self.persist();
    };
  };

  Builder.prototype.refreshStatus = function (c) {
    var box = this.el.querySelector('.bd-live'); if (!box) return;
    var v = Core.validateCase(c);
    box.innerHTML = v.errors.length ? '<span class="err">' + v.errors.length + ' error(s)</span> — see Check &amp; publish' : '<span class="ok">No errors</span>' + (v.warnings.length ? ' · ' + v.warnings.length + ' warning(s)' : '');
  };

  Builder.prototype.listOp = function (c, op, arrPath, i, el) {
    var arr = getPath(c, arrPath);
    if (!Array.isArray(arr)) { arr = []; setPath(c, arrPath, arr); }
    if (op === 'del') { if (!root.confirm('Remove this item?')) return; arr.splice(i, 1); }
    else if (op === 'up' && i > 0) { var x = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = x; }
    else if (op === 'down' && i < arr.length - 1) { var y = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = y; }
    else if (op === 'dup') { var d = Core.clone(arr[i]); if (d.id) d.id = uniqueId(d.id + '_copy', arr); arr.splice(i + 1, 0, d); }
    else if (op === 'add') {
      var kind = el.getAttribute('data-kind') || '';
      var item = {};
      if (arrPath === 'actions') { var cat = kind || 'history'; item = { id: uniqueId(({ history: 'hx', exam: 'ex', reassess: 'reassess', treatment: 'tx', procedure: 'proc', investigation: 'inv', diagnosis: 'dx', disposition: 'disp' })[cat] + '_new', arr), category: cat, label: 'New ' + CAT_LABELS[cat].toLowerCase(), time: 1, response: '' }; if (cat === 'diagnosis') { item.group = 'dx'; item.time = 0; } if (cat === 'investigation') item.result = { type: 'text', delay: 0, text: '' }; this.openCard = arr.length; }
      else if (arrPath === 'events') item = { id: uniqueId('ev_new', arr), when: { done: (c.actions[0] || {}).id }, delay: 0, speaker: 'Nurse', message: '' };
      else if (arrPath === 'endings') { item = { id: uniqueId('end_new', arr), title: 'New ending', outcome: 'fair', text: '', when: { done: (c.actions[0] || {}).id } }; arr.splice(Math.max(0, arr.length - 1), 0, item); this.persist(); this.render(); return; }
      else if (arrPath === 'scoring.rubric') item = { id: uniqueId('r_new', arr), domain: kind || 'assessment', points: 2, when: { done: (c.actions[0] || {}).id }, good: '', missed: '' };
      else if (arrPath === 'references') item = { text: '', url: '', date: '' };
      else if (/\.labs$/.test(arrPath)) item = { name: '', value: '', unit: '', ref: '', flag: '' };
      arr.push(item);
    }
    this.persist(); this.render();
  };

  function itemBar(arrPath, i, n) {
    return '<span class="bd-ibar"><button data-op="up" data-arr="' + arrPath + '" data-i="' + i + '" title="Move up"' + (i === 0 ? ' disabled' : '') + '>↑</button><button data-op="down" data-arr="' + arrPath + '" data-i="' + i + '" title="Move down"' + (i === n - 1 ? ' disabled' : '') + '>↓</button><button data-op="dup" data-arr="' + arrPath + '" data-i="' + i + '" title="Duplicate">⧉</button><button data-op="del" data-arr="' + arrPath + '" data-i="' + i + '" title="Delete">🗑</button></span>';
  }

  function effectsFields(base, fx) {
    fx = fx || {};
    return '<fieldset class="bd-fs"><legend>Effects</legend><div class="bd-grid">' +
      fld('Set flags', base + '.flags', fx.flags, 'csv', { help: 'comma separated, e.g. iv, monitor' }) +
      fld('Remove flags', base + '.unflags', fx.unflags, 'csv') +
      fld('Patient state becomes', base + '.state', fx.state || '', 'select', { options: [['', '— no change —']].concat(Core.STATES) }) +
      '</div><div class="bd-grid vit">' + Core.VITAL_KEYS.map(function (k) { return fld(Core.VITAL_LABELS[k], base + '.vitals.' + k, fx.vitals && fx.vitals[k], 'num'); }).join('') + '</div><small>Leave a vital blank to keep it unchanged.</small></fieldset>';
  }

  /* ---------- sections ---------- */
  Builder.prototype.sec_basics = function (f, c) {
    f.innerHTML = '<div class="bd-live"></div><h2>Basics</h2><div class="bd-grid">' +
      fld('Case title', 'title', c.title) + fld('Case id (used in links and saves)', 'id', c.id, 'text', { help: 'lowercase, no spaces. Changing it resets saved progress.' }) +
      fld('Category', 'category', c.category, 'text', { list: 'bd-cats' }) +
      fld('Difficulty', 'difficulty', c.difficulty, 'select', { options: ['Beginner', 'Intermediate', 'Advanced'] }) +
      fld('Estimated duration (min)', 'durationMin', c.durationMin, 'num') + fld('Maximum XP', 'maxXP', c.maxXP, 'num') +
      fld('In-game time limit (min)', 'setting.timeLimitMin', c.setting && c.setting.timeLimitMin, 'num', { help: 'Simulated minutes. When reached, the case ends.' }) +
      '</div>' + fld('Tagline', 'tagline', c.tagline) + fld('Learning objectives (one per line)', 'objectives', c.objectives, 'lines', { rows: 4 }) +
      '<h2>Review &amp; schedule</h2><div class="bd-grid">' +
      fld('Status', 'status', c.status, 'select', { options: Core.STATUSES.map(function (s) { return [s, Core.STATUS_LABELS[s]]; }) }) +
      fld('Faculty reviewer (name)', 'review.facultyReviewer', c.review && c.review.facultyReviewer, 'text', { help: 'Required before a case can be Scheduled or Published.' }) +
      fld('Last reviewed', 'review.lastReviewed', c.review && c.review.lastReviewed, 'date') +
      fld('Publish at', 'schedule.publishAt', c.schedule && c.schedule.publishAt, 'datetime-local', { help: 'Members see the case from this moment.' }) +
      fld('Competition closes', 'schedule.closeAt', c.schedule && c.schedule.closeAt, 'datetime-local', { help: 'After this it moves to the archive (practice only).' }) +
      '</div>' + fld('AI-assisted / AI-reviewed draft', 'review.aiReviewed', c.review && c.review.aiReviewed, 'bool') +
      fld('Review notes', 'review.notes', c.review && c.review.notes, 'textarea') +
      '<datalist id="bd-cats"><option>Cardiovascular</option><option>Respiratory</option><option>Trauma</option><option>Neurology</option><option>Toxicology</option><option>Paediatrics</option><option>Obstetrics &amp; Gynaecology</option><option>Endocrine &amp; Metabolic</option><option>Infection &amp; Sepsis</option><option>Gastrointestinal &amp; Surgical</option><option>Renal</option><option>Psychiatry</option><option>Environmental</option></datalist>';
    this.refreshStatus(c);
  };

  Builder.prototype.sec_patient = function (f, c) {
    var p = c.patient || {}, i = c.initial || {}, st = c.stateText || {};
    f.innerHTML = '<div class="bd-live"></div><h2>Patient</h2><div class="bd-grid">' +
      fld('Name shown in game', 'patient.name', p.name) + fld('Age', 'patient.age', p.age, 'num') +
      fld('Sex', 'patient.sex', p.sex, 'select', { options: [['M', 'Male'], ['F', 'Female']] }) +
      fld('Sprite', 'patient.sprite', p.sprite, 'select', { options: [['adult_m', 'Adult man'], ['adult_f', 'Adult woman'], ['elder_m', 'Older man'], ['elder_f', 'Older woman'], ['child', 'Child']] }) +
      '</div><div class="bd-sprites"></div>' +
      fld('Chief complaint', 'patient.chiefComplaint', p.chiefComplaint) + fld('Background (shown on the case card)', 'patient.background', p.background, 'textarea', { rows: 2 }) +
      '<h2>Handover</h2>' + fld('Given by', 'handover.by', c.handover && c.handover.by, 'select', { options: [['paramedic', 'Paramedic'], ['nurse', 'Triage nurse']] }) +
      fld('Handover lines (one speech bubble per line — do not reveal the diagnosis)', 'handover.lines', c.handover && c.handover.lines, 'lines', { rows: 5 }) +
      '<h2>Starting condition</h2><div class="bd-grid vit">' + Core.VITAL_KEYS.map(function (k) { return fld(Core.VITAL_LABELS[k], 'initial.vitals.' + k, i.vitals && i.vitals[k], 'num'); }).join('') + '</div><div class="bd-grid">' +
      fld('Starting state', 'initial.state', i.state, 'select', { options: Core.STATES }) + fld('Starting flags', 'initial.flags', i.flags, 'csv') + '</div>' +
      fld('Patient is already on the monitor', 'initial.monitorAttached', i.monitorAttached, 'bool') +
      '<h2>What “Reassess” says in each state</h2>' + Core.STATES.map(function (s) { return fld(s, 'stateText.' + s, st[s]); }).join('');
    var box = f.querySelector('.bd-sprites');
    ['adult_m', 'adult_f', 'elder_m', 'elder_f', 'child'].forEach(function (k) { var cv = document.createElement('canvas'); cv.width = 48; cv.height = 48; cv.title = k; Art.drawPortrait(cv, 'patient', k); if (k === p.sprite) cv.className = 'on'; box.appendChild(cv); });
    this.refreshStatus(c);
  };

  Builder.prototype.sec_actions = function (f, c) {
    var self = this, acts = c.actions || [];
    var counts = {}; acts.forEach(function (a) { counts[a.category] = (counts[a.category] || 0) + 1; });
    var html = '<div class="bd-live"></div><h2>Actions <small>everything the player can do</small></h2>' +
      '<p class="bd-help">History questions and examinations happen at the patient. Treatments and procedures go through the nurse. Tests, diagnosis and the plan are done at the workstation. Each action costs simulated minutes.</p>' +
      '<div class="bd-filter"><button data-af="all" aria-selected="' + (this.actFilter === 'all') + '">All (' + acts.length + ')</button>' + Core.CATEGORIES.map(function (k) { return '<button data-af="' + k + '" aria-selected="' + (self.actFilter === k) + '">' + CAT_LABELS[k] + ' (' + (counts[k] || 0) + ')</button>'; }).join('') + '</div>' +
      '<div class="bd-addrow">Add: ' + Core.CATEGORIES.map(function (k) { return '<button class="px-btn xs" data-op="add" data-arr="actions" data-kind="' + k + '">＋ ' + CAT_LABELS[k] + '</button>'; }).join('') + '</div>';
    html += acts.map(function (a, i) {
      if (self.actFilter !== 'all' && a.category !== self.actFilter) return '';
      var b = 'actions.' + i, r = a.result || null;
      var res = '';
      if (a.category === 'investigation' || r) {
        var rt = r ? r.type : 'none';
        res = '<fieldset class="bd-fs"><legend>Result</legend><div class="bd-grid">' +
          fld('Result type', b + '.result.type', rt, 'select', { options: [['none', 'No result'], ['text', 'Text report'], ['labs', 'Lab table'], ['ecg', 'ECG (schematic)'], ['image', 'Image (licensed)']] }) +
          (r ? fld('Ready after (min)', b + '.result.delay', r.delay, 'num') : '') + '</div>';
        if (r) {
          res += fld(rt === 'ecg' || rt === 'image' ? 'Interpretation (hidden until the player asks)' : 'Report / comment', b + '.result.text', r.text, 'textarea');
          if (rt === 'labs') res += '<table class="bd-labs"><tr><th>Test</th><th>Value</th><th>Unit</th><th>Reference</th><th>Flag</th><th></th></tr>' + (r.labs || []).map(function (l, j) {
            var lb = b + '.result.labs.' + j;
            return '<tr>' + ['name', 'value', 'unit', 'ref'].map(function (k) { return '<td><input data-p="' + lb + '.' + k + '" data-t="text" value="' + esc(l[k] || '') + '"></td>'; }).join('') +
              '<td><select data-p="' + lb + '.flag" data-t="text">' + ['', 'H', 'L', 'C'].map(function (o) { return '<option' + (o === (l.flag || '') ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></td><td><button class="bd-x" data-op="del" data-arr="' + b + '.result.labs" data-i="' + j + '">✕</button></td></tr>';
          }).join('') + '</table><button class="bd-add" data-op="add" data-arr="' + b + '.result.labs">＋ add lab row</button>';
          if (rt === 'ecg') {
            var e = r.ecg || {}, layout = e.layout || 'standard12', leads = layout === 'right' ? ['V1R', 'V2R', 'V3R', 'V4R', 'V5R', 'V6R'] : ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
            res += '<div class="bd-grid">' + fld('Heart rate', b + '.result.ecg.rate', e.rate, 'num') + fld('Layout', b + '.result.ecg.layout', layout, 'select', { options: [['standard12', 'Standard 12-lead'], ['right', 'Right-sided leads']] }).replace('data-p=', 'data-rerender data-p=') + '</div>' +
              '<p class="bd-help">ST shift per lead in mm (+ elevation, − depression). Leave blank for an isoelectric ST segment. This draws a clearly labelled <b>schematic</b>, not a real tracing.</p><div class="bd-grid vit">' +
              leads.map(function (L) { return fld(L, b + '.result.ecg.st.' + L, e.st && e.st[L], 'num'); }).join('') + '</div><div class="bd-ecgprev"><canvas></canvas></div>';
          }
          if (rt === 'image') {
            var im = r.image || {};
            res += '<p class="bd-help">Use only images you are licensed to reuse (e.g. Wikimedia Commons, PMC Open Access) and record the source. Never use identifiable patient images.</p><div class="bd-grid">' +
              fld('Image URL', b + '.result.image.url', im.url) + fld('Alt text', b + '.result.image.alt', im.alt) + fld('Credit / source', b + '.result.image.credit', im.credit) + fld('License', b + '.result.image.license', im.license, 'text', { help: 'e.g. CC BY-SA 4.0' }) + '</div>';
          }
        }
        res += '</fieldset>';
      }
      var open = self.openCard === i ? ' open' : '';
      return '<details class="bd-card"' + open + ' data-card="' + i + '"><summary><span class="cat cat-' + a.category + '">' + esc(CAT_LABELS[a.category] || a.category) + '</span> <b>' + esc(a.label) + '</b> <code>' + esc(a.id) + '</code>' + itemBar('actions', i, acts.length) + '</summary><div class="bd-grid">' +
        fld('Label (what the player clicks)', b + '.label', a.label, 'text', { cls: 'wide' }) + fld('Id', b + '.id', a.id) +
        fld('Category', b + '.category', a.category, 'select', { options: Core.CATEGORIES.map(function (k) { return [k, CAT_LABELS[k]]; }) }) +
        fld('Takes (min)', b + '.time', a.time, 'num') +
        fld('Exclusive group', b + '.group', a.group, 'text', { help: 'Same group = only one can be chosen (e.g. dx).' }) +
        fld('Speaker (optional)', b + '.speaker', a.speaker) + '</div>' +
        fld(a.category === 'history' ? 'Patient’s answer' : 'What happens / finding', b + '.response', a.response, 'textarea') +
        '<div class="bd-grid">' + fld('Can be repeated', b + '.repeatable', a.repeatable, 'bool') + fld('Ends the case', b + '.endCase', a.endCase, 'bool') + '</div>' +
        self.condEditor(c, b + '.requires', a.requires, 'Available only if…') + fld('Message when not available', b + '.requiresText', a.requiresText) +
        res + effectsFields(b + '.effects', a.effects) + '</details>';
    }).join('');
    html += '<datalist id="bd-flags">' + allFlags(c).map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('') + '</datalist>';
    f.innerHTML = html;
    Array.prototype.forEach.call(f.querySelectorAll('[data-af]'), function (b) { b.onclick = function () { self.actFilter = b.getAttribute('data-af'); self.render(); }; });
    Array.prototype.forEach.call(f.querySelectorAll('.bd-card'), function (d) { d.addEventListener('toggle', function () { if (d.open) self.openCard = Number(d.getAttribute('data-card')); }); });
    /* live ECG previews */
    Array.prototype.forEach.call(f.querySelectorAll('.bd-card'), function (d) {
      var cv = d.querySelector('.bd-ecgprev canvas'); if (!cv) return;
      var i = Number(d.getAttribute('data-card'));
      var draw = function () { var r = c.actions[i] && c.actions[i].result; if (r && r.ecg) root.PXEcg.drawSheet(cv, r.ecg); };
      draw(); d.addEventListener('input', function () { clearTimeout(cv._t); cv._t = setTimeout(draw, 200); });
    });
    this.refreshStatus(c);
  };

  function allFlags(c) {
    var s = { monitor: 1, timeout: 1 };
    (c.initial && c.initial.flags || []).forEach(function (f) { s[f] = 1; });
    (c.actions || []).concat(c.events || []).forEach(function (a) { (a.effects && a.effects.flags || []).forEach(function (f) { s[f] = 1; }); });
    return Object.keys(s);
  }

  Builder.prototype.sec_events = function (f, c) {
    var self = this, evs = c.events || [];
    f.innerHTML = '<div class="bd-live"></div><h2>Events <small>what happens on its own</small></h2>' +
      '<p class="bd-help">Events make the patient respond: deterioration after a harmful drug, improvement after the right treatment, staff arriving, nudges. Each event fires <b>once</b>, when its condition first becomes true (optionally after a delay in simulated minutes). Every change must have a clinically defensible reason.</p>' +
      evs.map(function (e, i) {
        var b = 'events.' + i;
        return '<details class="bd-card"' + (self.openEv === i ? ' open' : '') + '><summary><b>' + esc(e.message ? e.message.slice(0, 70) : e.id) + '</b> <code>' + esc(e.id) + '</code>' + itemBar('events', i, evs.length) + '</summary>' +
          '<div class="bd-grid">' + fld('Id', b + '.id', e.id) + fld('Delay (min)', b + '.delay', e.delay, 'num') + fld('Speaker', b + '.speaker', e.speaker, 'text', { list: 'bd-speakers' }) + '</div>' +
          self.condEditor(c, b + '.when', e.when, 'Fires when…') + fld('Message', b + '.message', e.message, 'textarea') + effectsFields(b + '.effects', e.effects) +
          fld('This event ends the case', b + '.effects.endCase', e.effects && e.effects.endCase, 'bool') + '</details>';
      }).join('') + '<button class="px-btn sm" data-op="add" data-arr="events">＋ Add event</button>' +
      '<datalist id="bd-speakers"><option>Nurse</option><option>Senior</option><option>Patient</option><option>Paramedic</option><option>Cath lab nurse</option></datalist>' +
      '<datalist id="bd-flags">' + allFlags(c).map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('') + '</datalist>';
    Array.prototype.forEach.call(f.querySelectorAll('.bd-card'), function (d, i) { d.addEventListener('toggle', function () { if (d.open) self.openEv = i; }); });
    this.refreshStatus(c);
  };

  Builder.prototype.sec_endings = function (f, c) {
    var self = this, en = c.endings || [];
    f.innerHTML = '<div class="bd-live"></div><h2>Endings</h2><p class="bd-help">When the case ends, the <b>first</b> ending whose condition is true is shown. Keep the last ending without a condition as the fallback.</p>' +
      en.map(function (e, i) {
        var b = 'endings.' + i;
        return '<details class="bd-card" open><summary><span class="cat o-' + esc(e.outcome) + '">' + esc(e.outcome) + '</span> <b>' + esc(e.title) + '</b> <code>' + esc(e.id) + '</code>' + itemBar('endings', i, en.length) + '</summary><div class="bd-grid">' +
          fld('Title', b + '.title', e.title, 'text', { cls: 'wide' }) + fld('Id', b + '.id', e.id) + fld('Outcome', b + '.outcome', e.outcome, 'select', { options: ['good', 'fair', 'poor'] }) + '</div>' +
          fld('What happened to the patient', b + '.text', e.text, 'textarea') + self.condEditor(c, b + '.when', e.when, i === en.length - 1 ? 'Shown when… (fallback: leave as Always)' : 'Shown when…') + '</details>';
      }).join('') + '<button class="px-btn sm" data-op="add" data-arr="endings">＋ Add ending</button>';
    this.refreshStatus(c);
  };

  Builder.prototype.sec_scoring = function (f, c) {
    var self = this, sc = c.scoring || (c.scoring = { weights: Core.clone(Core.DEFAULT_WEIGHTS), rubric: [] });
    var w = sc.weights || (sc.weights = Core.clone(Core.DEFAULT_WEIGHTS)), sum = 0; Core.DOMAINS.forEach(function (d) { sum += Number(w[d]) || 0; });
    var rub = sc.rubric || (sc.rubric = []);
    var html = '<div class="bd-live"></div><h2>Scoring weights <small class="' + (sum === 100 ? 'ok' : 'err') + '">total ' + sum + ' / 100</small></h2><div class="bd-grid">' +
      Core.DOMAINS.map(function (d) { return fld(Core.DOMAIN_LABELS[d], 'scoring.weights.' + d, w[d], 'num'); }).join('') + '</div>' +
      '<h2>Rubric</h2><p class="bd-help">Positive points reward good decisions. Negative points are penalties. Each domain\'s score = points earned ÷ points available, then weighted. Use <b>Not counted in max</b> for partial credit, and <b>Only applies if</b> for items that only make sense on some paths. Safety outweighs speed.</p>';
    Core.DOMAINS.forEach(function (d) {
      var items = rub.map(function (r, i) { return { r: r, i: i }; }).filter(function (x) { return x.r.domain === d; });
      html += '<h3>' + Core.DOMAIN_LABELS[d] + ' <button class="px-btn xs" data-op="add" data-arr="scoring.rubric" data-kind="' + d + '">＋ item</button></h3>';
      html += items.map(function (x) {
        var r = x.r, b = 'scoring.rubric.' + x.i;
        return '<details class="bd-card"' + (self.openRb === x.i ? ' open' : '') + ' data-rb="' + x.i + '"><summary><span class="pts ' + (r.points < 0 ? 'neg' : '') + '">' + (r.points > 0 ? '+' : '') + r.points + '</span> <b>' + esc(r.good || r.missed || r.id) + '</b> <code>' + esc(r.id) + '</code>' + itemBar('scoring.rubric', x.i, rub.length) + '</summary><div class="bd-grid">' +
          fld('Id', b + '.id', r.id) + fld('Domain', b + '.domain', r.domain, 'select', { options: Core.DOMAINS.map(function (k) { return [k, Core.DOMAIN_LABELS[k]]; }) }) + fld('Points', b + '.points', r.points, 'num') + '</div>' +
          fld('Not counted in max (partial credit)', b + '.countInMax', r.countInMax === false, 'bool').replace('data-t="bool"', 'data-t="bool" data-invert') +
          self.condEditor(c, b + '.when', r.when, 'Earned when…') + self.condEditor(c, b + '.appliesIf', r.appliesIf, 'Only applies if… (optional)') +
          fld('Feedback when achieved', b + '.good', r.good, 'textarea', { rows: 2 }) + fld(r.points < 0 ? 'Feedback when this penalty applies' : 'Feedback when missed', b + '.missed', r.missed, 'textarea', { rows: 2 }) + '</details>';
      }).join('') || '<p class="muted">No items.</p>';
    });
    f.innerHTML = html;
    Array.prototype.forEach.call(f.querySelectorAll('[data-rb]'), function (d) { d.addEventListener('toggle', function () { if (d.open) self.openRb = Number(d.getAttribute('data-rb')); }); });
    Array.prototype.forEach.call(f.querySelectorAll('[data-invert]'), function (inp) {
      inp.removeAttribute('data-p');
      inp.addEventListener('change', function () { var i = Number(inp.closest('[data-rb]').getAttribute('data-rb')); if (inp.checked) rub[i].countInMax = false; else delete rub[i].countInMax; self.persist(); });
    });
    Array.prototype.forEach.call(f.querySelectorAll('input[data-p^="scoring.weights"]'), function (inp) { inp.addEventListener('change', function () { self.render(); }); });
    this.refreshStatus(c);
  };

  Builder.prototype.sec_teaching = function (f, c) {
    var t = c.teaching || {}, refs = c.references || [];
    f.innerHTML = '<div class="bd-live"></div><h2>Teaching</h2>' +
      fld('Key learning points (one per line)', 'teaching.keyPoints', t.keyPoints, 'lines', { rows: 6 }) +
      fld('Clinical pearls (one per line)', 'teaching.pearls', t.pearls, 'lines', { rows: 3 }) +
      '<h2>References</h2><p class="bd-help">List only sources you actually consulted. Do not invent page numbers or quotations. Include the date of the guideline.</p>' +
      refs.map(function (r, i) { var b = 'references.' + i; return '<div class="bd-card flat">' + itemBar('references', i, refs.length) + '<div class="bd-grid">' + fld('Reference', b + '.text', r.text, 'text', { cls: 'wide' }) + fld('URL / DOI', b + '.url', r.url) + fld('Year / date', b + '.date', r.date) + '</div></div>'; }).join('') +
      '<button class="px-btn sm" data-op="add" data-arr="references">＋ Add reference</button>';
    this.refreshStatus(c);
  };

  Builder.prototype.sec_publish = function (f, c) {
    var self = this, v = Core.validateCase(c);
    var vis = Core.caseVisibility(c, new Date(), { preview: this.config.showUnreviewed });
    f.innerHTML = '<h2>Check</h2>' +
      (v.errors.length ? '<div class="bd-box err"><b>' + v.errors.length + ' error(s) — fix these before exporting:</b><ul>' + v.errors.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul></div>' : '<div class="bd-box ok"><b>✓ No errors.</b></div>') +
      (v.warnings.length ? '<div class="bd-box warn"><b>Warnings:</b><ul>' + v.warnings.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul></div>' : '') +
      '<p><button class="px-btn" data-b="play">▶ Play this case (preview)</button></p>' +
      '<h2>Review workflow</h2><ol class="bd-flow">' + Core.STATUSES.map(function (s) { return '<li class="' + (s === c.status ? 'on' : '') + '">' + Core.STATUS_LABELS[s] + '</li>'; }).join('') + '</ol>' +
      '<p class="bd-help">AI review is never faculty approval. Only set <b>Faculty approved</b> once a named faculty member has played the case and checked the findings, results, decision logic, patient responses, scoring and feedback. Change the status in <b>Basics</b>.</p>' +
      '<p>Right now members would see this case as: <b>' + (vis.visible ? ({ live: 'This week’s case (live)', archive: 'Archive — practice', preview: 'Preview (marked “not yet approved by faculty”)' })[vis.mode] : 'Hidden (' + vis.mode + ')') + '</b></p>' +
      '<h2>Publish to members</h2><ol class="bd-steps"><li>Choose which cases go into the game file.</li><li>Click <b>Download game file</b>. You get an <code>index.html</code> with the game and these cases inside.</li><li>Upload it to the PIXEL ER site on Netlify (drag and drop on the Deploys page). Members see the update immediately.</li></ol>' +
      '<div class="bd-pick">' + this.cases.map(function (x) { var vv = Core.validateCase(x); return '<label class="bd-chk"><input type="checkbox" data-pick="' + esc(x.id) + '"' + (x.status === 'draft' && x.id !== c.id && self.embeddedIds.indexOf(x.id) === -1 ? '' : ' checked') + (vv.errors.length ? ' disabled' : '') + '> ' + esc(x.title) + ' <span class="st st-' + esc(x.status) + '">' + esc(Core.STATUS_LABELS[x.status]) + '</span>' + (vv.errors.length ? ' <span class="err">has errors</span>' : '') + '</label>'; }).join('') + '</div>' +
      '<label class="bd-chk"><input type="checkbox" data-cfg="showUnreviewed"' + (this.config.showUnreviewed ? ' checked' : '') + '> Let members play cases that are not yet faculty-approved (they are clearly marked as such)</label>' +
      '<p class="bd-actions"><button class="px-btn" data-x="game">⬇ Download game file (index.html)</button> <button class="px-btn ghost" data-x="json">⬇ Download this case (.json)</button> <button class="px-btn ghost" data-x="all">⬇ Download all cases (.json backup)</button></p>' +
      '<p class="bd-help">Keep the downloaded .json files as backups. You can re-import them at any time with <b>⇪ Import .json</b>.</p>';
    f.querySelector('[data-cfg]').onchange = function (e) { self.config.showUnreviewed = e.target.checked; };
    f.querySelector('[data-x="json"]').onclick = function () { if (v.errors.length && !root.confirm('This case has errors. Download anyway?')) return; download(c.id + '.json', JSON.stringify(c, null, 2), 'application/json'); };
    f.querySelector('[data-x="all"]').onclick = function () { download('pixel-er-cases-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(self.cases, null, 2), 'application/json'); };
    f.querySelector('[data-x="game"]').onclick = function () {
      var ids = Array.prototype.filter.call(f.querySelectorAll('[data-pick]'), function (x) { return x.checked && !x.disabled; }).map(function (x) { return x.getAttribute('data-pick'); });
      var chosen = self.cases.filter(function (x) { return ids.indexOf(x.id) !== -1; });
      if (!chosen.length) { root.alert('Choose at least one case.'); return; }
      self.exportGame(chosen);
    };
  };

  Builder.prototype.sec_json = function (f, c) {
    var self = this;
    f.innerHTML = '<h2>Raw JSON <small>advanced</small></h2><p class="bd-help">Everything the forms edit, in one place. You can paste a case generated elsewhere (for example, drafted with AI from a case write-up) and click Apply. It is validated before you can export it.</p>' +
      '<textarea class="bd-json" rows="28" spellcheck="false">' + esc(JSON.stringify(c, null, 2)) + '</textarea><p><button class="px-btn" data-j>Apply JSON</button> <span class="bd-jmsg"></span></p>';
    f.querySelector('[data-j]').onclick = function () {
      try {
        var nc = JSON.parse(f.querySelector('.bd-json').value);
        if (!nc.id) throw new Error('missing "id"');
        var i = self.cases.indexOf(c); self.cases[i] = nc; self.sel = nc.id; self.persist(); self.render();
      } catch (e) { f.querySelector('.bd-jmsg').textContent = 'Invalid JSON: ' + e.message; }
    };
  };

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* Build a new index.html: the same game, with the chosen cases embedded. */
  Builder.prototype.exportGame = function (cases) {
    var self = this;
    function put(html) {
      var data = JSON.stringify(cases).replace(/</g, '\\u003c');
      var cfg = JSON.stringify(self.config).replace(/</g, '\\u003c');
      var out = html.replace(/(<script type="application\/json" id="px-cases">)[\s\S]*?(<\/script>)/, function (m, a, b) { return a + data + b; })
                    .replace(/(<script type="application\/json" id="px-config">)[\s\S]*?(<\/script>)/, function (m, a, b) { return a + cfg + b; });
      if (out === html) { root.alert('Could not find the case data block in the page.'); return; }
      download('index.html', out, 'text/html');
    }
    var pristine = root.PX_PRISTINE;
    if (location.protocol.indexOf('http') === 0) {
      fetch(location.href.split('#')[0], { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(put, function () { put(pristine); });
    } else put(pristine);
  };

  root.PXBuilder = { Builder: Builder, blankCase: blankCase };
})(window);
