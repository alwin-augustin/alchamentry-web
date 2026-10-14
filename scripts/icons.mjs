#!/usr/bin/env node
/**
 * Derives the favicon, app-icon and plate variants from the supplied flask mark.
 *
 *   node scripts/icons.mjs
 *
 * src/assets/brand/alchamentry-icon.svg is the design of record and is never
 * modified. Everything here is a plate built around it:
 *
 *   · a navy plate rather than a white one — the liquid gradient runs
 *     blue → violet → pink → orange and needs a dark ground to read, and navy
 *     is already the design's dark surface (--ink-deep #0B1220)
 *   · the plate is opaque, so one file is correct on light and dark browser
 *     chrome alike
 *   · the maskable/full-bleed variant keeps the mark inside the 80% safe area
 *     that iOS and Android crop to
 *
 * The raster exports (favicon.ico, icon-*.png, apple-touch-icon.png) are
 * committed and are rendered from these files — see README, Editing.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ICON = join(ROOT, "src/assets/brand/alchamentry-icon.svg");

const NAVY = "#0B1220";

/* The flask's own artwork, as supplied. */
const icon = await readFile(ICON, "utf8");

/* Its visible bounds inside the 160-unit box, measured from the source:
   the <g> is translated (5 10) and the vessel runs x 20–126, y 10–141. */
const BOUNDS = { x0: 25, y0: 20, x1: 131, y1: 151 };
const cx = (BOUNDS.x0 + BOUNDS.x1) / 2;
const cy = (BOUNDS.y0 + BOUNDS.y1) / 2;
const height = BOUNDS.y1 - BOUNDS.y0; // 131

/** Wrap the supplied artwork in a plate, scaled to `fill` of the box height. */
function plate({ size = 160, radius, bleed, fill }) {
  const scale = (size * fill) / height;
  // Keep the artwork's <defs> — the gradients and the clip path live there and
  // the paths below reference them by id.
  const defs = icon.match(/<defs>[\s\S]*?<\/defs>/)?.[0];
  const mark = icon.match(/<g id="mark"[\s\S]*?<\/g>\s*(?=<\/svg>)/)?.[0];
  if (!defs || !mark) throw new Error("alchamentry-icon.svg structure changed");
  const body = `${defs}\n${mark}`;
  // fill="none" on the root matters: the vessel outline path carries only a
  // stroke, and without it the default black fill paints over the liquid.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none" role="img" aria-labelledby="t">
  <title id="t">Alchamentry</title>
  <rect width="${size}" height="${size}"${bleed ? "" : ` rx="${radius}"`} fill="${NAVY}"/>
  <g transform="translate(${size / 2} ${size / 2}) scale(${scale.toFixed(4)}) translate(${-cx} ${-cy})">
    ${body.trim().replace(/\n/g, "\n    ")}
  </g>
</svg>
`;
}

const files = {
  // Rounded plate: the favicon, the app icon, anything the browser draws.
  [join(ROOT, "src/favicon.svg")]: plate({ radius: 36, fill: 0.74 }),
  // Full bleed, mark inside the maskable safe area. iOS, Android, PWA.
  [join(ROOT, "src/assets/brand/alchamentry-plate-bleed.svg")]: plate({
    bleed: true,
    fill: 0.54,
  }),
};

for (const [path, contents] of Object.entries(files)) {
  await writeFile(path, contents, "utf8");
  console.log(path.replace(ROOT + "/", ""));
}
