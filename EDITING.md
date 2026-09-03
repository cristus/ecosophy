# Editing the site from the site

Text and pictures can be changed on the live site itself — no rebuild, no
redeploy, no touching the design files. Turn edit mode on, change what you want,
press Save, turn it off. Visitors see the change on their next page load.

## Using it

1. Open any page and add `?edit=1` to the address, e.g.
   `https://ecosophy.pages.dev/for-her?edit=1`
   (or press **Ctrl+Shift+E** on any page).
2. Type the editor password once per browser session.
3. Everything editable gets a dashed outline:
   - **Click a line of text** → it becomes typeable. **Enter** saves it,
     **Escape** cancels.
   - **Click a picture** → pick a new file. Or just **drag a photo onto it**.
   - **Alt+click** anything → put the original back.
4. Press **Save** (or Ctrl+S). The bar says *"Saved — it is live on the site now."*
5. Press **Exit** to leave edit mode. Edit mode stays on while you browse from
   page to page, so you can walk the whole site fixing things, then exit once.

Nothing is published until you press Save. If you close the tab with unsaved
changes the browser warns you, and the changes are kept in that browser until
you come back and save them.

### Notes

- Photos are resized to 2200px and converted to WebP in the browser before
  upload, so a 7 MB phone photo lands as a few hundred KB. Upload cap: 12 MB.
- Each treatment page (`/service?s=...`) is edited per treatment — the slug is
  part of what gets saved.
- **Undo all** reverts every edit on the page you're looking at.
- **Download** saves the whole overrides file as `content.json` — a backup, and
  the way to move edits between environments.

## How it works

- `editor/edit.js` (copied to `public/edit.js` by the build) loads on every page.
  It fetches `/api/content` and paints the saved overrides over the rendered
  page. The site is client-rendered and re-renders itself, so a MutationObserver
  re-applies the overrides after every render pass.
- Each edit is keyed by the element's position in the DOM, with the original
  text/image URL kept alongside as a fallback matcher — so an edit usually
  survives a redesign of the surrounding page, and simply stops applying if the
  element is gone.
- `functions/api/*` is the backend, running on Cloudflare Pages Functions:

  | Route | Does |
  | --- | --- |
  | `GET /api/content` | the overrides every visitor reads |
  | `PUT /api/content` | save (password required) |
  | `POST /api/upload` | store one picture, returns its permanent URL |
  | `GET /api/img/<hash>.<ext>` | serve a stored picture, cached forever |
  | `POST /api/session` | password check, so edit mode can refuse entry early |

- Everything lives in one KV namespace. Images are keyed by a hash of their
  bytes, so the same photo uploaded twice costs one copy. Every save also writes
  a 30-day backup copy under `content:v1:backup:<timestamp>`.

## One-time Cloudflare setup

The KV namespace already exists — **ECO_CONTENT**, id
`cf3148c668344daca4b61162f2c0907f`, on the `Webservices@turquoic.com` account.
It just needs attaching to the Pages project:

1. Cloudflare dashboard → **Workers & Pages → ecosophy → Settings → Bindings**
   → *Add* → **KV namespace**
   - Variable name: `ECO_CONTENT`
   - KV namespace: `ECO_CONTENT`
   - Add it for **Production** and **Preview**.
2. Same Settings page → **Variables and Secrets** → *Add*
   - Name: `ECO_EDIT_PASSWORD`
   - Type: **Secret**
   - Value: whatever password you want to type when editing.
   - Again for **Production** and **Preview**.
3. Redeploy (or just push anything to `main`) — bindings apply to new
   deployments, not to ones already built.

Until step 1 and 2 are done, the site renders exactly as it does today and edit
mode says the editor is not configured yet. To change the password later, edit
that secret and redeploy.

## Security

The password is checked on the server for every save and upload; it is held in
`sessionStorage` for the tab and sent over HTTPS as a header. It gates writes
only — the overrides themselves are public, which they must be, since they are
the site's content. Anyone who learns the password can change the site's words
and pictures, so treat it like the CMS login it is.

## Running it locally

```sh
npx wrangler pages dev public --kv=ECO_CONTENT --binding=ECO_EDIT_PASSWORD=test123
```

Then open http://127.0.0.1:8788/for-her?edit=1 and use `test123`. Local KV is a
separate store, so nothing you do there touches the live site.

With no backend at all (opening the files directly), edit mode still works: it
keeps edits in the browser and inlines replaced images, and **Download** gives
you a `content.json` you can commit to `public/` as a static fallback — the
client reads that when `/api/content` is unavailable.
