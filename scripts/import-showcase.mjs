#!/usr/bin/env node
/**
 * One-shot: turn the supplied showcase file into the site's build source.
 *
 *   node scripts/import-showcase.mjs
 *
 * The showcase at design/alchamentry-site-showcase.html is the design of record.
 * This keeps its markup byte-for-byte and changes only what has to change to
 * ship it:
 *
 *   · the two embedded base64 marks become references to the same SVG files in
 *     src/assets/brand/ — verified byte-identical to what was embedded
 *   · the inline <style> and <script> become external files, so the strict CSP
 *     in src/_headers (no 'unsafe-inline') still holds
 *   · the Google Fonts <link>s become self-hosted @font-face
 *   · two self-referential links become real ones, and the contact button gets
 *     an address to write to
 *
 * Re-running it overwrites src/index.html, src/assets/css/site.css and
 * src/assets/js/site.js. Do not run it after editing those by hand.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOWCASE = join(ROOT, "design/alchamentry-site-showcase.html");

/* Which embedded mark is which, by content hash. */
const EMBEDDED = {
  "14961b194f2c": { file: "alchamentry-logo-outlined.svg", alt: "Alchamentry" },
  b361e913ced2: { file: "alchamentry-icon.svg", alt: "Alchamentry" },
};

const FONTS = `/* Self-hosted. The showcase linked Google Fonts; the site does not make
   third-party requests, so these are the same families served from here.
   Inter is the variable file, because the design uses 450/550/650. */
@font-face {
  font-family: Inter;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("/fonts/inter-100-900-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193,
    U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: Inter;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("/fonts/inter-100-900-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF,
    U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020,
    U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "DM Mono";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/dm-mono-400-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193,
    U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: "DM Mono";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/dm-mono-400-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF,
    U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020,
    U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "DM Mono";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/dm-mono-500-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193,
    U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: "DM Mono";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/dm-mono-500-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF,
    U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020,
    U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

`;

/** Strip the common leading indent, then re-indent to `by`. */
function dedent(text, by) {
  const lines = text.split("\n");
  const widths = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const common = widths.length ? Math.min(...widths) : 0;
  return lines
    .map((l) => (l.trim() ? " ".repeat(by) + l.slice(common) : ""))
    .join("\n");
}

const source = await readFile(SHOWCASE, "utf8");

/* ── Pull the three parts apart ─────────────────────────────────────────── */
const styleMatch = source.match(/[ \t]*<style>\n([\s\S]*?)\n[ \t]*<\/style>/);
const scriptMatch = source.match(/[ \t]*<script>\n([\s\S]*?)\n[ \t]*<\/script>/);
const bodyMatch = source.match(/<body>\n([\s\S]*?)\n<\/body>/);
if (!styleMatch || !scriptMatch || !bodyMatch) throw new Error("showcase structure changed");

let body = bodyMatch[1];

/* The inline script is now a file; leaving it here would run it twice and the
   strict CSP would block the copy anyway. */
body = body
  .replace(scriptMatch[0] + "\n", "")
  .replace(scriptMatch[0], "")
  .replace(/\n{2,}$/, "\n");

/* ── Embedded marks -> the real files ───────────────────────────────────── */
let swaps = 0;
body = body.replace(/src="data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)"/g, (whole, b64) => {
  const hash = createHash("sha256").update(Buffer.from(b64, "base64")).digest("hex").slice(0, 12);
  const found = EMBEDDED[hash];
  if (!found) throw new Error(`unrecognised embedded mark ${hash}`);
  swaps++;
  return `src="/assets/brand/${found.file}"`;
});

/* ── Links that pointed back at the site they are the site ──────────────── */
const linkFixes = [
  ['href="https://alchamentry.com/#contact"', 'href="#contact"'],
  [
    'class="btn btn-light" href="#contact">Contact Alchamentry',
    'class="btn btn-light" href="mailto:hello@alchamentry.com">Contact Alchamentry',
  ],
];
for (const [from, to] of linkFixes) {
  body = body.split(from).join(to);
}

/* ── The head ───────────────────────────────────────────────────────────── */
const head = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#F8FAFC">
  <title>Alchamentry — Software for work that has to hold up</title>
  <meta name="description" content="Alchamentry is an independent software studio building focused, dependable products for compliance, dental clinics, and developers.">
  <link rel="canonical" href="https://alchamentry.com/">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Alchamentry">
  <meta property="og:url" content="https://alchamentry.com/">
  <meta property="og:title" content="Alchamentry — Software for work that has to hold up">
  <meta property="og:description" content="An independent software studio building focused, dependable products for compliance, dental clinics, and developers.">
  <meta property="og:image" content="https://alchamentry.com/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Alchamentry — Software for work that has to hold up">
  <meta name="twitter:description" content="An independent software studio building focused, dependable products for compliance, dental clinics, and developers.">
  <meta name="twitter:image" content="https://alchamentry.com/og.png">

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/fonts/inter-100-900-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/dm-mono-400-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/site.css">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Alchamentry",
    "url": "https://alchamentry.com",
    "email": "hello@alchamentry.com",
    "logo": "https://alchamentry.com/icon-512.png",
    "description": "Independent software studio. Remote Days, Dentra and Toolbit.",
    "makesOffer": [
      { "@type": "Offer", "itemOffered": { "@type": "SoftwareApplication", "name": "Remote Days", "url": "https://remotedays.app/", "applicationCategory": "BusinessApplication" } },
      { "@type": "Offer", "itemOffered": { "@type": "SoftwareApplication", "name": "Dentra", "url": "https://dentra.fly.dev/", "applicationCategory": "BusinessApplication" } },
      { "@type": "Offer", "itemOffered": { "@type": "SoftwareApplication", "name": "Toolbit", "url": "https://toolbit.app/", "applicationCategory": "DeveloperApplication" } }
    ]
  }
  </script>
</head>
<body>
${body}
  <script src="/assets/js/site.js" defer></script>
</body>
</html>
`;

await writeFile(join(ROOT, "src/index.html"), head, "utf8");

/* The stylesheet keeps the showcase's own cascade, verbatim, with the
   @font-face block in front of it. */
await writeFile(join(ROOT, "src/assets/css/site.css"), FONTS + styleMatch[1] + "\n", "utf8");

/* The script keeps its own logic; only the guard rails are added. */
const script = `/* Alchamentry — from the showcase, unchanged apart from being a file rather
   than an inline block. Progressive enhancement: the page works without it. */
(function () {
  "use strict";

${dedent(scriptMatch[1], 2)}
})();
`;
await writeFile(join(ROOT, "src/assets/js/site.js"), script, "utf8");

console.log(`src/index.html        ${swaps} embedded marks -> real files`);
console.log(`src/assets/css/site.css   ${(FONTS.length + styleMatch[1].length) / 1024 | 0} kB`);
console.log(`src/assets/js/site.js     ${script.length} bytes`);
