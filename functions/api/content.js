// GET   /api/content — the live overrides doc every page reads on load.
// PUT   /api/content — replace it wholesale (editor password required).
// PATCH /api/content — replace only the named routes (editor password required).
//
// The editor saves with PATCH. PUT replaces everything, so a tab holding a stale
// copy of the doc would silently drop every page edited since it loaded; PATCH
// touches only the routes that tab actually changed. PUT stays for restoring a
// downloaded content.json backup, where replacing the lot is the intent.
//
// Drafts: ?draft=1 on GET or PATCH reads or writes a second doc that only edit
// mode loads, so "Save" keeps work on the server without visitors seeing it. A
// draft route holds the whole page as it should go live, {} meaning "no edits".
// A live PATCH (publish) drops the routes it wrote from the draft doc.

import { CONTENT_KEY, MAX_DOC, authed, json, kv } from './_lib.js';

const DRAFT_KEY = CONTENT_KEY + ':draft';
const EMPTY = { pages: {} };

const isDraft = (request) => new URL(request.url).searchParams.get('draft') === '1';

async function readDoc(store, key) {
  const cur = await store.get(key);
  let doc;
  try { doc = cur ? JSON.parse(cur) : null; } catch (e) { doc = null; }
  if (!doc || typeof doc !== 'object' || typeof doc.pages !== 'object' || !doc.pages) doc = { pages: {} };
  return doc;
}

export async function onRequestGet({ request, env }) {
  const store = kv(env);
  if (isDraft(request)) {
    const auth = authed(request, env);
    if (!auth.ok) return json({ error: auth.msg }, auth.status);
    if (!store) return json(EMPTY);
    return json(await readDoc(store, DRAFT_KEY));
  }
  if (!store) return json(EMPTY);
  const doc = await store.get(CONTENT_KEY);
  return new Response(doc || JSON.stringify(EMPTY), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

export async function onRequestPut({ request, env }) {
  const auth = authed(request, env);
  if (!auth.ok) return json({ error: auth.msg }, auth.status);

  const store = kv(env);
  if (!store) return json({ error: 'No KV namespace bound as ECO_CONTENT — nothing to save into.' }, 503);

  const text = await request.text();
  if (text.length > MAX_DOC) return json({ error: 'Content doc too large.' }, 413);

  let doc;
  try { doc = JSON.parse(text); } catch (e) { return json({ error: 'Malformed JSON.' }, 400); }
  if (!doc || typeof doc !== 'object' || typeof doc.pages !== 'object' || !doc.pages) {
    return json({ error: 'Expected { pages: {...} }.' }, 400);
  }

  doc.updated = new Date().toISOString();
  await store.put(CONTENT_KEY, JSON.stringify(doc));
  // Keep the last write recoverable — a mistake in the editor is otherwise final.
  await store.put(CONTENT_KEY + ':backup:' + Date.now(), JSON.stringify(doc), {
    expirationTtl: 60 * 60 * 24 * 30
  });
  return json({ ok: true, updated: doc.updated });
}

// Replace only the routes named in { routes: { "/for-her": {...}, "/for-him": null } }.
// A null value removes that route (the editor's "Undo all"). Every other page in
// the stored doc is left exactly as it is.
export async function onRequestPatch({ request, env }) {
  const auth = authed(request, env);
  if (!auth.ok) return json({ error: auth.msg }, auth.status);

  const store = kv(env);
  if (!store) return json({ error: 'No KV namespace bound as ECO_CONTENT — nothing to save into.' }, 503);

  const text = await request.text();
  if (text.length > MAX_DOC) return json({ error: 'Content doc too large.' }, 413);

  let body;
  try { body = JSON.parse(text); } catch (e) { return json({ error: 'Malformed JSON.' }, 400); }
  const routes = body && body.routes;
  if (!routes || typeof routes !== 'object' || Array.isArray(routes)) {
    return json({ error: 'Expected { routes: { "<route>": {...} | null } }.' }, 400);
  }
  for (const r of Object.keys(routes)) {
    const v = routes[r];
    if (v !== null && (typeof v !== 'object' || Array.isArray(v))) {
      return json({ error: `Route ${r}: expected an object of edits, or null to clear it.` }, 400);
    }
  }

  // Read-modify-write. KV is eventually consistent, so two saves landing within a
  // second of each other can still race; saves of *different* pages no longer
  // clobber one another, which is the failure that actually bit.
  if (isDraft(request)) {
    const draft = await readDoc(store, DRAFT_KEY);
    for (const r of Object.keys(routes)) draft.pages[r] = routes[r] || {};
    draft.updated = new Date().toISOString();
    const out = JSON.stringify(draft);
    if (out.length > MAX_DOC) return json({ error: 'Draft doc too large.' }, 413);
    await store.put(DRAFT_KEY, out);
    return json({ ok: true, draft: true, updated: draft.updated, saved: Object.keys(routes) });
  }

  const doc = await readDoc(store, CONTENT_KEY);

  const cleared = [];
  for (const r of Object.keys(routes)) {
    if (routes[r] === null || !Object.keys(routes[r]).length) { delete doc.pages[r]; cleared.push(r); }
    else doc.pages[r] = routes[r];
  }

  doc.updated = new Date().toISOString();
  const out = JSON.stringify(doc);
  if (out.length > MAX_DOC) return json({ error: 'Content doc too large.' }, 413);

  await store.put(CONTENT_KEY, out);
  await store.put(CONTENT_KEY + ':backup:' + Date.now(), out, {
    expirationTtl: 60 * 60 * 24 * 30
  });

  // Published, so these routes no longer have anything waiting in draft.
  const draft = await readDoc(store, DRAFT_KEY);
  let had = false;
  for (const r of Object.keys(routes)) if (r in draft.pages) { delete draft.pages[r]; had = true; }
  if (had) { draft.updated = doc.updated; await store.put(DRAFT_KEY, JSON.stringify(draft)); }

  return json({
    ok: true,
    updated: doc.updated,
    saved: Object.keys(routes).filter((r) => !cleared.includes(r)),
    cleared
  });
}

export const onRequestPost = onRequestPut;

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: { allow: 'GET, PUT, PATCH, POST, OPTIONS' } });
}
