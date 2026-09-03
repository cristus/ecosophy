// GET /api/img/<hash>.<ext> — serve an uploaded picture.
// The name is a content hash, so the bytes behind a URL never change: cache hard.

import { kv } from '../_lib.js';

export async function onRequestGet({ params, env, request }) {
  const store = kv(env);
  const name = String(params.name || '');
  if (!store || !/^[0-9a-f]{8,64}\.[a-z0-9+]{2,8}$/.test(name)) {
    return new Response('Not found', { status: 404 });
  }

  const { value, metadata } = await store.getWithMetadata('img:' + name, { type: 'arrayBuffer' });
  if (!value) return new Response('Not found', { status: 404 });

  const etag = '"' + name + '"';
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { etag } });
  }

  return new Response(value, {
    headers: {
      'content-type': (metadata && metadata.ct) || 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable',
      etag
    }
  });
}
