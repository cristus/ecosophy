// Builds the deployable site in public/ from the design-canvas sources in ref/.
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SRC = 'ref/Ecosophy Spa Website Design';
const OUT = 'public';
const SITE = 'https://ecosophy.pages.dev';

// Source page -> { route, title, description, mark }
const PAGES = {
  'Ecosophy Switcher.dc.html': {
    route: 'index.html',
    title: 'Ecosophy Spa Dubai — Where Nature Restores You',
    description: 'Two sanctuaries, one philosophy. Balinese hands, Moroccan steam, and the quiet of a green room in Dubai.',
    mark: 'favicons/mark-woman-gold-180.png',
  },
  'Ecosophy For Her.dc.html': {
    route: 'for-her.html',
    title: 'Ecosophy Spa for Her — Dubai',
    description: 'Moroccan bath, Balinese massage and skin rituals for women, in a calm green room in Dubai.',
    mark: 'favicons/mark-woman-gold-180.png',
  },
  'Ecosophy For Him.dc.html': {
    route: 'for-him.html',
    title: 'Ecosophy Gent Spa for Him — Dubai',
    description: "The gentlemen's retreat. Moroccan bath, deep tissue massage, skin and grooming rituals for men in Dubai.",
    mark: 'favicons/mark-man-gold-180.png',
  },
  'Ecosophy Services.dc.html': {
    route: 'services.html',
    title: 'Spa Menu & Prices — Ecosophy for Her',
    description: 'Full treatment menu and prices for Ecosophy Spa Dubai — massage, hammam, facials and body rituals.',
    mark: 'favicons/mark-woman-gold-180.png',
  },
  'Ecosophy Service Detail.dc.html': {
    route: 'service.html',
    title: 'Treatment — Ecosophy Spa for Her',
    description: 'Treatment details, duration and pricing at Ecosophy Spa Dubai.',
    mark: 'favicons/mark-woman-gold-180.png',
  },
  'Ecosophy Gent Services.dc.html': {
    route: 'gent-services.html',
    title: 'Menu & Prices — Ecosophy Gent Spa',
    description: 'Full treatment menu and prices for Ecosophy Gent Spa Dubai — massage, hammam, skin and grooming.',
    mark: 'favicons/mark-man-gold-180.png',
  },
  'Ecosophy Gent Service Detail.dc.html': {
    route: 'gent-service.html',
    title: 'Treatment — Ecosophy Gent Spa',
    description: 'Treatment details, duration and pricing at Ecosophy Gent Spa Dubai.',
    mark: 'favicons/mark-man-gold-180.png',
  },
};

// Longest first so "…Service Detail.dc.html" is never clipped by "…Service….dc.html".
const LINK_MAP = Object.entries(PAGES)
  .map(([src, p]) => [src, '/' + p.route.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '')])
  .sort((a, b) => b[0].length - a[0].length);

// Point the dc-runtime at local copies instead of unpkg.com. `window.__resources`
// is the runtime's own override hook (see cdnScriptFor in support.js).
const RESOURCES = `<script>window.__resources={"https://unpkg.com/react@18.3.1/umd/react.production.min.js":"/vendor/react.production.min.js","https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js":"/vendor/react-dom.production.min.js","https://unpkg.com/@babel/standalone@7.29.0/babel.min.js":"/vendor/babel.min.js"};</script>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function head(page) {
  const url = SITE + '/' + page.route.replace(/index\.html$/, '').replace(/\.html$/, '');
  return `<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="icon" type="image/png" href="/${page.mark}">
