# Ecosophy Spa — website

Static site for Ecosophy Dubai — Beauty Lounge for her, Aesthetic Spa for him
— deployed on Cloudflare Pages.

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
| `/for-her`                 | Ecosophy Beauty Lounge (women)|
| `/for-him`                 | Ecosophy Aesthetic Spa (men)  |
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

### Tall sections on a phone

`/gallery` and `/gent-gallery` centre short copy inside very tall boxes
(`min-height:250–280vh` with `display:flex; align-items:center`) so the image
drift and the slat wipe have room to run. On a desktop the images are wide and
fill it; on a phone the copy is a few hundred pixels inside a box still ~2.8
screens tall, so it floats with a couple of screens of dead space above and
below. On a 390×844 phone THE CENTRE measured 2523px of section around 482px of
content — 2041px of nothing, which is what reads as a huge gap before the
heading and again before READY WHEN YOU ARE.

The `.gal-tall` class drops the floor under 760px. Both effects are driven by
each element's own position in the viewport, not by section progress, so the
floor costs nothing but the emptiness — THE CENTRE is 642px on a phone now and
unchanged at 2534px on desktop. Four sections carry the class: THE CENTRE on
both galleries, plus THE DETAILS and THE TREATMENTS on the gent one. Note that
the gent DETAILS section writes its properties in a different order
(`padding; overflow; min-height; display`), so match on the properties rather
than on a fixed string if you ever sweep for these again.

The pinned sections (`height:380vh` / `420vh` — the bath and the arrival) also
look mostly empty in a measurement, but that height *is* the scroll runway for
a sticky child. Leave those alone.

### The switcher cards, and a stale editor override

`/index` runs two full-bleed cards. Each carries a veil over the whole card and
a scrim under the copy; below 760px both are pulled back, because on a phone the
cards stack at ~267px while the copy block alone is ~368px and the two layers
compounded over the whole photograph. The gold wreath and the script line get
their legibility from a `drop-shadow` and a `text-shadow` instead, so the room
behind them stays visible.

The men's card also carries `.sw-veil--bright`, which darkens it further. That
is a patch over a content problem, not a design choice. **`sw-him` is being
served from an editor override, not from its `src`.** The markup says
`uploads/eco-him-reception.jpg` — the gent reception desk under the neon
wordmark, 960×1280 — but `public/.image-slots.state.json` holds an inline
`data:image/webp` for that slot, and the sidecar wins. What actually renders is
a **612×408 stock photo** of a man having a facial, upscaled to fill the card,
mean luminance 161 against the women's photograph at 137. That is why the same
gradient reads as far less of it on that side.

So: clearing the `sw-him` entry from the sidecar restores a real photograph of
the centre at more than four times the resolution, and `.sw-veil--bright` can
go with it. The override is content someone set through `?edit=1`, so it has
not been removed here. `tools/remove-dead-overrides.ps1` is the script for
pruning that file. Worth checking the other 29 slots in it for the same thing.

### The header badge

Every page runs the same fixed bar, and the badge in the middle of it behaves
the same way on all of them: a medallion at rest — the wreath in a bordered
disc with the wordmark beneath it, overhanging the bar — that collapses into a
compact row the moment the page moves, wreath and wordmark side by side, disc
gone, sitting inside the 66px band.

Twelve values drive that, all off `this.state.scrolled`:

| | rest | scrolled |
| --- | --- | --- |
| `badgeDir` | `column` | `row` |
| `badgeSize` | 78px / 54px phone | 40px / 34px phone |
| `badgeWordSize` | 26px / 22px phone | 22px / 19px phone |
| `badgeMarkFill` | `74%` | `100%` |
| `badgeGap` | `6px` | `10px` |
| `badgeWordAlign` | `center` | `flex-start` |
| `badgeTop` | 12px / 10px phone | 13px / 14px phone |
| `badgeCircleBg` / `Border` / `Shadow` | disc | all `none` |

Only the two home pages had them. The ten inside pages carried the *same
markup* with those values written in as constants, so their badge only ever
changed size — it stayed a column medallion, 81px tall against a 66px bar,
while the home page's collapsed to 40px. That is the difference you saw
scrolling from one to the other. All twelve are now measured identical:
`column/131px/1px border` at rest, `row/40px/no border` scrolled, at 1280 and
390.

One wrinkle if you touch these: the pages spell the phone test three different
ways — `heroMobile` on the galleries, `vw < 860` on About and Book,
`(this.state.vw || 1280) < 860` on Services and the treatment templates. They
mean the same thing, but a sweep that matches on a fixed string will silently
skip two thirds of the pages.

The badge's `href` is deliberately *not* uniform: the home pages point at `/`
(the switcher), the inside pages at their own side's home.

### The footer

Every page in a world carries the same footer, taken verbatim from that world's
home page: four columns — brand and address, CONTACT, HOURS, and a cross-link
to the other world — over the `#0B1F16` band with two faint marks behind it.
Byte-identical across all five pages on each side, so change `/for-her` or
`/for-him` and copy it out rather than editing one page in isolation.

