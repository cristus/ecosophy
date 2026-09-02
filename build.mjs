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
  'Ecosophy Gallery.dc.html': {
    route: 'gallery.html',
    video: 'gal-video.mp4',
    title: 'Gallery — Ecosophy Spa for Her, Dubai',
    description: 'Inside Ecosophy: the hammam, jacuzzi, sauna, treatment rooms and bridal work, photographed where they happen.',
    mark: 'favicons/mark-woman-gold-180.png',
  },
  'Ecosophy Gent Gallery.dc.html': {
    route: 'gent-gallery.html',
    video: 'gent-gal-video.mp4',
    title: 'Gallery — Ecosophy Gent Spa, Dubai',
    description: "Inside the gentlemen's side: hammam, sauna, treatment rooms, grooming and recovery, photographed where they happen.",
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

// Serve React and Babel from this origin instead of unpkg.com by defining the
// globals before support.js runs: loadReactUmd() short-circuits on
// `window.React && window.ReactDOM`, and ensureBabel() on `window.Babel`, so the
// runtime never reaches for the CDN.
//
// Do NOT do this via the runtime's `window.__resources` hook. Setting that object
// also suppresses boot()'s `fetch(location.href)` pass, which re-parses the page's
// pristine source text and calls updateHtml() with it. Without that pass the
// runtime keeps the DOM-parsed template, which loses interpolations such as the
// hero fan's `width:{{ c.w }}` — the cards then render zero-width and collapse.
const RESOURCES = `<script src="/vendor/react.production.min.js"></script>
<script src="/vendor/react-dom.production.min.js"></script>
<script src="/vendor/babel.min.js"></script>`;

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

// Ten Unsplash photos backed all ~50 remaining stock slots across the site.
// <image-slot> refuses to render an Unsplash-hosted image with no credit — it
// shows a "This photo needs attribution" tile instead — so the credit captions
// could not simply be hidden. Swapping in Ecosophy's own photography removes
// both the caption and the reason for it. Keyed by Unsplash photo id; the pages
// store these as full URLs, so one substitution reaches every page.
const STOCK = {
  '1544161515-4ab6ce6db874': 'uploads/eco-her-massage-1.jpg', // massage
  '1544843776-7c98a52e08a4': 'uploads/eco-her-hammam-1.jpg', // moroccan bath
  '1570172619644-dfd03ed5d881': 'uploads/eco-her-facial-1.jpg', // facial
  '1515377905703-c4788e51af15': 'uploads/eco-her-robe.jpg', // facial / hydrafacial
  '1560932992-a93e9ca8a0c9': 'uploads/eco-her-products-1.jpg', // body / scrub
  '1522337360788-8b13dee7a37e': 'uploads/eco-her-nails-1.jpg', // nails & brows
  '1540555700478-4be289fbecef': 'uploads/eco-her-jacuzzi-1.jpg', // spa / jacuzzi
  '1636525653613-2a3a05c00759': 'uploads/hf_20260827_171947_1e9875d7-e5ab-4df5-b12e-8cd204eda2cb.png', // botanical bg
  '1600334129128-685c5582fd35': 'uploads/eco-her-massage-2.jpg', // about
  '1696841212541-449ca29397cc': 'uploads/eco-him-door.jpg', // men's world door
};

// Fallback video filename, used when a gallery has no page-specific file of its
// own. Both live in the design folder's uploads/.
const GALLERY_VIDEO = 'gal-video.mp4';

const assets = new Set();

function buildPage(srcName, page) {
  let html = readFileSync(join(SRC, srcName), 'utf8');

  // Cross-page links, in both markup and the page's logic block (?s=… survives).
  for (const [from, to] of LINK_MAP) html = html.split(from).join(to);

  // Stock photography -> Ecosophy's own. Must run BEFORE the asset scan below,
  // or a replacement referenced from nowhere else never gets copied and 404s.
  // A trailing ?q=..&w=.. on a local file is harmless, so only the base URL is
  // matched and whatever the page appends is left alone.
  for (const [id, local] of Object.entries(STOCK)) {
    html = html.split('https://images.unsplash.com/photo-' + id).join(local);
  }

  // Collect referenced images, but DO NOT rewrite their paths. Each page's logic
  // decides "local file vs Unsplash photo id" by testing the raw string, e.g.
  //   p[0].charAt(0) === '.' || p[0].indexOf('uploads/') === 0
  // so rewriting `uploads/x.jpg` to `/uploads/x.jpg` makes both tests fail and the
  // image silently becomes a bogus images.unsplash.com URL. Every route lives at
  // the site root, so the paths as authored already resolve correctly.
  for (const m of html.matchAll(/(?:assets|uploads)\/[A-Za-z0-9._@%()+-]+/g)) {
    assets.add(decodeURIComponent(m[0]));
  }
  // A few images sit loose at the design-folder root rather than in assets/uploads.
  for (const m of html.matchAll(/["'(](?:\.\/)?([A-Za-z0-9._@%()+-]+\.(?:png|jpe?g|svg|webp|gif))(?=["')])/g)) {
    if (existsSync(join(SRC, m[1]))) assets.add(m[1]);
  }

  // The gallery's video section ships with only a poster until a file exists.
  // A <video> with no source shows its poster and requests nothing, so dropping
  // gal-video.mp4 into the design folder is all it takes to turn the section on.
  if (html.includes('data-novideo')) {
    // Prefer the page's own file; fall back to the shared one so a single clip
    // can serve both galleries.
    const candidates = [page.video].filter(Boolean);
    const found = candidates.find((f) => existsSync(join(SRC, 'uploads', f)));
    if (found) {
      assets.add('uploads/' + found);
      html = html.replace('data-novideo', 'src="uploads/' + found + '"');
      console.log(`  video:  uploads/${found} -> ${page.route}`);
    } else {
      html = html.replace('data-novideo', '');
      console.log(`  video:  none for ${page.route} (looked for ${candidates.join(', ')}) — poster only`);
    }
  }

  // Strip photo-credit badges. <image-slot> paints an overlay caption whenever
  // `credit` is non-empty, which surfaced "Photo by ... on Unsplash" on top of
  // the thumbnails on hover. The strings come from two places — literal
  // attributes and {{ }} bindings fed by each page's photo tables — so blank the
  // attribute itself and both are covered at once. credit-href goes first, since
  // the credit pattern would otherwise match its prefix.
  html = html.replace(/\scredit-href="[^"]*"/g, ' credit-href=""');
  html = html.replace(/\scredit(?!-href)="[^"]*"/g, ' credit=""');

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
for (const f of ['support.js', 'image-slot.js']) copyFileSync(join(SRC, f), join(OUT, f));

// The slot state pins images as embedded data URIs, which win over the `src`
// attribute. `sw-him` is pinned to the men's door image; leave it alone — the
// homepage doors are meant to stay as they were.
const PINS_TO_DROP = new Set();
const slotState = JSON.parse(readFileSync(join(SRC, '.image-slots.state.json'), 'utf8'));
for (const k of PINS_TO_DROP) delete slotState[k];
writeFileSync(join(OUT, '.image-slots.state.json'), JSON.stringify(slotState));
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
