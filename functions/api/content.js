// GET  /api/content — the live overrides doc every page reads on load.
// PUT  /api/content — replace it (editor password required).

import { CONTENT_KEY, MAX_DOC, authed, json, kv } from './_lib.js';

const EMPTY = { pages: {} };

export async function onRequestGet({ env }) {
  const store = kv(env);
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

export const onRequestPost = onRequestPut;

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: { allow: 'GET, PUT, POST, OPTIONS' } });
}
