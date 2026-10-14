# alchamentry-web

The landing page for **[alchamentry.com](https://alchamentry.com)** — the studio
index for three products in production:

| Product | Live at | What it is |
| --- | --- | --- |
| Remote Days | [remotedays.app](https://remotedays.app) | Cross-border remote work compliance for employers in Luxembourg |
| Dentra | [dentra.fly.dev](https://dentra.fly.dev) | Practice management for dental clinics in India |
| Toolbit | [toolbit.app](https://toolbit.app) | A local-first developer toolbox, 42 tools, MIT |

The design reasoning lives in **[DESIGN.md](./DESIGN.md)**. Read that before
changing anything visual.

![alchamentry.com](docs/preview-hero.png)

---

## How it is put together

No framework, no bundler, no runtime dependencies. `src/` is the site; `dist/` is
what gets deployed. The build copies one to the other, renames `site.css` and
`site.js` to `site.<hash>.css` / `site.<hash>.js` and rewrites every reference, then
swaps in three tokens (`{{YEAR}}`, `{{BUILD}}`, `{{BUILD_DATE}}`). That is the
entire pipeline.

```
src/
  index.html              the page
  404.html                served by Pages for anything not found
  _headers                CSP and cache policy — Cloudflare Pages reads this
  robots.txt  sitemap.xml  site.webmanifest
  og.png  favicon.svg  favicon.ico  icon-*.png  apple-touch-icon.png
  assets/
    css/site.css          one stylesheet, tokens at the top
    js/site.js            ~25 lines; a hairline on the sticky header
    products/             the three product marks
    alchamentry-mark*.svg the studio mark, generated — see below
  fonts/                  Inter Tight + JetBrains Mono, self-hosted, woff2
scripts/
  build.mjs               src/ -> dist/, with content hashing
  mark.mjs                generates the studio mark (the geometry lives here)
  serve.mjs               tiny static server for local check
```

Everything the page needs is same-origin — no CDN, no analytics, no third-party
requests, no cookies. The `_headers` file ships a strict Content-Security-Policy
that allows exactly that.

### Why the CSS and JS are hashed

Cloudflare Pages applies its own 4-hour `Cache-Control` to recognised asset
extensions, and that `max-age` beats anything set in `_headers`. A 4-hour cache is
only safe on a URL that changes when the file does, so the build puts a content
hash in the filename. `_headers` documents the rest of the policy, including the
one genuinely surprising rule: never set the same header in two overlapping
`_headers` blocks, because Pages joins the values rather than choosing one.

## Local development

```sh
npm run dev        # build, then serve http://localhost:4173
```

`npm run build` on its own writes `dist/`. `npm run serve` serves an existing
`dist/`. There is nothing to install to build the site — `npm run dev` works in a
fresh clone.

## Deployment

Production is a **Cloudflare Pages** project called `alchamentry`, with
`alchamentry.com` and `alchamentry.pages.dev` attached to its `main` branch. The
project is a Direct Upload project; it is not connected to Git on Cloudflare's
side. GitHub Actions is the only deployment path.

`.github/workflows/deploy.yml`:

- **push to `main`** → builds and deploys to production
- **pull request** → builds and deploys a preview to that branch, then comments the
  URL on the PR
- **workflow_dispatch** → same as a push to `main`

Preview deployments on `*.alchamentry.pages.dev` are covered by a Cloudflare Access
policy on the account, so preview URLs ask for a login before they render. That is
the existing project setting, not something this repo adds. Production
(`alchamentry.com` and `alchamentry.pages.dev`) is public.

### Required repository secrets

| Secret | Where to get it |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** template, then add the **Cloudflare Pages: Edit** permission |
| `CLOUDFLARE_ACCOUNT_ID` | `7eab50fe896772eef60711eca3392763`, or the account ID in any Cloudflare dashboard URL |

Set them with:

```sh
gh secret set CLOUDFLARE_API_TOKEN --repo <owner>/alchamentry-web
gh secret set CLOUDFLARE_ACCOUNT_ID  --repo <owner>/alchamentry-web
```

### Deploying by hand

With `wrangler` authenticated locally (`npx wrangler login`):

```sh
npm run deploy     # build, then `wrangler pages deploy` using wrangler.toml
```

## Editing

- **Copy** is in `src/index.html`. Keep the voice from DESIGN.md §1: plain,
  specific, no marketing adjectives.
- **Colour, type and spacing** are CSS custom properties at the top of
  `src/assets/css/site.css`. Change them there, not at the point of use.
- **Product facts** are the one thing most likely to go stale. Remote Days'
  thresholds, Dentra's features and Toolbit's tool count come from the products
  themselves — re-check them when a product changes.

### The mark

`scripts/mark.mjs` is the source of truth for the logo's geometry — the numbers at
the top of that file are the design, and the comments explain why each one is what
it is. Nothing in the site build runs it.

```sh
npm run mark     # rewrites src/assets/alchamentry-mark*.svg and src/favicon.svg
```

After changing the geometry, re-export the raster icons (they are committed, and
nothing generates them automatically):

- `favicon.ico` (16/32/48), `icon-192.png`, `icon-512.png` — from `src/favicon.svg`
- `apple-touch-icon.png`, `icon-maskable-512.png` — from `src/assets/alchamentry-plate-bleed.svg`
- `og.png` — 1200×630, re-render the share card

The mark also appears **inline** in `src/index.html`, twice (header and footer), and
carries `class="brand-mark-drop"` so the CSS can colour the drop with the surface's
accent. If you change the geometry, update those paths too.
