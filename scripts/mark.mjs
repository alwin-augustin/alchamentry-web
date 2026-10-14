#!/usr/bin/env node
/**
 * The Alchamentry mark — source of truth for its geometry.
 *
 *   node scripts/mark.mjs
 *
 * Writes the SVG marks and assets/alchamentry-plate.svg into src/. Those files
 * are committed, so the site build never runs this. Re-run it only when the
 * geometry changes, then re-export the raster icons (see README).
 *
 * ── The idea ──────────────────────────────────────────────────────────────
 * The mark is the initial "A" drawn as a still.
 *
 *   · The flat top is the vessel's mouth — the one deliberate break from a
 *     normal letterform, and what stops this reading as "just an A".
 *   · The two legs splay to the baseline; the counter between them is the
 *     vessel's interior.
 *   · A single drop of distillate hangs inside it, where the counter is wide
 *     enough to clear both legs, falling towards…
 *   · …the crossbar, which is the liquid line the substance lands on.
 *
 * Ink is the apparatus: the craft, the engineering, the studio. Oxide is the
 * substance: the product, the thing that has been transformed. That is the
 * whole of the brand's colour story, and it is why the drop is the only
 * coloured element anywhere in the system.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "src/assets");
const SRC = join(ROOT, "src");

/* ── Geometry, in a 64-unit box ───────────────────────────────────────────
   The constraint that shapes everything: the counter is a V, so it is narrow
   near the mouth. The drop has to hang low enough that the V is wider than
   the drop, or it collides with the legs — and high enough to leave a gap
   above the crossbar, or the two merge into one blob below about 24 px.
   These are the resolved values: the drop clears each leg by ~2.4 units at
   its belly and sits ~6.7 units above the bar.

   The bar is a wedge rather than a rectangle on purpose. The legs' inner
   edges diverge as they descend, so a rectangle wide enough to meet them at
   its bottom corners would be too wide at the top. Following the vessel's
   walls keeps the join clean at every size.                                   */
const G = {
  cx: 32,
  apexY: 9, // the vessel mouth
  mouthHalf: 6.5,
  baseY: 55,
  baseHalf: 26,
  counterApexY: 19, // where the interior V begins
  counterBaseHalf: 16.5,
  barY: 44, // the liquid line
  barH: 4.6,
  barInset: 1.5, // how far the bar bites into each leg
  dropTipY: 25, // the distillate
  dropR: 4.1,
};

export const COLORS = {
  ink: "#1A1815",
  paper: "#F5F3EE",
  oxide: "#9C4A16", // oxide, on paper
  oxideOnInk: "#D98A4E", // the same accent lifted for dark surfaces
};

const n = (v) => Number(v.toFixed(2));

/** The letter, as one closed contour. The counter is part of the outline
 *  rather than a fill-rule hole, so the mark drops onto any background. */
function letterPath(g = G) {
  const { cx, apexY, mouthHalf, baseY, baseHalf, counterApexY, counterBaseHalf } = g;
  return [
    `M${n(cx - mouthHalf)} ${apexY}`,
    `H${n(cx + mouthHalf)}`,
    `L${n(cx + baseHalf)} ${baseY}`,
    `H${n(cx + counterBaseHalf)}`,
    `L${cx} ${counterApexY}`,
    `L${n(cx - counterBaseHalf)} ${baseY}`,
    `H${n(cx - baseHalf)}Z`,
  ].join("");
}

/** The drop: pointed where it leaves the mouth, round where it gathers. */
function dropPath(g = G) {
  const { cx, dropTipY: t, dropR: r } = g;
  return (
    `M${cx} ${t}` +
    `c${n(r * 0.72)} ${n(r * 0.88)} ${n(r)} ${n(r * 1.5)} ${n(r)} ${n(r * 2)}` +
    `a${r} ${r} 0 0 1${n(-r * 2)} 0` +
    `c0${n(-r * 0.5)} ${n(r * 0.28)}${n(-r * 1.12)} ${n(r)}${n(-r * 2)}Z`
  );
}

/** Half-width of the vessel's interior at a given height. */
const interiorHalf = (y, g = G) =>
  (g.counterBaseHalf * (y - g.counterApexY)) / (g.baseY - g.counterApexY);

/** The liquid line. A wedge, not a rectangle: its ends run parallel to the
 *  vessel's walls, inset a little so the three shapes read as one object. */
function barPath(g = G) {
  const { cx, barY, barH, barInset } = g;
  const bottom = barY + barH;
  const tl = cx - interiorHalf(barY) - barInset;
  const tr = cx + interiorHalf(barY) + barInset;
  const br = cx + interiorHalf(bottom) + barInset;
  const bl = cx - interiorHalf(bottom) - barInset;
  return `M${n(tl)} ${barY}H${n(tr)}L${n(br)} ${n(bottom)}H${n(bl)}Z`;
}

const bar = (fill) => `<path d="${barPath()}" fill="${fill}"/>`;

const markBody = (letterFill, dropFill) =>
  `<path d="${letterPath()}" fill="${letterFill}"/>
  ${bar(letterFill)}
  <path d="${dropPath()}" fill="${dropFill}"/>`;

/** Indent every line of a fragment by `by` spaces, ignoring blank lines. */
const indent = (s, by) =>
  s
    .split("\n")
    .map((l) => (l.trim() ? " ".repeat(by) + l.trim() : ""))
    .join("\n");

const document = (body, { bg = null, scale = 1 } = {}) => {
  const inner =
    scale === 1
      ? indent(body, 2)
      : `  <g transform="translate(32 32) scale(${scale}) translate(-32 -32)">\n${indent(
          body,
          4
        )}\n  </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="alchamentry-title">
  <title id="alchamentry-title">Alchamentry</title>
${bg ? `  <rect width="64" height="64" rx="14" fill="${bg}"/>\n` : ""}${inner}
</svg>
`;
};

const files = {
  // On paper — the primary mark.
  [join(ASSETS, "alchamentry-mark.svg")]: document(
    markBody(COLORS.ink, COLORS.oxide)
  ),
  // On ink — the dark bands, the footer, dark mode.
  [join(ASSETS, "alchamentry-mark-inverse.svg")]: document(
    markBody(COLORS.paper, COLORS.oxideOnInk)
  ),
  // One colour. The drop is knocked out so the form survives without colour.
  [join(ASSETS, "alchamentry-mark-mono.svg")]: document(
    `<path fill-rule="evenodd" d="${letterPath()} ${dropPath()}" fill="currentColor"/>
  ${bar("currentColor")}`
  ),
  // The plate: opaque, so one file is correct on light and dark chrome alike.
  [join(SRC, "favicon.svg")]: document(
    markBody(COLORS.paper, COLORS.oxideOnInk),
    { bg: COLORS.ink, scale: 0.72 }
  ),
  // Full bleed, mark inside the maskable safe area. For iOS and Android.
  [join(ASSETS, "alchamentry-plate-bleed.svg")]: document(
    markBody(COLORS.paper, COLORS.oxideOnInk),
    { bg: COLORS.ink, scale: 0.56 }
  ),
};

await mkdir(ASSETS, { recursive: true });
for (const [path, contents] of Object.entries(files)) {
  await writeFile(path, contents, "utf8");
  console.log(path.replace(ROOT + "/", ""));
}
