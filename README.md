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

The two home pages, the two services pages, the two menu & prices pages, the two
booking pages and the two treatment-detail templates all read it, so:

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
about the price removal, which was applied to `public/` directly for the same
reason. A rebuild would put the old inline treatment lists *and* the prices
back. Either re-apply both to the regenerated pages, or bring the design
sources in line first.

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

## Known follow-ups

- The site is client-rendered: the HTML is a template until JS runs, so search
  engines see very little page content. The `<head>` metadata is static and
  crawlable, but the body is not.
- `@babel/standalone` is 3.1 MB and transpiles in the browser on every load.
  Precompiling at build time would remove it entirely and cut load time sharply.
- Hero images are large (up to 7 MB PNG). Converting to WebP/AVIF would be the
  single biggest speed win.
- 13 images are hot-linked from images.unsplash.com rather than served locally.
- No Open Graph share image yet, so WhatsApp and Instagram link previews show no
  picture — worth adding since WhatsApp is the booking channel.
