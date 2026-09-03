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
 *      line of text to retype it and any picture to replace it, then Save — which
 *      PUTs the overrides to /api/content (Cloudflare KV) so the change is live
 *      for everyone on the next page view.
 *
 * Overrides are keyed by DOM path (tag + sibling index, from <body>), with the
 * original text/src stored alongside as a fallback matcher for when the design is
 * rebuilt and paths shift.
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

  function elByPath(path) {
    var parts = path.split('/');
    var n = document.body;
    for (var i = 0; i < parts.length; i++) {
      var m = /^([a-z0-9-]+)(\d+)$/.exec(parts[i]);
      if (!m || !n) return null;
      var el = n.children[+m[2]];
      if (!el || el.tagName.toLowerCase() !== m[1]) return null;
      n = el;
    }
    return n === document.body ? null : n;
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

  // ── applying overrides ──────────────────────────────────────────────────
  function findFallback(entry) {
    var i, els;
    if (entry.t === 'text') {
      els = document.body.querySelectorAll('*');
      for (i = 0; i < els.length; i++) {
        if (isTextLeaf(els[i]) && els[i].textContent.trim() === String(entry.o || '').trim()) return els[i];
      }
    } else {
      els = document.querySelectorAll('img, image-slot');
      for (i = 0; i < els.length; i++) {
        if (imgSrc(els[i]) === entry.o) return els[i];
      }
    }
    return null;
  }

  function applyOne(path, entry) {
    if (!entry || entry.v == null) return;
    var el = elByPath(path);
    if (!el) el = findFallback(entry);
    if (!el) return;
    if (el === state.editingEl) return;

    if (entry.t === 'text') {
      if (el.childElementCount === 0 && el.textContent !== entry.v) el.textContent = entry.v;
      return;
    }

    if (el.tagName === 'IMAGE-SLOT') {
      // A slot prefers its sidecar-stored image (keyed by id) over src=, and only
      // accepts data: URLs from that store — so drop the id and the slot falls
      // through to the src we set here.
      if (el.id) el.removeAttribute('id');
      if (el.getAttribute('src') !== entry.v) el.setAttribute('src', entry.v);
    } else {
      if (el.getAttribute('srcset')) el.removeAttribute('srcset');
      if (el.getAttribute('src') !== entry.v) el.setAttribute('src', entry.v);
    }
  }

  function applyAll() {
    if (state.applying) return;
    state.applying = true;
    try {
      var m = pageMap(false);
      for (var k in m) if (Object.prototype.hasOwnProperty.call(m, k)) applyOne(k, m[k]);
    } catch (e) {}
    state.applying = false;
    if (state.edit) paintTargets();
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

  function mergeDoc(base, extra) {
    if (!extra || !extra.pages) return base;
    base.pages = base.pages || {};
    for (var r in extra.pages) {
      base.pages[r] = base.pages[r] || {};
      for (var k in extra.pages[r]) base.pages[r][k] = extra.pages[r][k];
    }
    return base;
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
      var local = loadLocal();
      if (local) {
        mergeDoc(state.doc, local.doc);
        for (var r in local.touched) {
          state.touched[r] = 1;
          // Touched but absent locally means it was reverted here and not yet
          // saved; the copy that just came back from the server must not undo it.
          if (!local.doc.pages[r]) delete state.doc.pages[r];
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

  function signIn() {
    var k = editKey();
    if (k) return Promise.resolve(true);
    var pw = window.prompt('Ecosophy — editor password');
    if (!pw) return Promise.resolve(false);
    return fetch(API_SESSION, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-eco-key': pw }
    }).then(function (r) {
      if (!r.ok) { alert('Wrong password (or the editor is not configured yet).'); return false; }
      try { sessionStorage.setItem(SS_KEY, pw); } catch (e) {}
      return true;
    }).catch(function () {
      // No backend reachable (local preview): allow offline editing.
      try { sessionStorage.setItem(SS_KEY, pw); } catch (e) {}
      return true;
    });
  }

  function enterEdit() {
    if (state.edit) return;
    signIn().then(function (ok) {
      if (!ok) return;
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
    if (!silent) toast('Edit mode off.');
  }

  // ── edit-mode chrome ────────────────────────────────────────────────────
  function css() {
    if (document.getElementById('eco-edit-css')) return;
    var s = document.createElement('style');
    s.id = 'eco-edit-css';
    s.textContent = [
      '[data-eco-edit] [data-eco-target]{outline:1px dashed rgba(185,143,62,.85);outline-offset:2px;cursor:text;}',
      '[data-eco-edit] [data-eco-target="img"]{outline:2px dashed rgba(20,83,45,.9);cursor:copy;}',
      '[data-eco-edit] [data-eco-target]:hover{outline-color:#B98F3E;outline-style:solid;background:rgba(185,143,62,.08);}',
      '[data-eco-edit] [contenteditable="true"]{outline:2px solid #14532D;background:#fff;}',
      '#eco-editbar{position:fixed;z-index:2147483647;right:14px;bottom:14px;display:flex;gap:6px;align-items:center;',
      'background:#0E2B1C;color:#F6F1E6;padding:8px 10px;border-radius:10px;font:500 12px/1.2 Manrope,system-ui,sans-serif;',
      'box-shadow:0 8px 30px rgba(0,0,0,.35);}',
      '#eco-editbar button{font:inherit;border:0;border-radius:7px;padding:7px 10px;cursor:pointer;background:#B98F3E;color:#0E2B1C;}',
      '#eco-editbar button.ghost{background:rgba(246,241,230,.14);color:#F6F1E6;}',
      '#eco-editbar button:disabled{opacity:.45;cursor:default;}',
      '#eco-editbar .n{opacity:.75;margin-right:4px;}',
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
      '<button id="eco-save">Save</button>' +
      '<button class="ghost" id="eco-revert">Undo all</button>' +
      '<button class="ghost" id="eco-dl">Download</button>' +
      '<button class="ghost" id="eco-exit">Exit</button>';
    document.body.appendChild(bar);
    bar.querySelector('#eco-save').onclick = save;
    bar.querySelector('#eco-revert').onclick = revertPage;
    bar.querySelector('#eco-dl').onclick = download;
    bar.querySelector('#eco-exit').onclick = function () {
      if (state.dirty && !confirm('You have unsaved changes. Leave edit mode anyway?')) return;
      exitEdit();
    };
    refreshBar();
  }

  function refreshBar() {
    var c = document.getElementById('eco-count');
    if (!c) return;
    var n = Object.keys(pageMap(false)).length;
    c.textContent = (state.dirty ? '● unsaved · ' : '') +
      (n ? n + ' edit' + (n === 1 ? '' : 's') + ' on this page' : 'no changes');
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
  function record(el, type, value, orig) {
    var m = pageMap(true);
    m[pathOf(el)] = { t: type, v: value, o: orig };
    state.dirty = 1;
    touch();
    saveLocal();
    refreshBar();
  }

  function forget(el) {
    var m = pageMap(true);
    var p = pathOf(el);
    if (!m[p]) return;
    var entry = m[p];
    delete m[p];
    state.dirty = 1;
    touch();
    saveLocal();
    if (entry.t === 'text') el.textContent = entry.o;
    else el.setAttribute('src', entry.o);
    refreshBar();
    toast('Reverted to the original.');
  }

  function beginText(el) {
    if (state.editingEl) commitText();
    var m = pageMap(false);
    var prev = m[pathOf(el)];
    state.editingEl = el;
    el._ecoBefore = el.textContent;
    el._ecoOrig = prev && prev.o != null ? prev.o : el.textContent;
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
    if (v === '') { el.textContent = el._ecoBefore; return; }
    el.textContent = v;
    if (v !== String(el._ecoOrig).trim()) record(el, 'text', v, el._ecoOrig);
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
    var m = pageMap(false);
    var prev = m[pathOf(el)];
    var orig = prev ? prev.o : imgSrc(el);
    toast('Uploading…', 8000);
    shrink(file)
      .then(function (blob) {
        return upload(blob).catch(function (e) {
          if (state.remote) throw e;
          return dataUrl(blob); // local preview with no backend: inline it
        });
      })
      .then(function (url) {
        record(el, 'img', url, orig);
        applyAll();
        toast('Picture replaced — press Save to publish it.');
      })
      .catch(function (e) { toast('Could not replace that image: ' + e.message, 5000); });
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
  function save() {
    if (!state.remote) {
      saveLocal();
      toast('No editor backend reachable — kept in this browser. Use Download and commit the file.', 6000);
      return;
    }
    var routes = touchedRoutes();
    if (!routes.length) { toast('Nothing to save — no changes made in this browser.'); return; }

    // Send only what this browser changed. An empty map means "clear this page",
    // which is what Undo all leaves behind.
    var payload = { routes: {} };
    for (var i = 0; i < routes.length; i++) {
      var m = (state.doc.pages && state.doc.pages[routes[i]]) || null;
      payload.routes[routes[i]] = m && Object.keys(m).length ? m : null;
    }

    var btn = document.getElementById('eco-save');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    fetch(API_CONTENT, {
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
      toast('Saved — it is live on the site now.');
    }).catch(function (e) {
      saveLocal();
      toast('Save failed: ' + e.message, 6000);
    }).then(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Save'; }
      refreshBar();
    });
  }

  function revertPage() {
    if (!confirm('Undo every edit on this page and go back to the original design?')) return;
    var m = pageMap(true);
    for (var k in m) {
      var e = m[k];
      var el = elByPath(k);
      if (el) { if (e.t === 'text') el.textContent = e.o; else el.setAttribute('src', e.o); }
    }
    delete state.doc.pages[ROUTE];
    state.dirty = 1;
    touch();
    saveLocal();
    refreshBar();
    toast('Page reverted — press Save to publish that.');
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
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); return; }
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
    if (state.edit && state.dirty) { e.preventDefault(); e.returnValue = ''; }
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
    save: save,
    doc: function () { return state.doc; },
    loaded: loaded
  };
})();
