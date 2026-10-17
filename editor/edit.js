/* Ecosophy — live content editor.
 *
 * Two jobs, one file:
 *
 *   1. ALWAYS: fetch the saved overrides for this route and paint them over the
 *      rendered page. The site is client-rendered by support.js, which re-parses
 *      the page source and re-renders — so a MutationObserver re-applies after
 *      every render pass rather than editing the DOM once and hoping.
 *
 *   2. IN EDIT MODE (?edit=1, or Ctrl+Shift+E): let a signed-in editor click any
 *      line of text to retype it and any picture to replace it. "Save" keeps the
 *      work as a server-side draft only edit mode sees; "Save & make live"
 *      publishes it to /api/content (Cloudflare KV) for everyone on their next
 *      page view. Undo/Redo step through this page's edits; "View live page"
 *      opens the page as a visitor sees it.
 *
 * A picture in an <image-slot id> is keyed by that id ("#dd-Massage & Body
 * Wellness-13"), which names the treatment it shows. Everything else is keyed by
 * DOM path (tag + sibling index, from <body>), with the original text/src stored
 * alongside so an edit only lands on an element that still shows it.
 */
(function () {
  'use strict';

  var API_CONTENT = '/api/content';
  var API_UPLOAD = '/api/upload';
  var API_SESSION = '/api/session';
  var LS_LOCAL = 'eco:overrides:local';
  var SS_KEY = 'eco:editkey';
  var SS_MODE = 'eco:editmode';
  var MAX_DIM = 2200;

  var state = {
    doc: { pages: {} },
    // Routes this browser has actually changed. Save sends only these, so a tab
    // holding a stale copy of the doc can never wipe a page someone edited
    // elsewhere in the meantime. Edit mode survives navigation, so this can hold
    // several routes at once — that multi-page "fix the whole site, save once"
    // flow still works, it just no longer carries the untouched pages with it.
    touched: {},
    placed: {},   // edit key -> the element it was last painted on
    orphans: [],  // edit keys whose element is not on the page right now
    superseded: [], // older edits whose element a newer edit holds
    exact: {},    // edit keys placed at their own position, not by their original
    uploads: [],  // picture uploads still in flight; saving waits for them
    draftsIn: null, // resolves once the server's drafts are layered in
    drafts: {},   // routes saved as a draft on the server but not yet live
    live: {},     // the live doc's pages, to tell a draft from what is published
    undo: [],     // snapshots of this page's edits, newest last
    redo: [],
    remote: false,
    edit: false,
    dirty: 0,
    editingEl: null,
    applying: false,
    ready: false
  };

  function touch(route) { state.touched[route || ROUTE] = 1; }
  function touchedRoutes() {
    var out = [];
    for (var r in state.touched) if (Object.prototype.hasOwnProperty.call(state.touched, r)) out.push(r);
    return out;
  }

  // ── route key ───────────────────────────────────────────────────────────
  // service.html?s=<slug> renders a different treatment per slug, so the slug is
  // part of the identity of the page being edited.
  function routeKey() {
    var p = location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
    if (p.length > 1) p = p.replace(/\/+$/, '');
    if (!p) p = '/';
    var s = null;
    try { s = new URLSearchParams(location.search).get('s'); } catch (e) {}
    return s ? p + '?s=' + s : p;
  }
  var ROUTE = routeKey();

  function pageMap(create) {
    var pages = state.doc.pages || (state.doc.pages = {});
    if (!pages[ROUTE] && create) pages[ROUTE] = {};
    return pages[ROUTE] || {};
  }

  // ── DOM paths ───────────────────────────────────────────────────────────
  function pathOf(el) {
    var parts = [];
    var n = el;
    while (n && n !== document.body && n.parentElement) {
      var kids = n.parentElement.children;
      var idx = 0;
      for (var i = 0; i < kids.length; i++) { if (kids[i] === n) { idx = i; break; } }
      parts.unshift(n.tagName.toLowerCase() + idx);
      n = n.parentElement;
    }
    return parts.join('/');
  }

  // A part is tag + index with no separator, so "div12" and "h10" are ambiguous
  // to a regex ("div1" #2? "h" #10?). Try each split of the trailing digits and
  // keep the one whose tag is actually at that index.
  function childByPart(n, part) {
    var s = part.length;
    while (s > 1 && /\d/.test(part.charAt(s - 1))) s--;
    for (var cut = s; cut < part.length; cut++) {
      var el = n.children[+part.slice(cut)];
      if (el && el.tagName.toLowerCase() === part.slice(0, cut)) return el;
    }
    return null;
  }

  function elByPath(path) {
    var parts = path.split('/');
    var n = document.body;
    for (var i = 0; i < parts.length && n; i++) n = childByPart(n, parts[i]);
    return n && n !== document.body ? n : null;
  }

  // ── what can be edited ──────────────────────────────────────────────────
  var SKIP_TAGS = /^(SCRIPT|STYLE|SVG|PATH|CIRCLE|LINE|RECT|POLYGON|G|DEFS|LINEARGRADIENT|STOP|USE|BR|HR|INPUT|TEXTAREA|SELECT|OPTION|HEAD|META|LINK|TITLE|X-DC|HELMET)$/;

  function isUi(el) { return !!(el && el.closest && el.closest('[data-eco-ui]')); }

  function isTextLeaf(el) {
    if (!el || el.nodeType !== 1 || isUi(el)) return false;
    if (SKIP_TAGS.test(el.tagName)) return false;
    if (el.ownerSVGElement || el.tagName === 'svg') return false;
    if (el.childElementCount !== 0) return false;
    var t = (el.textContent || '').trim();
    return t.length > 0 && t.length < 4000;
  }

  function isImage(el) {
    if (!el || el.nodeType !== 1 || isUi(el)) return false;
    return el.tagName === 'IMG' || el.tagName === 'IMAGE-SLOT';
  }

  function imgSrc(el) { return el.getAttribute('src') || ''; }

  // ── identity ────────────────────────────────────────────────────────────
  // A position is not an identity. The home pages' drilldown is one grid that
  // shows whichever category is open, so card 13 is "Detox Slimming Body Wrap"
  // in one category and something else in the next — and the same photos recur
  // all over the page. Keyed by position, a picture edit had nowhere to go while
  // its category was closed, so it was painted on any picture that happened to
  // show the same photo (the hero fan) and stayed there. An <image-slot id> names
  // the item it shows, so a picture in one is keyed by that id instead.
  //
  // Painting a slot drops its id (see applyOne), so the id is kept in
  // data-eco-slot as well.
  function slotOf(el) {
    if (!el || el.tagName !== 'IMAGE-SLOT') return '';
    return el.id || el.getAttribute('data-eco-slot') || '';
  }
  function isSlotKey(k) { return k.charAt(0) === '#'; }
  function keyOf(el, t) {
    var s = t === 'img' ? slotOf(el) : '';
    return s ? '#' + s : pathOf(el);
  }
  // A ~n suffix files a second edit under a position another edit already holds.
  function baseOf(k) { return k.replace(/~\d+$/, ''); }
  function elBySlot(id) {
    var slots = document.getElementsByTagName('image-slot');
    for (var i = 0; i < slots.length; i++) if (slotOf(slots[i]) === id) return slots[i];
    return null;
  }

  // The page re-renders the same elements for whatever item is now in view. When
  // a slot we painted is handed a different id, it is showing another item: put
  // back the photo it had, in case the page left our picture in place because the
  // new item's photo is the same file the old one had.
  function syncSlots() {
    var slots = document.getElementsByTagName('image-slot');
    for (var i = 0; i < slots.length; i++) {
      var el = slots[i];
      if (!el.id || el.getAttribute('data-eco-slot') === el.id) continue;
      if (el._ecoPaint) {
        if (el.getAttribute('src') === el._ecoPaint.v) el.setAttribute('src', el._ecoPaint.o);
        el._ecoPaint = null;
      }
      el.setAttribute('data-eco-slot', el.id);
    }
  }

  // ── applying overrides ──────────────────────────────────────────────────
  // A path is only a position: when a page is rebuilt (a card removed, a menu
  // reordered) the same path names a different element, and painting the edit
  // there puts the client's words on the wrong thing. So a path-keyed edit lands
  // only on an element that still shows what it replaced (or what it set). Text
  // can follow its original to where it moved, among elements of the same shape;
  // a picture only when exactly one such element shows its original photo, since
  // the same photo is used in many places. Anything that cannot be placed is held
  // back and counted in the edit bar.
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function valueOf(el, t) { return t === 'text' ? norm(el.textContent) : imgSrc(el); }
  function want(entry, which) { return entry.t === 'text' ? norm(entry[which]) : String(entry[which] || ''); }
  function fits(el, entry, k) {
    if (!el || isUi(el)) return false;
    if (k && isSlotKey(k)) return el.tagName === 'IMAGE-SLOT' && slotOf(el) === k.slice(1);
    if (entry.t === 'text' ? el.childElementCount !== 0 : !isImage(el)) return false;
    var cur = valueOf(el, entry.t);
    return cur === want(entry, 'o') || cur === want(entry, 'v');
  }
  // A path with its sibling indexes dropped: the kind of place an element sits.
  function shape(path) { return path.replace(/\d+(\/|~|$)/g, '$1'); }

  // Shared leading path segments: among several elements showing the same
  // original, the one nearest the edit's old position is the one it was made on.
  function nearness(a, b) {
    var x = a.split('/'), y = b.split('/'), i = 0;
    while (i < x.length && i < y.length && x[i] === y[i]) i++;
    return i;
  }

  // key -> element for every edit on this page that can be placed. The rest are
  // listed in state.orphans; older edits that lost their element to a newer one
  // are listed in state.superseded.
  //
  // Newest first: an edit is (re)inserted at the end of its page's map when it
  // is made, so when two want one element the later one wins. Oldest-first let a
  // client's first attempt hide every correction made after it.
  function resolve(m) {
    var out = {}, claimed = [], left = [], gone = [], older = [], exact = {}, k, el, i;
    var keys = Object.keys(m).filter(function (x) { return m[x] && m[x].v != null; }).reverse();
    function take(key, node) { out[key] = node; claimed.push(node); }
    for (i = 0; i < keys.length; i++) {
      k = keys[i];
      // An element mid-typing shows neither the original nor the edit, but it is
      // still this edit's.
      el = state.placed[k];
      if (el && el === state.editingEl) { take(k, el); continue; }
      if (isSlotKey(k)) el = elBySlot(k.slice(1));
      else {
        el = elByPath(baseOf(k));
        // Text keeps the element it was last painted on if its path has shifted.
        if (!fits(el, m[k], k)) {
          el = m[k].t === 'text' ? state.placed[k] : null;
          if (!(el && el.isConnected && fits(el, m[k], k))) el = null;
        }
      }
      if (!el || !fits(el, m[k], k)) { left.push(k); continue; }
      if (claimed.indexOf(el) >= 0) older.push(k); else { take(k, el); exact[k] = 1; }
    }
    var all = null;
    for (i = 0; i < left.length; i++) {
      k = left[i];
      var e = m[k];
      if (isSlotKey(k)) { gone.push(k); continue; }
      all = all || document.body.querySelectorAll('*');
      var o = want(e, 'o'), s = shape(baseOf(k)), best = null, score = -1, seen = 0;
      for (var j = 0; j < all.length; j++) {
        el = all[j];
        if (e.t === 'text' ? !isTextLeaf(el) : !isImage(el)) continue;
        if (valueOf(el, e.t) !== o) continue;
        var p = pathOf(el);
        if (shape(p) !== s) continue;
        seen++;
        if (claimed.indexOf(el) >= 0) continue;
        var sc = nearness(k, p);
        if (sc > score) { best = el; score = sc; }
      }
      // A photo is reused across cards, so a picture follows it only when it is
      // the one place of its kind still showing that photo.
      if (best && (e.t === 'text' || seen === 1)) take(k, best); else gone.push(k);
    }
    state.orphans = gone;
    state.superseded = older;
    state.exact = exact;
    state.placed = out;
    return out;
  }

  // Older saves filed pictures by position, often several times over for one
  // card. Once such an edit sits on a slot at its own position, re-file it under
  // the slot's id, and drop the older attempts that lost that element to it.
  // Saved with the next save of this page. A picture placed by its photo alone is
  // a guess, and stays as it is.
  function tidy(m, at) {
    var k, moved = 0;
    for (k in at) {
      if (isSlotKey(k) || !state.exact[k] || m[k].t !== 'img' || at[k].tagName !== 'IMAGE-SLOT') continue;
      var s = slotOf(at[k]);
      if (!s) continue;
      var nk = '#' + s, e = m[k];
      delete m[k];
      delete m[nk];
      m[nk] = e;
      at[nk] = at[k];
      state.placed[nk] = at[k];
      delete at[k];
      delete state.placed[k];
      moved++;
    }
    for (var i = 0; i < state.superseded.length; i++) {
      k = state.superseded[i];
      if (m[k] && !isSlotKey(k)) { delete m[k]; moved++; }
    }
    state.superseded = [];
    return moved;
  }

  function applyOne(el, entry) {
    if (!el || el === state.editingEl) return;

    if (entry.t === 'text') {
      if (el.childElementCount === 0 && el.textContent !== entry.v) el.textContent = entry.v;
      return;
    }

    if (el.tagName === 'IMAGE-SLOT') {
      // A slot prefers its sidecar-stored image (keyed by id) over src=, and only
      // accepts data: URLs from that store — so drop the id and the slot falls
      // through to the src we set here. data-eco-slot keeps the id for us.
      if (el.id) { el.setAttribute('data-eco-slot', el.id); el.removeAttribute('id'); }
      el._ecoPaint = { o: entry.o, v: entry.v };
      if (el.getAttribute('src') !== entry.v) el.setAttribute('src', entry.v);
    } else {
      if (el.getAttribute('srcset')) el.removeAttribute('srcset');
      if (el.getAttribute('src') !== entry.v) el.setAttribute('src', entry.v);
    }
  }

  // Put an element back to what the design shows, the reverse of applyOne.
  function restore(el, entry) {
    if (entry.t === 'text') { el.textContent = entry.o; return; }
    el.setAttribute('src', entry.o);
    var s = el.getAttribute('data-eco-slot');
    if (el.tagName === 'IMAGE-SLOT' && s && !el.id) el.id = s;
    el._ecoPaint = null;
  }

  function applyAll() {
    if (state.applying) return;
    state.applying = true;
    try {
      syncSlots();
      var m = pageMap(false);
      var at = resolve(m);
      tidy(m, at);
      for (var k in at) applyOne(at[k], m[k]);
    } catch (e) {}
    state.applying = false;
    if (state.edit) { paintTargets(); refreshBar(); }
  }

  var pending = 0;
  function schedule() {
    if (pending) return;
    pending = setTimeout(function () { pending = 0; applyAll(); }, 60);
  }

  // ── storage ─────────────────────────────────────────────────────────────
  // Stored as { v:2, doc, touched } so unsaved work keeps its "which routes did I
  // change" list across a reload. A bare doc is the pre-v2 shape: treat every
  // route in it as touched, since that is what it meant.
  function loadLocal() {
    try {
      var raw = JSON.parse(localStorage.getItem(LS_LOCAL) || 'null');
      if (!raw || typeof raw !== 'object') return null;
      if (raw.v === 2 && raw.doc && raw.doc.pages) {
        return { doc: raw.doc, touched: raw.touched || {} };
      }
      if (raw.pages) {
        var t = {};
        for (var r in raw.pages) t[r] = 1;
        return { doc: raw, touched: t };
      }
      return null;
    } catch (e) { return null; }
  }
  function saveLocal() {
    try {
      localStorage.setItem(LS_LOCAL, JSON.stringify({ v: 2, doc: state.doc, touched: state.touched }));
    } catch (e) {}
  }
  function clearLocal() {
    try { localStorage.removeItem(LS_LOCAL); } catch (e) {}
  }

  // A copy of every page this browser saved as a draft and has not yet
  // published. The server's drafts sit in one KV record that each save reads and
  // rewrites, and KV can hand back a copy a few seconds old — so a save of one
  // page could drop another page saved just before it, and publishing then
  // skipped that page. This copy puts any such page back (see loadDrafts).
  var LS_MINE = 'eco:drafts:mine';
  function loadMine() {
    try { var x = JSON.parse(localStorage.getItem(LS_MINE) || '{}'); return x && typeof x === 'object' ? x : {}; }
    catch (e) { return {}; }
  }
  function saveMine(x) {
    try {
      if (Object.keys(x).length) localStorage.setItem(LS_MINE, JSON.stringify(x));
      else localStorage.removeItem(LS_MINE);
    } catch (e) {}
  }

  var loaded = fetch(API_CONTENT + '?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (j) { state.remote = true; return j; })
    .catch(function () {
      return fetch('/content.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : { pages: {} }; })
        .catch(function () { return { pages: {} }; });
    })
    .then(function (doc) {
      state.doc = doc && typeof doc === 'object' && doc.pages ? doc : { pages: {} };
      state.live = JSON.parse(JSON.stringify(state.doc.pages));
      // Unsaved work belongs to edit mode. Painted for everyone in this browser,
      // it made "View live page" show changes that were not live at all.
      // Only the pages changed here come back, each whole, as it was left: the
      // stored copy holds every page as this browser last saw it, and merging all
      // of it put stale edits back over newer ones — and brought back edits this
      // browser had already replaced or removed.
      var local = wantsEdit() ? loadLocal() : null;
      if (local) {
        for (var r in local.touched) {
          state.touched[r] = 1;
          // Touched but absent locally means it was reverted here and not yet
          // saved; the copy that just came back from the server must not undo it.
          if (local.doc.pages[r]) state.doc.pages[r] = local.doc.pages[r];
          else delete state.doc.pages[r];
        }
        state.dirty = 1;
      }
      state.ready = true;
      applyAll();
      // The bar is built before this resolves, so its count starts at zero and
      // reads "no changes" even on a page that has saved edits. Put that right.
      refreshBar();
      return state.doc;
    });

  // ── edit-mode entry ─────────────────────────────────────────────────────
  function wantsEdit() {
    try {
      if (/[?&]edit=1\b/.test(location.search)) return true;
      return sessionStorage.getItem(SS_MODE) === '1';
    } catch (e) { return false; }
  }
  function editKey() { try { return sessionStorage.getItem(SS_KEY) || ''; } catch (e) { return ''; } }

  function authHeaders(extra) {
    var h = extra || {};
    h['x-eco-key'] = editKey();
    return h;
  }

  // The sign-in lives in sessionStorage, so it lasts for this tab only. Getting it
  // wrong used to drop you on a normal-looking page with nothing said and no way
  // back in, which reads exactly like "edit mode switched itself off".
  function signIn(tries) {
    var k = editKey();
    if (k) return Promise.resolve(true);
    var left = tries == null ? 3 : tries;
    var pw = window.prompt('Ecosophy — editor password');
    if (!pw) {
      toast('Edit mode not started — press Ctrl+Shift+E to try the password again.', 6000);
      return Promise.resolve(false);
    }
    return fetch(API_SESSION, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-eco-key': pw }
    }).then(function (r) {
      if (r.ok) {
        try { sessionStorage.setItem(SS_KEY, pw); } catch (e) {}
        return true;
      }
      if (r.status === 503) {
        toast('The editor is not configured on this deployment yet.', 6000);
        return false;
      }
      if (left > 1) return signIn(left - 1);
      toast('Wrong password. Press Ctrl+Shift+E to try again.', 6000);
      return false;
    }).catch(function () {
      // No backend reachable (local preview): allow offline editing.
      try { sessionStorage.setItem(SS_KEY, pw); } catch (e) {}
      return true;
    });
  }

  // Drafts are layered over the live doc in edit mode only. A route with work
  // still unsaved in this browser keeps that work instead.
  function loadDrafts() {
    if (!state.remote) return Promise.resolve();
    return fetch(API_CONTENT + '?draft=1&t=' + Date.now(), { cache: 'no-store', headers: authHeaders() })
      .then(function (r) { return r.ok ? r.json() : { pages: {} }; })
      .catch(function () { return { pages: {} }; })
      .then(function (d) {
        var pages = (d && d.pages) || {};
        // A page this browser saved as a draft that the server no longer lists
        // as one: lost to a racing save, unless it went live in the meantime.
        var mine = loadMine();
        for (var mr in mine) {
          if (pages[mr]) continue;
          if (JSON.stringify(state.live[mr] || {}) === JSON.stringify(mine[mr] || {})) { delete mine[mr]; continue; }
          pages[mr] = mine[mr];
        }
        saveMine(mine);
        state.drafts = {};
        for (var r in pages) {
          if (!Object.prototype.hasOwnProperty.call(pages, r)) continue;
          state.drafts[r] = 1;
          if (state.touched[r]) continue;
          var next = Object.keys(pages[r]).length ? pages[r] : null;
          if (r === ROUTE) setPage(next);
          else if (next) state.doc.pages[r] = next;
          else delete state.doc.pages[r];
        }
        refreshBar();
      });
  }

  function enterEdit() {
    if (state.edit) return;
    signIn().then(function (ok) {
      if (!ok) return;
      state.draftsIn = loaded.then(loadDrafts);
      state.edit = true;
      try { sessionStorage.setItem(SS_MODE, '1'); } catch (e) {}
      document.documentElement.setAttribute('data-eco-edit', '');
      buildBar();
      paintTargets();
      toast('Edit mode on — click any text or picture.');
    });
  }

  function exitEdit(silent) {
    state.edit = false;
    try { sessionStorage.removeItem(SS_MODE); } catch (e) {}
    document.documentElement.removeAttribute('data-eco-edit');
    var bar = document.getElementById('eco-editbar');
    if (bar) bar.remove();
    var marked = document.querySelectorAll('[data-eco-target]');
    for (var i = 0; i < marked.length; i++) {
      marked[i].removeAttribute('data-eco-target');
      if (marked[i].getAttribute('contenteditable')) marked[i].removeAttribute('contenteditable');
    }
    if (/[?&]edit=1\b/.test(location.search)) {
      var q = location.search.replace(/([?&])edit=1&?/, '$1').replace(/[?&]$/, '');
      history.replaceState(null, '', location.pathname + q + location.hash);
    }
    // The page may be showing drafts or unsaved work; out of edit mode it
    // should show what visitors see.
    if (pendingRoutes().length) { location.reload(); return; }
    if (!silent) toast('Edit mode off.');
  }

  // Routes with changes that are not live: unsaved here, or saved as a draft.
  function pendingRoutes() {
    var out = touchedRoutes();
    for (var r in state.drafts) if (state.drafts[r] && out.indexOf(r) < 0) out.push(r);
    return out;
  }

  // This page as a visitor sees it, in a fresh tab. noopener keeps it from
  // inheriting this tab's sessionStorage, so it opens signed out and out of edit
  // mode; the t= query only defeats caching.
  function viewLive() {
    var q = location.search.replace(/([?&])(edit|t)=[^&]*&?/g, '$1').replace(/[?&]$/, '');
    var url = location.pathname + q + (q ? '&' : '?') + 't=' + Date.now() + location.hash;
    if (state.touched[ROUTE] || state.drafts[ROUTE]) {
      toast('This page has changes that are not live yet — the new tab shows the site as visitors see it now.', 5000);
    }
    window.open(url, '_blank', 'noopener');
  }

  // ── edit-mode chrome ────────────────────────────────────────────────────
  function css() {
    if (document.getElementById('eco-edit-css')) return;
    var s = document.createElement('style');
    s.id = 'eco-edit-css';
    s.textContent = [
      '[data-eco-edit] [data-eco-target]{outline:1px dashed rgba(185,143,62,.85);outline-offset:2px;cursor:text;}',
      // Captions laid over photos sit in pointer-events:none layers so the card
      // clicks through — which sent a click on "Massage & Body Wellness" to the
      // picture underneath and opened the file picker. Take text clicks back.
      '[data-eco-edit] [data-eco-target="text"]{pointer-events:auto !important;}',
      '[data-eco-edit] [data-eco-target="img"]{outline:2px dashed rgba(20,83,45,.9);cursor:copy;}',
      '[data-eco-edit] [data-eco-target]:hover{outline-color:#B98F3E;outline-style:solid;background:rgba(185,143,62,.08);}',
      '[data-eco-edit] [contenteditable="true"]{outline:2px solid #14532D;background:#fff;}',
      '#eco-editbar{position:fixed;z-index:2147483647;right:14px;bottom:14px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;align-items:center;',
      'max-width:calc(100vw - 28px);box-sizing:border-box;',
      'background:#0E2B1C;color:#F6F1E6;padding:8px 10px;border-radius:10px;font:500 12px/1.2 Manrope,system-ui,sans-serif;',
      'box-shadow:0 8px 30px rgba(0,0,0,.35);}',
      '#eco-editbar button{font:inherit;border:0;border-radius:7px;padding:7px 10px;cursor:pointer;background:#B98F3E;color:#0E2B1C;white-space:nowrap;}',
      '#eco-editbar button.ghost{background:rgba(246,241,230,.14);color:#F6F1E6;}',
      '#eco-editbar button.live{background:#F6F1E6;color:#0E2B1C;}',
      '#eco-editbar button:disabled{opacity:.45;cursor:default;}',
      '#eco-editbar .sep{width:1px;align-self:stretch;background:rgba(246,241,230,.2);margin:0 2px;}',
      '#eco-editbar .n{opacity:.85;margin-right:4px;flex-basis:100%;text-align:right;}',
      '#eco-editbar .n b{font-weight:700;}',
      '#eco-toast{position:fixed;z-index:2147483647;left:50%;bottom:74px;transform:translateX(-50%);background:#0E2B1C;color:#F6F1E6;',
      'padding:9px 14px;border-radius:8px;font:500 12px/1.2 Manrope,system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35);max-width:80vw;text-align:center;}'
    ].join('');
    document.head.appendChild(s);
  }

  function toast(msg, ms) {
    css();
    var t = document.getElementById('eco-toast');
    if (!t) { t = document.createElement('div'); t.id = 'eco-toast'; t.setAttribute('data-eco-ui', ''); document.body.appendChild(t); }
    t.textContent = msg;
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.remove(); }, ms || 2600);
  }

  function buildBar() {
    css();
    if (document.getElementById('eco-editbar')) return;
    var bar = document.createElement('div');
    bar.id = 'eco-editbar';
    bar.setAttribute('data-eco-ui', '');
    bar.innerHTML =
      '<span class="n" id="eco-count">no changes</span>' +
      '<button class="ghost" id="eco-undo" title="Undo (Ctrl+Z)">↶ Undo</button>' +
      '<button class="ghost" id="eco-redo" title="Redo (Ctrl+Y)">↷ Redo</button>' +
      '<span class="sep"></span>' +
      '<button class="ghost" id="eco-save" title="Keep these changes without publishing them (Ctrl+S)">Save</button>' +
      '<button id="eco-publish" title="Publish every saved and unsaved change to the live site">Save &amp; make live</button>' +
      '<button class="live" id="eco-view" title="Open this page as visitors see it, in a new tab">View live page ↗</button>' +
      '<span class="sep"></span>' +
      '<button class="ghost" id="eco-revert" title="Remove every edit on this page">Reset page</button>' +
      '<button class="ghost" id="eco-dl" title="Download all edits as content.json">Download</button>' +
      '<button class="ghost" id="eco-exit">Exit</button>';
    document.body.appendChild(bar);
    bar.querySelector('#eco-undo').onclick = undo;
    bar.querySelector('#eco-redo').onclick = redo;
    bar.querySelector('#eco-save').onclick = saveDraft;
    bar.querySelector('#eco-publish').onclick = publish;
    bar.querySelector('#eco-view').onclick = viewLive;
    bar.querySelector('#eco-revert').onclick = revertPage;
    bar.querySelector('#eco-dl').onclick = download;
    bar.querySelector('#eco-exit').onclick = function () {
      if (state.dirty && !confirm('You have unsaved changes. Leave edit mode anyway?')) return;
      exitEdit();
    };
    refreshBar();
  }

  function setDisabled(id, off) {
    var b = document.getElementById(id);
    if (b && b.disabled !== off) b.disabled = off;
  }

  function refreshBar() {
    var c = document.getElementById('eco-count');
    if (!c) return;
    var m = pageMap(false);
    var n = Object.keys(m).length;
    var lost = state.orphans.length;
    var others = pendingRoutes().filter(function (r) { return r !== ROUTE; }).length;
    var status = state.uploads.length ? '⇡ Uploading picture…'
      : state.touched[ROUTE] ? '● Unsaved changes'
      : state.drafts[ROUTE] ? '◐ Saved — not live yet'
      : '✓ This page is live';
    var text = status + ' · ' +
      (n ? n + ' edit' + (n === 1 ? '' : 's') + ' on this page' : 'no edits on this page') +
      (lost ? ' · ' + lost + ' not on screen' : '') +
      (others ? ' · ' + others + ' other page' + (others === 1 ? '' : 's') + ' not live yet' : '');
    setDisabled('eco-undo', !state.undo.length);
    setDisabled('eco-redo', !state.redo.length);
    setDisabled('eco-save', !touchedRoutes().length);
    setDisabled('eco-publish', !pendingRoutes().length);
    var tip = lost ? 'Saved edits for things not on screen right now — another category, tab or slide —\n' +
      'or for text the design has since changed. They are kept, and show where their item does:\n' +
      state.orphans.map(function (k) { var e = m[k] || {}; return '• ' + (e.t === 'text' ? '"' + e.o + '" → "' + e.v + '"' : 'picture ' + (isSlotKey(k) ? k.slice(1) : e.o)); }).join('\n') : '';
    // applyAll calls this on every render pass; writing unchanged text would
    // wake the MutationObserver and loop.
    if (c.textContent !== text) c.textContent = text;
    if (c.title !== tip) c.title = tip;
  }

  function paintTargets() {
    if (!state.edit) return;
    var els = document.body.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (isUi(el)) continue;
      if (isImage(el)) {
        if (el.getAttribute('data-eco-target') !== 'img') el.setAttribute('data-eco-target', 'img');
      } else if (isTextLeaf(el)) {
        if (el.getAttribute('data-eco-target') !== 'text') el.setAttribute('data-eco-target', 'text');
      } else if (el.hasAttribute('data-eco-target')) {
        el.removeAttribute('data-eco-target');
      }
    }
  }

  // ── edits ───────────────────────────────────────────────────────────────
  // Which stored entry, if any, is the one already driving this element? Asked
  // of resolve(), the same placement applyAll paints with — a lookup by path
  // alone would hand a rebuilt page's new element someone else's edit, and its
  // "original" with it.
  function entryFor(el) {
    var m = pageMap(false);
    var at = resolve(m);
    for (var k in at) if (at[k] === el) return { path: k, entry: m[k] };
    return null;
  }

  // prevPath must be captured *before* the element's text or src is changed —
  // once it shows neither the original nor the stored value, entryFor cannot
  // recognise it any more.
  // Every older edit of this same element: what its position held when it showed
  // this same original. Left in place they piled up under each new attempt.
  function dropOlder(m, el, type, orig, keep) {
    var here = pathOf(el), o = type === 'text' ? norm(orig) : String(orig || '');
    for (var k in m) {
      if (k === keep || !Object.prototype.hasOwnProperty.call(m, k) || !m[k] || m[k].t !== type) continue;
      if (state.placed[k] === el || (!isSlotKey(k) && baseOf(k) === here && want(m[k], 'o') === o)) delete m[k];
    }
  }

  function record(el, type, value, orig, prevPath) {
    remember();
    var m = pageMap(true);
    var p = keyOf(el, type);
    var stale = prevPath;
    if (stale === undefined) { var pr = entryFor(el); stale = pr ? pr.path : null; }
    // Re-file the edit under the element's current key, dropping the stale one.
    if (stale != null && stale !== p) delete m[stale];
    dropOlder(m, el, type, orig, p);
    // A position can still belong to another item's edit — the drilldown shows a
    // different treatment at the same place in each category. Keep it, and file
    // this one under a suffixed key: elByPath reads the key without the suffix,
    // and the original tells the two apart.
    var key = p, n = 1;
    while (!isSlotKey(p) && key !== stale && m[key]) key = p + '~' + (n++);
    // Re-inserted, so it sits last: the newest edit wins (see resolve).
    delete m[key];
    m[key] = { t: type, v: value, o: orig };
    state.placed[key] = el;
    state.dirty = 1;
    touch();
    saveLocal();
    refreshBar();
  }

  function forget(el) {
    var prev = entryFor(el);
    if (!prev) return;
    remember();
    var m = pageMap(true);
    var entry = prev.entry;
    delete m[prev.path];
    dropOlder(m, el, entry.t, entry.o, null);
    state.dirty = 1;
    touch();
    saveLocal();
    restore(el, entry);
    refreshBar();
    toast('Back to the original — press Save, or Save & make live.');
  }

  // ── undo / redo ─────────────────────────────────────────────────────────
  // Each step is a snapshot of this page's edits taken just before a change.
  // History is per page and lasts until the page is left.
  function snapshot() { return JSON.stringify(pageMap(false)); }
  function remember() {
    state.undo.push(snapshot());
    if (state.undo.length > 100) state.undo.shift();
    state.redo = [];
  }

  // Swap this page's edits for another set: put every element the current set
  // drives back to its original, then paint the new set over the clean page.
  function setPage(next) {
    var m = pageMap(false), at = resolve(m);
    for (var k in at) restore(at[k], m[k]);
    state.placed = {};
    if (next && Object.keys(next).length) state.doc.pages[ROUTE] = next;
    else delete state.doc.pages[ROUTE];
    applyAll();
  }

  function step(from, to, done) {
    if (state.editingEl) commitText();
    if (!from.length) return;
    to.push(snapshot());
    setPage(JSON.parse(from.pop()));
    state.dirty = 1;
    touch();
    saveLocal();
    refreshBar();
    toast(done);
  }
  function undo() { step(state.undo, state.redo, 'Undone.'); }
  function redo() { step(state.redo, state.undo, 'Redone.'); }

  function beginText(el) {
    if (state.editingEl) commitText();
    var prev = entryFor(el);
    state.editingEl = el;
    el._ecoBefore = el.textContent;
    el._ecoPrevPath = prev ? prev.path : null;
    // Keep the true original across repeat edits, so "o" never becomes an
    // earlier edit of our own.
    el._ecoOrig = prev && prev.entry.o != null ? prev.entry.o : el.textContent;
    el.setAttribute('contenteditable', 'true');
    el.focus();
    try {
      var r = document.createRange();
      r.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    } catch (e) {}
  }

  function commitText() {
    var el = state.editingEl;
    if (!el) return;
    state.editingEl = null;
    el.removeAttribute('contenteditable');
    var v = (el.innerText != null ? el.innerText : el.textContent).replace(/ /g, ' ').trim();
    if (v === '' || v === norm(el._ecoBefore)) { el.textContent = el._ecoBefore; return; }
    el.textContent = v;
    if (v !== String(el._ecoOrig).trim()) record(el, 'text', v, el._ecoOrig, el._ecoPrevPath);
    else forget(el);
  }

  function cancelText() {
    var el = state.editingEl;
    if (!el) return;
    state.editingEl = null;
    el.removeAttribute('contenteditable');
    el.textContent = el._ecoBefore;
  }

  // Re-encode client-side: the source photos run to 7 MB and the store keeps one
  // copy per upload, so cap the longest side and ship WebP.
  function shrink(file) {
    if (!/^image\//.test(file.type)) return Promise.reject(new Error('that is not an image file'));
    if (/svg/.test(file.type)) return Promise.resolve(file);
    return createImageBitmap(file).then(function (bmp) {
      var k = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
      var w = Math.max(1, Math.round(bmp.width * k));
      var h = Math.max(1, Math.round(bmp.height * k));
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(bmp, 0, 0, w, h);
      return new Promise(function (res) {
        c.toBlob(function (b) { res(b && b.size < file.size ? b : file); }, 'image/webp', 0.86);
      });
    }).catch(function () { return file; });
  }

  function upload(blob) {
    return fetch(API_UPLOAD, {
      method: 'POST',
      headers: authHeaders({ 'content-type': blob.type || 'image/webp' }),
      body: blob
    }).then(function (r) {
      if (!r.ok) throw new Error('upload failed (' + r.status + ')');
      return r.json();
    }).then(function (j) { return j.url; });
  }

  function dataUrl(blob) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(fr.result); };
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  }

  function replaceImage(el, file) {
    var prev = entryFor(el);
    var orig = prev ? prev.entry.o : imgSrc(el);
    var prevPath = prev ? prev.path : null;
    toast('Uploading…', 8000);
    var job = shrink(file)
      .then(function (blob) {
        return upload(blob).catch(function (e) {
          if (state.remote) throw e;
          return dataUrl(blob); // local preview with no backend: inline it
        });
      })
      .then(function (url) {
        record(el, 'img', url, orig, prevPath);
        applyAll();
        toast('Picture replaced — press Save, or Save & make live.');
      })
      .catch(function (e) { toast('Could not replace that image: ' + e.message, 5000); })
      .then(function () { state.uploads.splice(state.uploads.indexOf(job), 1); refreshBar(); });
    state.uploads.push(job);
    refreshBar();
  }

  // Save and publish act on what is finished. A picture still uploading is
  // recorded only once the upload returns, so saving before then left it out
  // while the bar said "Live now"; and publishing before the server's drafts
  // were read skipped every other page waiting in draft. Wait for both, and for
  // the line being typed.
  function settled() {
    if (state.editingEl) commitText();
    var wait = state.uploads.slice();
    if (state.draftsIn) wait.push(state.draftsIn);
    if (state.uploads.length) toast('Waiting for the picture upload to finish…', 8000);
    return Promise.all(wait).catch(function () {});
  }

  var picker = null;
  function pickImage(el) {
    if (!picker) {
      picker = document.createElement('input');
      picker.type = 'file';
      picker.accept = 'image/*';
      picker.style.display = 'none';
      picker.setAttribute('data-eco-ui', '');
      document.body.appendChild(picker);
      picker.addEventListener('change', function () {
        var f = picker.files && picker.files[0];
        var target = picker._target;
        picker.value = '';
        if (f && target) replaceImage(target, f);
      });
    }
    picker._target = el;
    picker.click();
  }

  // ── save / export ───────────────────────────────────────────────────────
  // Send the named routes, each as the whole page it should become. An empty
  // map means "clear this page", which is what Reset page leaves behind.
  function send(routes, draft, btnId, busy) {
    var payload = { routes: {} };
    for (var i = 0; i < routes.length; i++) {
      var m = (state.doc.pages && state.doc.pages[routes[i]]) || null;
      payload.routes[routes[i]] = m && Object.keys(m).length ? m : null;
    }
    var btn = document.getElementById(btnId);
    var label = btn && btn.innerHTML;
    if (btn) { btn.disabled = true; btn.textContent = busy; }
    return fetch(API_CONTENT + (draft ? '?draft=1' : ''), {
      method: 'PATCH',
      headers: authHeaders({ 'content-type': 'application/json' }),
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (r.status === 401) {
        try { sessionStorage.removeItem(SS_KEY); } catch (e) {}
        throw new Error('password rejected — reload and sign in again');
      }
      if (r.status === 404 || r.status === 405) {
        throw new Error('this deployment predates per-page saving — redeploy the site');
      }
      if (!r.ok) throw new Error('save failed (' + r.status + ')');
      state.dirty = 0;
      state.touched = {};
      clearLocal();
      return true;
    }).catch(function (e) {
      saveLocal();
      toast('Save failed: ' + e.message, 6000);
      return false;
    }).then(function (ok) {
      if (btn) { btn.innerHTML = label; btn.disabled = false; }
      refreshBar();
      return ok;
    });
  }

  function offline() {
    saveLocal();
    toast('No editor backend reachable — kept in this browser. Use Download and commit the file.', 6000);
  }

  // Save: keep the work on the server, visible in edit mode only.
  function saveDraft() {
    if (!state.remote) return offline();
    settled().then(function () {
      var routes = touchedRoutes();
      if (!routes.length) { toast('Nothing new to save.'); return; }
      send(routes, true, 'eco-save', 'Saving…').then(function (ok) {
        if (!ok) return;
        var mine = loadMine();
        for (var i = 0; i < routes.length; i++) {
          state.drafts[routes[i]] = 1;
          mine[routes[i]] = state.doc.pages[routes[i]] || {};
        }
        saveMine(mine);
        refreshBar();
        toast('Saved — not live yet. Press “Save & make live” to publish.', 4000);
      });
    });
  }

  // Save & make live: publish everything not live yet — unsaved work here and
  // saved drafts, on this page and any other.
  function publish() {
    if (!state.remote) return offline();
    settled().then(function () {
      var routes = pendingRoutes();
      if (!routes.length) { toast('Everything is already live.'); return; }
      send(routes, false, 'eco-publish', 'Publishing…').then(function (ok) {
        if (!ok) return;
        var mine = loadMine();
        for (var i = 0; i < routes.length; i++) {
          delete state.drafts[routes[i]];
          delete mine[routes[i]];
          var m = state.doc.pages[routes[i]];
          if (m) state.live[routes[i]] = JSON.parse(JSON.stringify(m)); else delete state.live[routes[i]];
        }
        saveMine(mine);
        refreshBar();
        toast('Live now' + (routes.length > 1 ? ' — ' + routes.length + ' pages published' : '') +
          '. Press “View live page” to check it.', 5000);
      });
    });
  }

  function revertPage() {
    if (!confirm('Remove every edit on this page and go back to the original design?')) return;
    remember();
    var m = pageMap(true);
    var at = resolve(m);
    for (var k in at) restore(at[k], m[k]);
    delete state.doc.pages[ROUTE];
    state.orphans = [];
    state.dirty = 1;
    touch();
    saveLocal();
    refreshBar();
    toast('Page reset — press Save, or Save & make live. Undo brings the edits back.', 4000);
  }

  function download() {
    var blob = new Blob([JSON.stringify(state.doc, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'content.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  // ── input handling (capture phase: the page's own handlers never see it) ──
  document.addEventListener('click', function (e) {
    if (!state.edit) return;
    if (isUi(e.target)) return;
    var t = e.target;
    var el = (t.closest && t.closest('img, image-slot')) || (isTextLeaf(t) ? t : null);
    if (!el) {
      var n = t;
      while (n && n !== document.body && !isTextLeaf(n) && !isImage(n)) n = n.parentElement;
      if (!n || n === document.body) return;
      el = n;
    }
    e.preventDefault();
    e.stopPropagation();
    if (e.altKey) { forget(el); return; }
    if (isImage(el)) pickImage(el);
    else if (el !== state.editingEl) beginText(el);
  }, true);

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      if (state.edit) exitEdit(); else enterEdit();
      return;
    }
    if (!state.edit) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); saveDraft(); return; }
    // Mid-typing, Ctrl+Z belongs to the browser's own undo inside the line.
    if ((e.ctrlKey || e.metaKey) && !state.editingEl) {
      var key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (key === 'y' || (key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); return; }
    }
    if (!state.editingEl) return;
    if (e.key === 'Escape') { e.preventDefault(); cancelText(); }
    else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitText(); }
  }, true);

  document.addEventListener('focusout', function (e) {
    if (state.editingEl && e.target === state.editingEl) setTimeout(commitText, 0);
  }, true);

  document.addEventListener('dragover', function (e) {
    if (!state.edit) return;
    if (e.target.closest && e.target.closest('img, image-slot')) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }
  }, true);

  document.addEventListener('drop', function (e) {
    if (!state.edit) return;
    var el = e.target.closest && e.target.closest('img, image-slot');
    if (!el) return;
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    e.preventDefault();
    e.stopPropagation();
    replaceImage(el, f);
  }, true);

  window.addEventListener('beforeunload', function (e) {
    if (state.edit && (state.dirty || state.uploads.length)) { e.preventDefault(); e.returnValue = ''; }
  });

  // ── boot ────────────────────────────────────────────────────────────────
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'id']
  });

  function boot() {
    applyAll();
    if (wantsEdit()) enterEdit();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', function () {
    setTimeout(applyAll, 120);
    setTimeout(applyAll, 600);
  });

  window.ecosophyEdit = {
    enter: enterEdit,
    exit: exitEdit,
    save: saveDraft,
    publish: publish,
    doc: function () { return state.doc; },
    // Edits on this page whose element is gone — for checking a rebuild.
    orphans: function () { return state.orphans.slice(); },
    loaded: loaded
  };
})();
