// Checks functions/_detail.js without workerd: HTMLRewriter is stubbed to
// record what it would write. Run: node tools/test-detail-function.mjs
import { detail } from '../functions/_detail.js';

const writes = [];
globalThis.HTMLRewriter = class {
  constructor() { this.h = []; }
  on(sel, handler) { this.h.push([sel, handler]); return this; }
  transform(res) {
    for (const [sel, handler] of this.h) {
      const el = { setAttribute: (a, v) => writes.push([sel, a, v]), setInnerContent: (v) => writes.push([sel, 'text', v]), append: (v) => writes.push([sel, 'append', v]) };
      handler.element(el);
    }
    return res;
  }
};
const page = () => new Response('<html></html>', { headers: { 'content-type': 'text/html' } });
const run = (u, side) => { writes.length = 0; return detail({ request: new Request(u), next: async () => page() }, side); };

let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

let r = await run('https://x.dev/gent-service?s=balinese-massage', 'him');
ok(r.status === 301 && r.headers.get('location').endsWith('/gent-service?s=relaxing-balinese'), 'legacy slug 301s to the current one');
r = await run('https://x.dev/gent-service?s=nope', 'him');
ok(r.status === 404 && writes.some(w => w[2] && String(w[2]).includes('noindex')), 'unknown slug: 404 + noindex');
r = await run('https://x.dev/service?s=glass-skin-package', 'her');
ok(r.status === 200 && writes.some(w => w[0] === 'link[rel="canonical"]' && w[2] === 'https://ecosophy.pages.dev/service?s=glass-skin-package'), 'treatment gets its own canonical');
ok(writes.some(w => w[0] === 'title' && /^Glass Skin Package · /.test(w[2])), 'treatment gets its own title');
ok(writes.some(w => w[0] === 'meta[name="description"]' && /HydraFacial/.test(w[2])), 'treatment gets its own description');
r = await run('https://x.dev/gent-service?s=feet-massage', 'him');
ok(writes.some(w => w[0] === 'title' && /^Feet Rejuvenating/.test(w[2])), 'renamed treatment titled with the approved name');
r = await run('https://x.dev/gent-service', 'him');
ok(r.status === 301 && r.headers.get('location').endsWith('/gent-services'), 'no slug 301s to the menu');
process.exit(fails ? 1 : 0);
