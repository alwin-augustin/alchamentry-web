# Alchamentry — design

The homepage design is the **supplied showcase**, kept as authored. This document
records what that design is, and the few things that had to change to ship it.

- **Design of record:** [`design/alchamentry-site-showcase.html`](../design/alchamentry-site-showcase.html)
- **Brand assets of record:** [`src/assets/brand/`](../src/assets/brand/)
- Everything below describes the shipped site, which renders identically.

---

## 1. What the page has to do

Alchamentry is a studio with three products in three unrelated markets. A visitor
arrives knowing nothing and has to leave knowing two things: what each product is
and that it is real, and why one studio made all three.

The page answers the second with a single line, held consistently from the hero to
the footer: **work that has to hold up.** A compliance threshold, a patient history,
a piece of sensitive developer data. The products differ because the work differs;
the standard does not.

Order: hero → products → approach → studio → contact → footer. One page, no routes.

---

## 2. Colour

Cool, low-contrast surfaces, with the brand gradient used as an accent rather than
as a background. Navy is reserved for the approach section and the contact card, so
the page has two dark moments rather than a dark theme.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F8FAFC` | Page canvas |
| `--surface` | `#FFFFFF` | Products section, cards |
| `--surface-soft` | `#F1F4F9` | Recessed fills |
| `--ink` | `#101828` | Headings, body |
| `--ink-deep` | `#0B1220` | Approach section, contact card, app-icon plate |
| `--body` | `#536176` | Body copy |
| `--muted` | `#7C899C` | Metadata and small mono labels |
| `--line` / `--line-strong` | `#E3E8F0` / `#D3DCE9` | Hairlines, borders |
| `--blue` | `#315FF5` | Primary accent, links, focus |
| `--violet` | `#9857E8` | Gradient mid-stop |
| `--pink` / `--coral` | `#DB63C4` / `#F96E99` | Gradient stops |
| `--orange` / `--amber` | `#FF914F` / `#FFD16A` | Gradient warm end |
| `--blue-tint` / `--violet-tint` / `--warm-tint` | `#EDF2FF` / `#F4EEFF` / `#FFF3E9` | Icon and label washes |

The gradient — blue → violet → pink → coral → orange → amber — is the brand's most
recognisable asset. It appears in the flask liquid, the `hold up.` in the headline,
the section kicker rules, and small label icons. It is never used as a large fill.

### Known contrast issue

Eleven small text styles fall below WCAG AA (4.5:1). All are 8–11 px mono labels on
light surfaces, and all are `--muted #7C899C` on `--paper #F8FAFC` or white, at
**2.86–4.47:1**:

| Where | Ratio |
| --- | --- |
| `.mock-top b` — “WORK LOG”, “PATIENT RECORD” | 2.86 |
| `.product-id` — “AL / 001” | 2.89 |
| `.art-index` — “IDEAS / EXPERIMENTS / USEFUL SOFTWARE” | 2.99 |
| `.footer-brand span` — “SOFTWARE LAB” | 2.99 |
| `.footer-bottom` — copyright | 3.01 |
| `.product-tag` — “Developer tools” (orange variant) | 3.02 |
| `.float-label span` — “SMALL, PURPOSEFUL TOOLS” | 3.39 |
| `.section-kicker` — “01 / Products” | 3.55 |
| `.strip-item` — product names | 4.27 |
| `.statement-foot span` — “IDEAS” | 4.47 |

This is inherent to the supplied palette, not to the build. The layout, spacing and
gradient are unaffected by it. One token change fixes every row in the table:

```css
--muted: #66748A;   /* 4.53:1 on --paper — passes AA, visually very close */
```

That is deliberately **not applied**. The design was supplied as final, and darkening
the metadata greys is a visible design decision, not an engineering one. See README,
*Known issues*, for how to apply it.

---

## 3. Type

Two families, both self-hosted. The showcase linked Google Fonts; the site serves the
same families from `/fonts` so that the page makes no third-party requests and the
CSP in `src/_headers` can stay strict.