<link rel="apple-touch-icon" href="/${page.mark}">
<meta name="theme-color" content="#0E2B1C">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Ecosophy Spa">
<meta property="og:locale" content="en_AE">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${esc(url)}">
${RESOURCES}`;
}

const assets = new Set();

function buildPage(srcName, page) {
  let html = readFileSync(join(SRC, srcName), 'utf8');

  // Cross-page links, in both markup and the page's logic block (?s=… survives).
  for (const [from, to] of LINK_MAP) html = html.split(from).join(to);

  // Root-relative asset paths so every route resolves identically.
  html = html.replace(/(["'(])\.?\/?((?:assets|uploads)\/[^"')]+)/g, (_m, q, path) => {
    assets.add(decodeURIComponent(path));
    return q + '/' + path;
  });
  // A few images sit loose at the design-folder root rather than in assets/uploads.
  // Only rewrite names that actually exist there, so ordinary strings are left alone.
  html = html.replace(
    /(["'(])(?:\.\/)?([A-Za-z0-9._@%()+-]+\.(?:png|jpe?g|svg|webp|gif))(?=["')])/g,
    (m, q, file) => {
      if (!existsSync(join(SRC, file))) return m;
      assets.add(file);
      return q + '/' + file;
    },
  );

  html = html.replace(/(["'])\.\/(support|image-slot)\.js\1/g, '$1/$2.js$1');

  // The browser's preload scanner fetches src="{{ expr }}" literally, before the
  // runtime hydrates — one 404 per unresolved slot on every page view. The runtime
  // decodes `sc-camel-<name>` back to the real prop (kebabToCamel in encode.ts),
  // and the scanner ignores it, so the binding survives and the 404s go away.
  html = html.replace(/\ssrc=(["'])([^"']*\{\{[^"']*)\1/g, ' sc-camel-src=$1$2$1');

  // Real <head> metadata — present before any JS runs, so crawlers and tabs see it.
  // Must land *before* support.js: that script self-boots on execution and reads
  // window.__resources immediately, so a later assignment is a no-op.
  const boot = '<script src="/support.js"></script>';
  if (!html.includes(boot)) throw new Error(`${srcName}: support.js boot tag not found`);
  html = html.replace(boot, head(page) + '\n' + boot);

  const dest = join(OUT, page.route);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  return html.length;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const [srcName, page] of Object.entries(PAGES)) {
  const n = buildPage(srcName, page);
  console.log(`  ${page.route.padEnd(20)} <- ${srcName} (${(n / 1024).toFixed(0)} KB)`);
}

for (const rel of [...assets].sort()) {
  const from = join(SRC, rel);
  if (!existsSync(from)) { console.warn(`  ! missing asset: ${rel}`); continue; }
  mkdirSync(dirname(join(OUT, rel)), { recursive: true });
  copyFileSync(from, join(OUT, rel));
}
console.log(`  ${assets.size} assets copied`);

// image-slot.js fetches the slot state at runtime; without it every slot 404s.
for (const f of ['support.js', 'image-slot.js', '.image-slots.state.json']) {
  copyFileSync(join(SRC, f), join(OUT, f));
}
// Favicons: downscaled from the brand marks in favicons/, since the full-size
// assets are ~800 KB each and would be fetched on every page view.
mkdirSync(join(OUT, 'favicons'), { recursive: true });
for (const p of new Set(Object.values(PAGES).map((p) => p.mark))) {
  copyFileSync(p, join(OUT, p));
}

mkdirSync(join(OUT, 'vendor'), { recursive: true });
for (const f of ['react.production.min.js', 'react-dom.production.min.js', 'babel.min.js']) {
  copyFileSync(join('vendor', f), join(OUT, 'vendor', f));
}

writeFileSync(join(OUT, '_headers'), `/vendor/*
  Cache-Control: public, max-age=31536000, immutable
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/uploads/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`);

writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

const urls = Object.values(PAGES)
  .filter((p) => !p.route.startsWith('service') && !p.route.startsWith('gent-service.'))
  .map((p) => `  <url><loc>${SITE}/${p.route.replace(/index\.html$/, '').replace(/\.html$/, '')}</loc></url>`)
  .join('\n');
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

console.log('\nBuilt ' + OUT + '/');
