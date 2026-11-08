/* =====================================================================
   PIXEL ER — Online layer (club accounts, cases from the database,
   score submission, leaderboard, results). Uses the club's Supabase
   project with the public key only. Without a connection, the game
   still works fully in practice mode.
   ===================================================================== */
(function (root) {
  'use strict';
  var PENDING_KEY = 'pxer.pending';

  function store(k, v) { try { if (v === undefined) { var x = localStorage.getItem(k); return x ? JSON.parse(x) : null; } if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  var Online = {
    cfg: null, sb: null, session: null, me: null,
    status: 'offline',      /* offline | signed-out | signed-in | not-member */
    setupMissing: false,    /* signed in, but the PIXEL ER tables/functions are not installed yet */
    cases: null,            /* rows from pixel_cases (null = not loaded / unavailable) */
    mine: {},               /* caseId → { official: attempt|null, count } */
    listeners: [],

    onChange: function (fn) { this.listeners.push(fn); },
    emit: function () { var self = this; this.listeners.forEach(function (fn) { try { fn(self); } catch (e) { console.error(e); } }); },

    /* Load supabase-js (same library and major version as the club platform). Never blocks the game. */
    loadLib: function () {
      if (root.supabase && root.supabase.createClient) return Promise.resolve(true);
      return new Promise(function (resolve) {
        var s = document.createElement('script'), done = false;
        function fin(ok) { if (!done) { done = true; resolve(ok && !!(root.supabase && root.supabase.createClient)); } }
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
        s.onload = function () { fin(true); }; s.onerror = function () { fin(false); };
        setTimeout(function () { fin(false); }, 8000);
        document.head.appendChild(s);
      });
    },

    init: function (cfg) {
      var self = this; this.cfg = cfg || {};
      if (!this.cfg.supabaseUrl || !this.cfg.supabaseKey) { this.status = 'offline'; return Promise.resolve(this); }
      return this.loadLib().then(function (ok) { if (!ok) { self.status = 'offline'; return self; } return self.connect(); });
    },

    connect: function () {
      var self = this;
      try {
        this.sb = root.supabase.createClient(this.cfg.supabaseUrl, this.cfg.supabaseKey, {
          auth: { detectSessionInUrl: true, persistSession: true }   /* default storage key = the club platform's, so a platform sign-in carries over */
        });
      } catch (e) { this.status = 'offline'; return Promise.resolve(this); }
      return this.sb.auth.getSession().then(function (r) {
        self.session = r && r.data ? r.data.session : null;
        if (root.history && root.history.replaceState && /access_token|error_description/.test(location.hash)) root.history.replaceState(null, '', location.pathname + location.search);
        return self.refresh();
      }).then(function () {
        self.sb.auth.onAuthStateChange(function (evt, session) {
          if (evt === 'SIGNED_IN' || evt === 'SIGNED_OUT') {
            var was = !!self.session; self.session = session || null;
            if (was !== !!self.session) self.refresh().then(function () { self.emit(); });
          }
        });
        return self;
      }, function () { self.status = 'offline'; return self; });
    },

    refresh: function () {
      var self = this;
      this.me = null; this.cases = null; this.mine = {}; this.setupMissing = false;
      if (!this.session) { this.status = 'signed-out'; return Promise.resolve(); }
      return this.sb.rpc('pixel_whoami').then(function (r) {
        if (r.error) { self.setupMissing = /pixel_whoami|function|schema cache/i.test(r.error.message || ''); self.status = 'signed-in'; return; }
        var row = Array.isArray(r.data) ? r.data[0] : r.data;
        self.me = row || null;
        self.status = row && (row.member_id || row.is_supervisor) ? 'signed-in' : 'not-member';
        if (self.status !== 'signed-in') return;
        return self.loadCases().then(function () { return self.loadMine(); }).then(function () { return self.flushPending(); });
      }, function () { self.status = 'signed-in'; self.setupMissing = true; });
    },

    email: function () { return this.session && this.session.user ? this.session.user.email : ''; },
    canManage: function () { return !!(this.me && (this.me.is_admin || this.me.is_supervisor)); },   /* see results */
    canPublish: function () { return !!(this.me && this.me.is_admin); },                               /* approve + publish: president / vice */
    isSupervisor: function () { return !!(this.me && this.me.is_supervisor); },
    displayName: function () { return this.me ? (this.me.supervisor_name || this.me.full_name || '') : ''; },

    signIn: function (email) {
      if (!this.sb) return Promise.resolve({ error: { message: 'No connection to the club server.' } });
      return this.sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.href.split('#')[0] } });
    },
    signOut: function () { var self = this; return this.sb ? this.sb.auth.signOut().then(function () { self.session = null; return self.refresh(); }).then(function () { self.emit(); }) : Promise.resolve(); },

    /* Cases from the database, shaped like local cases (schedule taken from the DB columns). */
    loadCases: function () {
      var self = this;
      return this.sb.from('pixel_cases').select('id,status,publish_at,close_at,data,updated_at').then(function (r) {
        if (r.error) { self.setupMissing = true; self.cases = null; return; }
        self.cases = (r.data || []).map(function (row) {
          var c = JSON.parse(JSON.stringify(row.data));
          c.status = row.status;
          c.schedule = { publishAt: row.publish_at || '', closeAt: row.close_at || '' };
          c._db = { publish_at: row.publish_at, close_at: row.close_at, updated_at: row.updated_at };
          return c;
        });
      });
    },
    loadMine: function () {
      var self = this;
      return this.sb.from('pixel_attempts').select('case_id,official,score,xp,sim_minutes,created_at').eq('member_id', this.me && this.me.member_id || '00000000-0000-0000-0000-000000000000').then(function (r) {
        self.mine = {};
        (r.data || []).forEach(function (a) {
          var m = self.mine[a.case_id] || (self.mine[a.case_id] = { official: null, count: 0, best: 0 });
          m.count++; m.best = Math.max(m.best, a.score);
          if (a.official) m.official = a;
        });
      });
    },

    /* Send a finished attempt. The server recomputes the score. */
    submit: function (caseId, history) {
      var self = this;
      if (!this.sb || !this.session) return Promise.resolve({ error: 'not_signed_in' });
      return this.sb.functions.invoke(this.cfg.submitFunction || 'pixel-er-submit', { body: { caseId: caseId, history: history } }).then(function (r) {
        if (r.error) {
          var ctx = r.error.context;
          var p = ctx && typeof ctx.json === 'function' ? ctx.json().catch(function () { return null; }) : Promise.resolve(null);
          return p.then(function (body) {
            var code = (body && body.error) || 'network';
            if (code === 'network' || code === 'server_error' || code === 'save_failed') self.queuePending(caseId, history);
            return { error: code, detail: body && body.detail };
          });
        }
        return self.loadMine().then(function () { return r.data; });
      }, function () { self.queuePending(caseId, history); return { error: 'network' }; });
    },
    queuePending: function (caseId, history) {
      var list = store(PENDING_KEY) || [];
      if (!list.some(function (p) { return p.caseId === caseId && JSON.stringify(p.history) === JSON.stringify(history); })) list.push({ caseId: caseId, history: history, at: Date.now() });
      store(PENDING_KEY, list.slice(-10));
    },
    flushPending: function () {
      var self = this, list = store(PENDING_KEY) || [];
      if (!list.length) return Promise.resolve();
      store(PENDING_KEY, null);
      return list.reduce(function (p, item) { return p.then(function () { return self.submit(item.caseId, item.history); }); }, Promise.resolve());
    },

    rpc: function (fn, args) {
      if (!this.sb) return Promise.resolve([]);
      return this.sb.rpc(fn, args || {}).then(function (r) { if (r.error) throw r.error; return r.data || []; });
    },
    leaderboard: function (caseId) { return this.rpc('pixel_leaderboard', { p_case: caseId }); },
    overall: function () { return this.rpc('pixel_leaderboard_overall'); },
    participation: function (caseId) { return this.rpc('pixel_participation', { p_case: caseId || null }); },
    results: function (caseId) { return this.rpc('pixel_results', { p_case: caseId }); },

    /* Case Builder → database. Schedule strings (local time) are sent as exact instants. */
    saveCase: function (c) {
      function iso(v) { if (!v) return null; var d = new Date(v); return isNaN(d) ? null : d.toISOString(); }
      var clean = JSON.parse(JSON.stringify(c)); delete clean._db;
      return this.sb.from('pixel_cases').upsert({
        id: clean.id, data: clean, title: clean.title || '', status: clean.status || 'draft',
        publish_at: iso(clean.schedule && clean.schedule.publishAt), close_at: iso(clean.schedule && clean.schedule.closeAt)
      }).select('id,status,data').single().then(function (r) {
        if (r.error) throw r.error;
        return r.data;
      });
    },
    loadAllCasesForBuilder: function () {
      return this.sb.from('pixel_cases').select('id,data').then(function (r) { if (r.error) throw r.error; return (r.data || []).map(function (x) { return x.data; }); });
    }
  };

  root.PXOnline = Online;
})(window);