- **Inter** — variable, `100 900`. Headings, navigation, cards, body. The variable
  file is required: the design uses the intermediate weights `450`, `550` and `650`,
  which a static 400/500/600/700 set cannot render.
- **DM Mono** — `400` and `500`. Every label, index number, and piece of metadata.

Headings are set at `font-weight: 500` with `letter-spacing: -.045em` — tight, and
noticeably tighter than the body. That contrast between tight display type and
generous body leading is the page's main typographic move.

| Role | Size | Notes |
| --- | --- | --- |
| `h1` | `clamp(3.1rem, 6.3vw, 5.55rem)` | `line-height: .99`, max 760 px |
| `h2` | `clamp(2.2rem, 4.2vw, 3.65rem)` | `line-height: 1.08` |
| `h3` | `1.35rem` | product and principle titles |
| `.lead` | `clamp(1.02rem, 1.45vw, 1.18rem)` | hero, max 600 px |
| body | `15px` / `1.65` | the page's base size |
| `.mono` labels | `9–13px` | `letter-spacing: .1–.17em`, uppercase |

---

## 4. Space, grid, shape

- **Container** `min(1200px, 100% - 48px)`; `100% - 34px` under 780 px, `- 28px` under 430 px.
- **Hero grid** `1.08fr / .92fr`, collapsing to one column at 780 px.
- **Product grid** three equal columns, `18px` gap; one column under 780 px.
- **Section rhythm** — products `108/118px`, approach `116/120px`, studio `108px`,
  all reduced to `78px` on mobile.
- **Radius** `12px` small, `20px` cards, `28px` panels, `36px` the contact card,
  `999px` buttons and pills. Notably rounder than a typical studio page — the
  softness is what keeps a cool, low-contrast palette from reading as clinical.
- **Depth** comes from two shadows only (`--shadow-card`, `--shadow-soft`) plus
  1 px borders. Sections are separated by borders and background changes, not by
  elevation.
- **Atmosphere** in the hero and dark sections is three `radial-gradient` circles at
  low opacity, behind a decorative grid and orbit in the hero art.

---

## 5. Components

1. **Header** — sticky, translucent with `backdrop-filter: blur(18px)`, hairline
   bottom. Full logo lockup at 235 px, collapsing to a circular menu button at 780 px.
2. **Eyebrow / section kicker** — mono, uppercase. The kicker carries a 26 px
   gradient tick before it.
3. **Buttons** — pill, 48 px min height. Solid ink primary, hairline secondary,
   white on dark. All lift `2px` on hover.
4. **Product card** — index number, live pill, a CSS-drawn UI mock, tag, title,
   subtitle, description, feature chips, and a link row. The mock is built from divs,
   not images: a work log for Remote Days, a patient record for Dentra, a code window
   for Toolbit.
5. **Principle** — numbered row on navy, hairline separated.
6. **Studio statement** — white card with the flask, a quote, and three chips.
7. **Contact card** — navy, `36px` radius, gradient orbs, one action.
8. **Footer** — logo, product links, year.

### Interaction

Buttons lift and shadow on hover; nav links shift to blue; card links translate their
arrow `3px` up-right. The hero flask floats `10px` over 7 s. Focus is a `3px` blue
ring at `4px` offset, never removed. There is a skip link, and `prefers-reduced-motion`
disables every animation and transition. The only JavaScript is the mobile menu and
the footer year — the page is complete without it.

---

## 6. The mark

A **conical flask** with liquid in it, and two bubbles rising. The liquid is the
brand gradient; the vessel is an outlined gradient stroke. It reads as a lab vessel
and, by extension, as the studio's claim: raw material in, something refined out.

