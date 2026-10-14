#!/usr/bin/env node
/**
 * Derives the header lockups from the supplied ones.
 *
 *   node scripts/lockups.mjs
 *
 * The supplied lockups (alchamentry-logo-outlined.svg and -dark-) are drawn on a
 * 1200 × 300 canvas, but the artwork only occupies x 46–593, y 53–200 of it —
 * 46% of the width and 49% of the height. Set to `width: 235px` in the header,
 * that renders the mark at an effective **107px**, with the wordmark at 13.5px
 * and the "SOFTWARE LAB" line at 3.5px. The tagline is set at 26% of the
 * wordmark, so it cannot be legible at any size a header can afford: it needs a
 * ~305px-wide, 82px-tall lockup, which is the entire header.
 *
 * So the header gets a derived lockup:
 *
 *   · the viewBox is cropped to the artwork, so `width` in CSS means the width
 *     of the mark rather than the width of an empty canvas
 *   · the "SOFTWARE LAB" line is dropped. It is a lockup detail for large
 *     placements — it lives on in the footer, set as real text at a size that
 *     can be read.
 *
 * The supplied files are never modified. They remain the design of record and
 * are still the right asset for print, the share card, and large placements.
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = join(ROOT, "src/assets/brand");

/* The artwork's bounds inside the supplied 1200 × 300 canvas, measured from a
   rendered copy: the flask and its bubbles run x 46–151, y 53–184.5; the
   wordmark runs x 206.5–593, cap height 50.2 units. Two units of padding. */
const CROP = { x: 44, y: 51, width: 551, height: 135.5 };

/** Drop a whole <g id="…"> … </g> block. The letters are outlined paths, so
 *  there is no other way to remove a line of the lockup. */
function dropGroup(svg, id) {
  const open = svg.indexOf(`<g id="${id}"`);
  if (open === -1) throw new Error(`no <g id="${id}"> in the source`);
  // Walk forward to the matching close, counting nested <g> tags.
  let depth = 0;
  const tag = /<(\/?)g\b[^>]*>/g;
  tag.lastIndex = open;
  let match;
  while ((match = tag.exec(svg))) {
    depth += match[1] ? -1 : 1;
    if (depth === 0) return svg.slice(0, open) + svg.slice(tag.lastIndex);
  }
  throw new Error(`unbalanced <g id="${id}">`);
}

const SOURCES = [
  ["alchamentry-logo-outlined.svg", "alchamentry-logo-header.svg"],
  ["alchamentry-logo-dark-outlined.svg", "alchamentry-logo-header-dark.svg"],
];

for (const [from, to] of SOURCES) {
  const source = await readFile(join(BRAND, from), "utf8");
  const cropped = dropGroup(source, "wordmark-medium").replace(
    /viewBox="0 0 1200 300"/,
    `viewBox="${CROP.x} ${CROP.y} ${CROP.width} ${CROP.height}"`
  );
  if (!cropped.includes("wordmark-regular")) throw new Error(`${from}: wordmark missing`);
  if (cropped.includes("wordmark-medium")) throw new Error(`${from}: tagline not removed`);

  await writeFile(join(BRAND, to), cropped, "utf8");
  console.log(`src/assets/brand/${to}   viewBox ${CROP.x} ${CROP.y} ${CROP.width} ${CROP.height}`);
}
