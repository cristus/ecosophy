// Shared helpers for the editor API.
//
// Bindings expected on the Pages project (Settings → Functions):
//   ECO_CONTENT      KV namespace — holds the overrides doc and uploaded images
//   ECO_EDIT_PASSWORD  environment variable / secret — the editor password
//
// With no KV bound the API still answers GETs with an empty doc, so the site
// renders normally; only saving is refused.

export const CONTENT_KEY = 'content:v1';
export const MAX_DOC = 2 * 1024 * 1024;   // overrides doc
export const MAX_IMAGE = 12 * 1024 * 1024; // one upload

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
  });
}

// Constant-time-ish compare so a wrong password leaks nothing through timing.
function same(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function authed(request, env) {
  const expected = env.ECO_EDIT_PASSWORD;
  if (!expected) return { ok: false, status: 503, msg: 'Editor not configured: set ECO_EDIT_PASSWORD on the Pages project.' };
  const given = request.headers.get('x-eco-key') || '';
  if (!same(given, expected)) return { ok: false, status: 401, msg: 'Wrong password.' };
  return { ok: true };
}

export function kv(env) {
  return env.ECO_CONTENT || null;
}
