# Ecosophy Spa — website

Static site for Ecosophy Spa Dubai, deployed on Cloudflare Pages.

## Cloudflare Pages settings

Connect this repo in the Cloudflare dashboard with:

| Setting                | Value    |
| ---------------------- | -------- |
| Framework preset       | None     |
| Build command          | *(empty)* |
| Build output directory | `public` |
| Root directory         | `/`      |

`public/` is committed, so Cloudflare does not run a build — it just serves the
folder. Push to `main` and the site redeploys.

## Routes

| URL                        | Page                          |
| -------------------------- | ----------------------------- |
| `/`                        | Switcher — "Choose your world" |
| `/for-her`                 | Ecosophy Spa (women)          |
| `/for-him`                 | Ecosophy Gent Spa (men)       |
| `/services`                | Full menu & prices, for her   |
| `/gent-services`           | Full menu & prices, for him   |
| `/service?s=<slug>`        | One treatment, for her        |
| `/gent-service?s=<slug>`   | One treatment, for him        |

The two detail pages are single templates driven by the `?s=` slug, so all ~30
treatments per side are served by one file each.

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
