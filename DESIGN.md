# Alchamentry — design system

A short, deliberate system for one landing page. Nothing here is speculative: every
token exists because something on the page uses it.

---

## 1. What the page has to do

Alchamentry is a studio with three products in three unrelated markets. A visitor
arrives knowing nothing, and has to leave knowing two things:

1. **What each product is, and that it is real.** Live links, real domains, real
   screenshots of the problem — not a feature grid.
2. **Why one studio made all three.** The answer cannot be "we build great software".
   It has to be a specific property the products actually share.

The shared property, and therefore the whole voice of the page: **each product holds
a record that someone will eventually inspect.** A remote-day count an inspector asks
for, a patient history a dentist relies on, a JWT that should never leave the machine.
The studio builds for that. Every copy decision follows from it.

### The voice

Plain, specific, a little dry. Numbers and nouns over adjectives. No "seamlessly",
no "empower", no "unlock", no exclamation marks, no emoji. Sentences are allowed to
be short.

### What we are deliberately not doing

The previous site used Tailwind from a CDN, a scroll-animation library and a Lucide
icon script — the visual grammar of a generated page: gradient meshes, floating
orbs, glassmorphism, `rounded-3xl` everywhere, centred everything, three-up feature
cards with icons, fade-up-on-scroll as the only idea. None of that is here.

Instead: a warm paper canvas, hairline rules, a real typographic hierarchy, a
technical mono for labels and metadata, and one warm accent. It should read like a
studio's spec sheet, not a template.

---

## 2. Colour

Warm neutrals and a single oxide accent. The products supply their own colour —
the studio's job is to stay out of the way.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F5F3EE` | Page canvas |
| `--paper-sunk` | `#EDEAE2` | Recessed bands, table stripes |
| `--surface` | `#FCFBF8` | Raised panels |
| `--ink` | `#1A1815` | Headings, body, dark bands |
| `--ink-2` | `#555147` | Secondary text, lede |
| `--ink-3` | `#6F6B61` | Metadata, captions, labels |
| `--rule` | `#DFDBD1` | Hairlines |
| `--rule-strong` | `#C7C1B4` | Emphasis rules, input borders |
| `--accent` | `#9C4A16` | Oxide. Links, markers, focus. Used sparingly |
| `--accent-soft` | `#9C4A1620` | Accent wash behind small marks |
| `--paper-on-ink` | `#F5F3EE` | Text on the dark band |

Contrast is measured from the rendered page, not from the token values. On `--paper`:
ink 15.98:1, ink-2 7.13:1, ink-3 4.79:1, accent 5.56:1. On the `#1A1815` bands:
ink 15.98:1, ink-2 7.94:1, ink-3 4.82:1, accent 6.49:1. Every one of the 28 distinct
text styles on the page clears WCAG AA (4.5:1, or 3:1 for display type). The dark
bands re-declare `--ink-*` and `--accent` locally, which is why the mark's drop and
the section numerals lighten on their own.

**Product colours.** Never used as page colour — only as a 44 px icon tile and a
single 2 px marker per product, so the three brands stay legible as *brands*:
Remote Days `#2563EB`, Dentra `#7C2B52` → `#1F6E70`, Toolbit `#3B62E8`.

---

## 3. Type

Two families, self-hosted, Latin + Latin-ext subsets, `font-display: swap`. No CDN,
no `fonts.googleapis.com` request.

- **Inter Tight** (variable, 300–800) — display and UI. Its tighter default fit is
  what makes large headings read as editorial rather than default.
- **JetBrains Mono** (variable, 400–700) — eyebrows, section numbers, domains,
  metadata, and anything that is a *label* rather than a sentence.

The mono is the page's signature. Section numbers (`01 — Products`), domains
(`remotedays.app`) and fact labels all sit in it. That is what makes the page read
as engineering rather than marketing.

| Role | Size | Weight | Tracking | Leading |
| --- | --- | --- | --- | --- |
| `display-xl` (h1) | `clamp(2.75rem, 7.2vw, 5.25rem)` | 500 | `-0.035em` | 0.98 |
| `display-l` (h2) | `clamp(1.9rem, 4vw, 2.9rem)` | 500 | `-0.03em` | 1.05 |
| `display-m` (product) | `clamp(1.6rem, 3vw, 2.15rem)` | 550 | `-0.025em` | 1.05 |
| `lede` | `clamp(1.075rem, 1.5vw, 1.3rem)` | 400 | `-0.011em` | 1.5 |
| `body` | `1rem` | 400 | `-0.006em` | 1.65 |
| `small` | `0.9rem` | 400 | 0 | 1.6 |
| `label` | `0.72rem` | 500 | `0.14em` | 1 |
| `num` | `0.78rem` | 500 | `0.08em` | 1 |