| File | Use |
| --- | --- |
| `alchamentry-logo-header.svg` | **Generated.** The header lockup — cropped, no tagline. See below. |
| `alchamentry-logo-header-dark.svg` | **Generated.** The same, for dark surfaces. |
| `alchamentry-logo-outlined.svg` | Full lockup with wordmark and “SOFTWARE LAB”. Large placements and print. |
| `alchamentry-logo-dark-outlined.svg` | The same lockup for dark backgrounds. |
| `alchamentry-icon.svg` | The flask alone. Hero art, statement card, footer, 404. |
| `alchamentry-logo-mono.svg` | Single-colour lockup for print and restricted-colour use. |
| `favicon.svg` | Generated plate: the flask on navy, `36` radius. Opaque, so one file is right on light and dark browser chrome. |
| `alchamentry-plate-bleed.svg` | Generated: full bleed, mark inside the maskable safe area. |

### Why the header uses a derived lockup

The supplied lockups are drawn on a 1200 × 300 canvas, but the artwork only occupies
x 46–593, y 53–200 of it — **46 % of the width and 49 % of the height**. Setting
`width: 235px` sizes the *canvas*, so the mark actually rendered at 107 px, the
wordmark at 13.5 px, and the “SOFTWARE LAB” line at **3.5 px**. That is the whole of
the illegible-header problem: it was a viewBox padding issue, not a CSS width issue.

Enlarging the CSS width is not a fix — the tagline is set at 26 % of the wordmark, so
making it legible would need a ~305 px-wide, 82 px-tall lockup, which is the entire
header.

`scripts/lockups.mjs` therefore derives a header lockup from each supplied file:

- **the viewBox is cropped to the artwork**, with 2 units of padding, so `width` in
  CSS now means the width of the mark
- **the `<g id="wordmark-medium">` group is removed** — the “SOFTWARE LAB” line. It is
  a lockup detail for large placements, and it survives in the footer, where it is set
  as real text at a size that can be read.

The supplied files are never modified. They remain the design of record and are still
the right asset for print and large placements.

Header sizes, all of which keep ~15 px of breathing room in the header: `210px`
desktop, `170px` under 780 px, `150px` under 430 px. That puts the wordmark at a
26 px font on desktop — finally bigger than the 13 px nav, which is the hierarchy the
brand should have.

**The plate is navy, not white.** The liquid gradient runs blue → violet → pink →
orange and needs a dark ground to read at 16 px; navy is already the design's dark
surface. Both plates are generated from `alchamentry-icon.svg` by
`scripts/icons.mjs`, which never modifies the source artwork.

---

## 7. What changed to ship it

The showcase was a single self-contained file with two base64 marks and a Google
Fonts link. Four things changed; nothing visual did.

| Change | Why |
| --- | --- |
| The two embedded marks became `<img src="/assets/brand/…">` | The data URIs were verified byte-identical to the supplied SVGs. Referencing the files keeps one source of truth. |
| `<style>` and `<script>` became external files | The strict CSP in `src/_headers` has no `'unsafe-inline'`. Inline blocks would have been blocked — including the mobile menu. |
| Google Fonts became self-hosted `@font-face` | Keeps the page free of third-party requests and keeps the CSP strict. Inter must be the variable file because of the `450/550/650` weights. |
| Three self-referential links were fixed | The nav CTA and footer “Contact” pointed at `https://alchamentry.com/#contact` from `alchamentry.com`. The contact button now has an address: `mailto:hello@alchamentry.com`. |

The markup is otherwise byte-for-byte the showcase. Verified by rendering both at
1440 px and diffing: **0.036 % of pixels differ, all of them inside the hero art
box** — that is the flask's float animation caught at a different phase, not a
layout or type difference. `scripts/import-showcase.mjs` performs the conversion and
documents it in code.

---

## 8. Budget

| | |
| --- | --- |
| HTML | 20 KB (4.6 KB gzipped) |
| CSS | 28 KB (6.2 KB gzipped), one file, no framework |
| JS | 4 KB, unminified, progressive enhancement only |
| Fonts | 6 woff2 files, 216 KB |
| Third-party requests | none |
| Cookies | none |
