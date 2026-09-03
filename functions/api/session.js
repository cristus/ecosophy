// POST /api/session — password check, so edit mode can refuse entry up front
// rather than failing at Save.

import { authed, json } from './_lib.js';

export async function onRequestPost({ request, env }) {
  const auth = authed(request, env);
  if (!auth.ok) return json({ error: auth.msg }, auth.status);
  return json({ ok: true });
}