`font-variant-numeric: tabular-nums` wherever figures align. Measure is capped:
lede 46ch, body 62ch, product description 56ch — never wider.

---

## 4. Space, grid, shape

- **Container** `1200px`, gutters `clamp(20px, 5vw, 40px)`.
- **Grid** 12 columns, `24px` gap. Product rows split `identity / description` on a
  5–7 span; collapsing to one column under `880px`.
- **Vertical rhythm** on a 4 px base. Section padding `clamp(4.5rem, 9vw, 8.5rem)`.
- **Radius** `2px` marks, `4px` buttons, `10px` panels, `13px` icon tiles, `999px`
  pills. Small by default; nothing is a pill except a genuine status chip.
- **Borders over shadows.** Exactly one shadow token (`--shadow-panel`) for the
  floating header and nothing else. Depth comes from the rule system, not from blur.

---

## 5. Components

Only seven, because the page only needs seven.

1. **Header** — sticky, `--paper` with `backdrop-filter`, hairline bottom on scroll.
2. **Eyebrow / section number** — mono, uppercase, prefixed with an oxide marker.
3. **Product panel** — hairline-separated full-width row: icon tile, name, domain,
   tagline, description, three fact lines, visit link.
4. **Fact list** — mono label + sans value, hairline separated.
5. **Principle** — numbered item on the dark band, 2-up at `720px`.
6. **Button** — solid ink primary, hairline ghost secondary. Both `4px` radius.
7. **Footer** — dark, three link columns, hairline dividers.

### Interaction

Links carry a real state: underline offset animates, arrow glyphs translate 2 px.
Focus rings are `2px` oxide with `2px` offset — visible, never removed.

One reveal animation exists — section heads and product rows fade and rise `8px` as
they enter. It is **CSS scroll-driven** (`animation-timeline: view()`), wrapped in
`@supports`, so browsers without it render the page statically rather than blank,
and there is no inline script and therefore no flash. It is disabled under
`prefers-reduced-motion`. Nothing on the page depends on JavaScript: the only
script is a hairline on the sticky header once the page has scrolled.

---

## 6. Assets

| Asset | Source |
| --- | --- |
| Remote Days mark | Real, from the product's own brand kit (disc + threshold rule, `#2563EB`) |
| Toolbit mark | Real, from `toolbit.app/icon.svg` |
| Dentra mark | Real, cropped from the product's `logo.png` (D + tooth, wine → teal) |
| Alchamentry mark | Designed: the letter **A** drawn as a still. Generated by `scripts/mark.mjs` |

---

## 7. The mark

**The letter A, drawn as a still.** The flat top is the vessel's mouth — the one
deliberate break from a normal letterform, and the thing that stops it reading as
just an A. The legs splay to the baseline and the counter between them is the
vessel's interior. A single drop of distillate hangs inside it, falling towards
the crossbar, which is the liquid line it lands on. One letter, one drop, one
process caught mid-step.

**Ink is the apparatus; oxide is the substance.** The letter is the craft, the
engineering, the studio. The drop is the product — the thing that has been
transformed. This is the reason the drop is the only coloured element anywhere in
the system, and it is why nothing else on the page is allowed to be oxide except
links, section numerals and the eyebrow marker: they are all "the substance".

**It has to work at 16 px.** The counter is a V, so it is narrow near the mouth —
the drop therefore sits low, where the V is at least as wide as the drop, or it
collides with the legs. The drop clears both legs by ~2.3 units at its belly; the
crossbar overlaps each leg by 4.0 units at its top edge and 1.7 at its bottom, so
letter, bar and drop read as one object rather than three shapes stacked up. Those
numbers are the resolved values, and they are the reason the letterform is squatter
and wider than a typographic A.

| File | Use |
| --- | --- |
| `alchamentry-mark.svg` | Primary. On paper. |
| `alchamentry-mark-inverse.svg` | On ink — the dark bands, the footer, dark surfaces. |
| `alchamentry-mark-mono.svg` | One colour. The drop is knocked out, so the form survives without colour. |
| `favicon.svg` | The plate. Opaque, so one file is correct on light and dark chrome alike. |
| `alchamentry-plate-bleed.svg` | Full bleed, mark inside the maskable safe area. iOS and Android. |

Re-run `npm run mark` after changing the geometry, then re-export the raster icons
(README, *Editing*). The relationship to the products is a family one: Remote Days
is also a *form above a rule*, and Dentra and Toolbit keep their own marks intact.
There is deliberately no second branding idea on the page.

---

## 8. Budget

| | Target |
| --- | --- |
| CSS | one file, no framework, no preprocessor |
| JS | one file, < 1 KB, progressive enhancement only |
| Fonts | 4 files, Latin + Latin-ext, ~178 KB total |
| Requests | 1 HTML, 1 CSS, 1 JS, 4 fonts, 3 icons |
| Lighthouse | ≥ 98 across the board |
