// POST /api/upload — raw image bytes in, permanent URL out.
//
// The body is the file itself (the editor already downscales it to WebP), and
// the content-type header carries its type. Stored in KV under a content hash,
// so re-uploading the same picture costs nothing and the URL is immutable.

import { MAX_IMAGE, authed, json, kv } from './_lib.js';

const EXT = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg'
};

export async function onRequestPost({ request, env }) {
  const auth = authed(request, env);
  if (!auth.ok) return json({ error: auth.msg }, auth.status);

  const store = kv(env);
  if (!store) return json({ error: 'No KV namespace bound as ECO_CONTENT — nowhere to put the image.' }, 503);

  const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const ext = EXT[type];
  if (!ext) return json({ error: 'Unsupported image type: ' + (type || 'none') }, 415);

  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength) return json({ error: 'Empty upload.' }, 400);
  if (bytes.byteLength > MAX_IMAGE) return json({ error: 'Image too large (max 12 MB).' }, 413);

  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
  const name = hash + '.' + ext;

  await store.put('img:' + name, bytes, { metadata: { ct: type, n: bytes.byteLength } });
  return json({ ok: true, url: '/api/img/' + name, bytes: bytes.byteLength });
}