`/gallery`, `/book` and both gent twins used to end on a slim one-line strip
(`.r-foot`) instead. Replacing it turned up two things the strip had been
hiding:

- **the opening hours contradicted themselves.** The strip said *Daily ·
  10:00 – 22:00*; every full footer said *Daily · 11:00 AM – 12:00 Midnight*.
  Both are now **Daily · 10:00 AM – 10:00 PM**, which is what the sign on the
  building says — the board by the gate reads WORKING HOURS 10 AM TO 10 PM, and
  /gallery's own copy already said "open daily from ten in the morning until
  ten at night". The midnight figure was in six of the footers and was simply
  wrong; standardising on it first, before the signage turned up, spread it to
  the other five. The hours live in the footer block on every page, so change
  them in `/for-her` and `/for-him` and copy the footer out.
- **the men's gallery and booking pages carried the women's WhatsApp number.**
  `/gent-gallery` hardcoded `+971 58 548 0899` and `/gent-book` defaulted to it.
  Both now use `+971 50 444 5566`. The numbers are per world and easy to get
  wrong when a page is copied: her is `+971 58 548 0899`, him is
  `+971 50 444 5566`.

The footer prints `{{ whatsapp }}`, so a page that carries it has to expose that
binding — `/gallery` and `/gent-gallery` only had `waHref` and needed
`whatsapp: wa` adding beside it.

`/index` is the world switcher and keeps its own slim strip: it belongs to
neither side, and its links are the two worlds. Only its hours were brought in
line.

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

**One louvre surface, not two.** A full-width half circle is about 50vw tall,
but the louvres it rises through sit inside the hero, and the hero ends only
20vh below the panel top. So the green ran out partway through the sweep: the
arc met the hero's bottom edge, turned into a hard horizontal line, and left
what looked like two empty wedges in the bottom corners.

Painting a second, static copy of the shut-louvre gradient behind the arch
fixed the wedges and introduced a worse problem. It matched only while the
louvres were shut; the moment they were mid-swing the hero band was moving and
the band below it was not, and the two read as separate sections. Do not go
back to that.

Instead the louvres themselves run past the hero: `height:220vh` on the
`[data-gblinds]` element rather than `inset:0`, and the hero drops its own
`overflow:hidden` so they can escape it. The photo, which is inset -14% and
scales to 1.18, gets a clip of its own instead; on the two detail templates the
watermarks get one too, since the lower one is offset past the bottom edge. The
arch panel is opaque and sits in a later sibling at `z-index:2`, so the extra
louvre length shows in exactly one place — inside the panel's rounded corners —
and the curve completes on the same surface it started on.

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

### The library is duplicated — read this before adding photos

`public/uploads/` holds **115 files for about 70 distinct photographs.** Nearly
the whole library exists twice: every `eco-her-spa-*`, `eco-her-beauty-*` and
`eco-him-NN` is a byte-for-byte second copy of a photo that was already there
under a descriptive name. A fingerprint sweep finds 44 duplicate pairs —
`gent-gal-hero.jpg == eco-him-14.jpg`, `eco-her-hammam-1.jpg == eco-her-spa-01.jpg`,
and so on down the list.

This matters beyond disk. The point of the split below is that a visitor moving
from a home page to its gallery does not see the same pictures twice — and that
guarantee is only as good as the filenames, because two names for one photograph
defeat every check that compares them. Before adding an image, fingerprint it
against what is already there rather than trusting the name.

Consolidating is a job of its own: pick the descriptive name in each pair, point
every reference at it, delete the copy. Nothing below has been re-verified
against the duplicates.



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

**For him the two sets now share exactly one photograph**: the lounge shot
`photo_2026-08-02_19-37-25.jpg`. The gallery slot for it is captioned “The
gentlemen’s lounge” and nothing else in the men’s library is that room, so the
choice was to share it or to caption a reception desk as a lounge. The nearest
alternative, `eco-him-12`, is the same desk as `gent-gal-centre-1` and would
have rebuilt the duplication this replaced. `/index` uses a third
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

### The men’s Moroccan bath

Every Moroccan Bath image on the men’s side used to be
`hf_20260827_121534…png` — an AI render of a round sunken bath. It was the one
synthetic frame on a rail of real photographs and read as such, so it is gone:
the hero rail card, the reel still, the menu card, the catalogue category and
`ECO.him.imgs.bath` (the hero behind every bath treatment page) all point at one
photograph now. The render is deleted — 5.9 MB, the heaviest file in `uploads/`
— and recoverable from git.

The replacement took two goes, which is worth recording. The obvious choice was
the bath itself (`eco-him-14.jpg`, the tub); at card size it read as a bathroom
rather than a hammam. The card carries the wet room instead (`eco-him-07.jpg`
— the bench, glass shower and leaf wall), which also makes the rail consistent,
since MASSAGE, THE CENTRE and SAUNA are all empty rooms.

The gent film does hold real bath-ritual frames — a therapist scrubbing a client
on the heated slab, roughly 20–27s into `gent-gal-video.mp4` — if a photograph
of the treatment is ever wanted in place of a room.

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
