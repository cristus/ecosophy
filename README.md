# Ecosophy Spa — website

Static site for Ecosophy Spa Dubai, deployed on Cloudflare Pages.

## Deploying

The Pages project (`ecosophy`, account `Webservices@turquoic.com`) is **direct
upload — it is not connected to this repo**. Pushing to `main` deploys nothing.
To publish:

```sh
CLOUDFLARE_ACCOUNT_ID=bd249d898ce1822059b90ccb00734a5e \
  npx wrangler pages deploy public --project-name=ecosophy --branch=main
```

That uploads `public/` and bundles `functions/` (the content editor's backend)
into the deployment. Push to `main` as well, so the repo matches what is live.

Bindings — the `ECO_CONTENT` KV namespace and the `ECO_EDIT_PASSWORD` secret
that the editor needs — live on the project in the dashboard and apply to each
new deployment. See [EDITING.md](EDITING.md).

## Routes

| URL                        | Page                          |
| -------------------------- | ----------------------------- |
| `/`                        | Switcher — "Choose your world" |
| `/for-her`                 | Ecosophy Spa (women)          |
| `/for-him`                 | Ecosophy Gent Spa (men)       |
| `/services`                | Full treatment menu, for her  |
| `/gent-services`           | Full treatment menu, for him  |
| `/service?s=<slug>`        | One treatment, for her        |
| `/gent-service?s=<slug>`   | One treatment, for him        |

`/menu-prices` and `/gent-menu-prices` — the TREATMENT MENU pages — were
removed. They listed the same treatments as `/services` and `/gent-services`
with a duration each and no photographs, and the two pairs had grown confusing
enough that the nav offered two links to what read as the same thing. Their
URLs 301 to the services pages from `public/_redirects`, which `build.mjs`
also writes, because a route that simply disappears is served the switcher page
with a 200 by Pages — a soft 404 that neither a visitor nor a crawler can read
as "moved".

The two detail pages are single templates driven by the `?s=` slug, so all ~30
treatments per side are served by one file each.

## The service menu

Every treatment on the site comes from one file, `data/catalog.js` (copied to
`public/catalog.js` by the build, and loaded by every page as `/catalog.js`).
It holds both sides of the house:

| | For her | For him |
| --- | --- | --- |
| Categories | 10 | 5 |
| Treatments | 89 | 45 |

The two home pages, the two services pages, the two booking pages and the two
treatment-detail templates all read it, so:

- **a name or a description** is changed once, and every page follows;
- **a new treatment** is one `S(...)` row inside the right category;
- **a new category** is one `C({...})` block. Give its treatments a `type` that
  exists in the TYPES table lower down in the same file — that is what fills in
  the detail page's steps, inclusions, benefits, reviews and FAQ.

Duration may be left blank; the pages then show *BY REQUEST* rather than a
made-up number.

### No prices

The site does not publish prices. No figure is stored in `catalog.js` and no
page renders one, so the services lists, the treatment pages, the menu pages,
the home-page ritual menus and the WhatsApp messages the booking forms compose
all go out without a number. WhatsApp is where a price is quoted.

`S(...)` still takes a fourth argument, the old price slot, and it is
deliberately not read — filling one in would do nothing on its own. Putting
prices back means restoring that field in `S()`, in `flat()`, `menuCats()` and
`homeCats()`, and re-adding the render sites the pages used to have.

Note that `build.mjs` regenerates the pages from the Claude Design sources in
`ref/`, which are **not** committed and do not know about `catalog.js` — nor
about the price removal, the inside-page hero polish or the photo split below,
all applied to `public/` directly for the same reason. A rebuild would put the
old inline treatment lists, the prices, the old heroes *and* the duplicated
photography back. Either re-apply all four to the regenerated pages, or bring
the design sources in line first.

### The inside-page heroes

All ten inside pages — both galleries, both books, both menus, both service
lists and both treatment templates — now share one hero **geometry**, and it is
the thing to preserve when any of them is touched:

| | value |
| --- | --- |
| Hero height | `132vh`, floor `640px` |
| Overlap on the panel below | `margin-top:-20vh` |
| So the arch panel's top sits at | `112vh` |

That last number is the whole point: the panel starts 12vh *below* the fold, so
the hero stands whole at rest, the louvres get their moment closing over it,
and only then does the arch rise through the shut shutter. Measured on every
page at 1280/1440/1920/1024/768/390 it is 1.12 everywhere.

Three of them used to break it, each differently, and all three read as "the
parallax is off":

- the **galleries** carried a `-70vh` overlap against a `155vh` hero (and
  briefly `-47vh` against `132vh`, which preserves the same wrong result). The
  panel sat at `85vh`, i.e. already 15vh up the screen before a wheel was
  touched — the hero never stood whole and the arch covered the louvres before
  they finished closing;
- **`/services`** was content-sized (`min-height:88vh`), so its height moved
  with the viewport: the panel landed at 94vh at 1920 and 87vh at 768. It is
  now the fixed hero, and needs `box-sizing:border-box` because it keeps its
  flex padding — without that the padding is added *outside* `height:132vh` and
  the panel drops to 1.46vh instead;
- **`/service`** is a two-column grid whose height followed its content, and on
  a phone the arch covered the BOOK THIS TREATMENT button. It takes
  `min-height:132vh` (not `height` — a long treatment name must still be able
  to push it taller). Its stacked breakpoint also pins `grid-template-rows:44vh
  1fr`, so the floor's slack goes to the text row instead of stretching both
  rows and letting the photo eat the screen.

### One hero template

The three menu pages — **ALL SERVICES, GALLERY, BOOK** — and their three For
Him twins now render the *same* hero. Only two things change
from page to page: **the photograph and the words.** Everything else comes from
the template:

| | |
| --- | --- |
| Container | `isolation:isolate; height:132vh; min-height:640px; background:#0E271C; overflow:hidden` |
| Louvres | `data-gblinds="52"`, `z-index:1` |
| Photo layer | `data-gy="0.16" data-gs="1.06,1.18"`, `inset:-14% 0`, `opacity:.42` |
| Wash | `linear-gradient(180deg,rgba(14,39,28,.55),rgba(14,39,28,.95))` |
| Copy | `data-gherocopy="0.22,0.5,0.35"`, `z-index:4`, `height:100%`, centred, `padding:0 22px` |
| Eyebrow | `.<p>-rise .<p>-eyebrow`, delay `.15s`, "ECOSOPHY · FOR HER/HIM" |
| Heading | Italiana 400, `clamp(40px,7vw,92px)`, `.05em`, `#E4C778`, `line-height:1.06`, `margin:16px 0 0`, `text-shadow:0 8px 34px rgba(0,0,0,.7)` |
| Lead | `13.5px/1.95`, `#A9B8AB`, `max-width:46ch`, `margin-top:16px` |
| Scroll cue | `var(--fs-md)`, `2.6px`, `#9FB0A0`, `margin-top:22px` |
| Arch below | `data-garch="50,21"`, `margin-top:-20vh` |

The `<p>` prefix is per page (`mp-`, `svc-`, `gal-`, `bk-`); the three classes
behind it are byte-identical, so the rise animation and eyebrow are the same
everywhere. `/services` had no rise keyframe at all until this pass.

Before it, each of the four had drifted its own way: `/gallery` ran a bespoke
two-layer wash with the photo at full opacity, a `#F4EFE3` heading split into
two colours at `clamp(42px,7.4vw,104px)`, and drove its copy with
`data-gy`/`data-gfadeout` centred in `100vh` rather than the section;
`/services` wore a `Great Vibes` "for her" eyebrow, a `.02em` heading with no
text-shadow, its own lead colour, and carried the whole hero on flex padding.
If you add a fourth menu page, copy the block — do not re-derive it.

**The two treatment templates** (`/service`, `/gent-service`) share the
geometry, the louvres, the photo parallax, the wash, the copy driver and the
heading colour, weight, letter-spacing and shadow — but keep their own
two-column layout, breadcrumb, stats and CTA pair, and a heading that ramps to
`clamp(34px,4.6vw,64px)` because it sits in a half-width column and has to hold
a long treatment name. That is deliberate: they are detail headers, not page
headers, and the brief was to even out the hero, not restructure the content.

The copy carries `data-gherocopy="drift,window,fade_start"` and `z-index:4`. It
used to sit *under* the gold louvres, so the closing shutter swallowed the
heading whole the moment the page moved. It now rides above them, drifts
downward as the hero scrolls away, and fades only at the end of that travel.
The effect lives in the per-page scroll engine, beside the louvres.

### The arch, and why it is 50 and not 66

The panel below the hero rises through the shut louvres as a dome that flattens
into a shallow arc. Two numbers drive it, and both matter:

- **`data-garch="50,21"`** — the top-corner radius as a percentage of viewport
  width, start to end. **50 is the ceiling, not a taste choice.** The radius is
  applied to both top corners, so at 50% the pair spans the whole width and the
  panel is a *true half circle*. Anything above that the browser scales back
  down to fit, so `66` and `50` render the identical semicircle — the extra 16
  points were pure dead travel. The old ramp spent its first third there, which
  is why the arch appeared to sit still and then collapse: it read as a jump,
  not a transition.
- **`clamp((vh * 0.62 - rg.top) / (vh * 0.30), 0, 1)`** — the ramp window,
  measured on the panel's own top edge. The half circle is held until the panel
  covers 38% of the screen, then eases flat over the next 30vh of travel. Two
  earlier values were wrong for the same reason in different degrees: `1.05vh`
  started the collapse above the fold, and `0.86vh` still had it collapsing while
  the panel was a 3-13% sliver at the bottom edge — round, but far too small to
  read as a dome. The number to protect is how much screen the panel covers
  while it is still a half circle, not when the ramp begins.

Together: the panel enters the viewport as an exact half circle, stays one all
the way up to covering 38% of the screen, then eases to the shallow arc.
Verified on every page carrying an arch — entry radius is exactly half the
viewport width at 1920, 1280, 768 and 390.

If you change the start value, changing it *up* does nothing visible. Down is
the only direction with an effect, and it costs you the half circle.

`/services` and `/gent-services` used to open their arch panel on a shallower
curve (`data-garch="40,21"`) because the filter bubbles sat flush against the
top edge of the panel, where a 66vw dome cut the first of them — and the first
category — off at the left. The top padding added to the catalogue at the same
time is what actually fixed that, so the shallow curve is no longer needed:
both pages are back on the shared arch value. Measured across a scroll sweep at
1280/768/390 the widest dome and the clearance over the bubbles are the same
either way. Keep the catalogue's top padding — that is the load-bearing half.

## Editing text and pictures

Add `?edit=1` to any URL (or press Ctrl+Shift+E), type the editor password, and
click any line of text or any picture to change it — then Save. It goes live
immediately, without a rebuild or a redeploy. See [EDITING.md](EDITING.md) for
the whole thing, including the one-time Cloudflare binding setup.

## Rebuilding

The pages are authored as Claude Design canvas files (`.dc.html`) in
`ref/Ecosophy Spa Website Design/`, which is **not** committed — it is ~118 MB of
design working files and lives in OneDrive. To regenerate `public/` after editing
a design file, with that folder present locally:

```sh
node build.mjs
```

`build.mjs` does the following:

- maps each `.dc.html` source to its route and rewrites cross-page links,
  including the `?s=` links generated inside each page's logic block
- rewrites asset paths to root-relative so every route resolves identically
- copies only the assets actually referenced (22 files, ~22 MB — the source
  `uploads/` folder holds 142 files, most of them design scratch)
- injects `<title>`, meta description, Open Graph tags, canonical URL and a
  favicon into each page's real `<head>`, before any JS runs
- points the runtime at `vendor/` instead of unpkg.com (see below)
- writes `_headers`, `robots.txt` and `sitemap.xml`

## How the pages render

`support.js` is the Claude Design runtime. It boots on load, renders the page
with React, and needs React + `@babel/standalone` to do it. By default it fetches
those from unpkg.com on every page view.

`vendor/` holds local copies (verified against the SRI hashes baked into
`support.js`), and the build injects the runtime's own `window.__resources`
override so it loads them from this origin. The site therefore has **no
third-party runtime dependency** — an unpkg outage cannot take it down.

## The photography

Each side of the house has two photo-heavy pages — a home page (the parallax
hero rail, the ritual reels, the menu cards) and a gallery — and they are kept
on **separate photo sets** on purpose. The gallery used to be a straight re-run
of the home page: the same twenty photographs saved a second time under
`gal-*` / `photo_*` names, so a visitor scrolling from `/for-her` to `/gallery`
saw the same pictures twice.

Now every photograph has **one canonical filename** and belongs to one page:

| | Home page | Gallery |
| --- | --- | --- |
| For her | `eco-her-room-*`, `-makeup-2`… (23) | `eco-her-hammam-3`, `-portrait-*`… (23) |
| For him | `775244964`, `imgi_*`, `eco-him-machine`… (14) | `gent-gal-*` (20) |

**For him the two sets are completely disjoint**, and `/index` uses a third
photo (`eco-him-reception.jpg`) that neither page shows.

**For her thirteen photographs appear on both pages.** Nine of those are
unavoidable — the two hammam angles, the facial room, both nails, both hair,
the jacuzzi and the trolley are categories with exactly one usable frame each
in the whole library, and both pages have to show the category. The other four
(`-makeup-1`, `-massage-1`, `-robe`, `-products-3`) drifted back in later, when
the offer card's thumbnails and a fan pair were re-pointed at gallery photos;
they can be swapped out against the home-page set whenever that card is next
touched. Closing the unavoidable nine needs new photography, not re-shuffling —
the `images/` folders are fully deployed, and the only unused frames left are a
near-identical second exterior and three stock Unsplash shots the site
otherwise avoids.

### The gallery hero

`/gallery` and `/book` used to open on the *same* photograph, one of them
ungraded, so the two pages read as two versions of one screen. `/gallery` now
opens on `eco-her-hammam-3.jpg` — the lit arch, the brass taps and the
candlelit marble — under a green wash matched to `/book`'s, and both heroes run
at `132vh` over a `640px` floor.

That photo is a still lifted from `images/for ecosophy beauty center web
site/video moroccan bath/IMG_3245.MOV` at 22.4s, which is the only source in
the library that shows the whole bath room. Being phone footage it is 9:16, so
a wide hero cropping it dead-centre lands on bare tile — hence the
`object-position:50% 62%` on that `<img>`. Keep it if the photo is re-exported;
drop it only if the replacement is landscape.

Rules to keep it that way:

- **A photo belongs to one page.** Before adding one to a home page, check it
  is not in that side's gallery, and vice versa.
- **No two frames of the same shoot side by side.** Pixel comparison will not
  catch these — the same client in the same outfit scores as low as `r=0.25`.
  Look at the grid.
- **One file per photograph.** Re-saving the same shot under a new name is how
  the duplication happened in the first place.

## Known follow-ups

- The site is client-rendered: the HTML is a template until JS runs, so search
  engines see very little page content. The `<head>` metadata is static and
  crawlable, but the body is not.
- `@babel/standalone` is 3.1 MB and transpiles in the browser on every load.
  Precompiling at build time would remove it entirely and cut load time sharply.
- Hero images are large (up to 7 MB PNG). Converting to WebP/AVIF would be the
  single biggest speed win.
- The For Her home page and gallery share thirteen photographs. Four are
  swappable today; the other nine are categories with only one frame each and
  need a shoot, not code. See **The photography** above.
- No Open Graph share image yet, so WhatsApp and Instagram link previews show no
  picture — worth adding since WhatsApp is the booking channel.
