#!/usr/bin/env node
/**
 * Static build for alchamentry.com.
 *
 * No bundler, no dependencies. Three jobs:
 *
 *   1. copy src/ to dist/
 *   2. give site.css and site.js a content hash in their filename, and rewrite
 *      every reference to them — so they can be cached hard without going stale
 *   3. substitute {{YEAR}} / {{BUILD}} / {{BUILD_DATE}}
 *
 * Fonts are not hashed: their filenames are already unique per family and subset,
 * so /fonts/ can be served immutable as-is.
 */
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "src");
const DIST = join(root, "dist");

/** Files whose URL must change whenever their contents do. */
const FINGERPRINT = ["assets/css/site.css", "assets/js/site.js"];

const TEXT_EXT = new Set([".html", ".css", ".js", ".json", ".xml", ".txt", ".webmanifest"]);

/** Short, human-readable build stamp: git sha when CI provides one, else a date. */
function buildStamp() {
  const sha = (process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || "").slice(0, 7);
  const date = new Date().toISOString().slice(0, 10);
  return sha ? `${date} · ${sha}` : `${date} · local`;
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** Rename each entry in FINGERPRINT to name.<hash>.ext. Returns URL rewrites. */
async function fingerprint() {
  const rewrites = [];

  for (const relativePath of FINGERPRINT) {
    const from = join(DIST, relativePath);
    const contents = await readFile(from);
    const hash = createHash("sha256").update(contents).digest("hex").slice(0, 8);

    const ext = extname(relativePath);
    const to = `${relativePath.slice(0, -ext.length)}.${hash}${ext}`;

    await rename(from, join(DIST, to));
    rewrites.push([`/${relativePath}`, `/${to}`]);
  }

  return rewrites;
}

async function main() {
  const stamp = buildStamp();
  const year = String(new Date().getFullYear());

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await cp(SRC, DIST, { recursive: true });

  const rewrites = await fingerprint();

  for (const file of await walk(DIST)) {
    if (!TEXT_EXT.has(extname(file))) continue;

    let body = await readFile(file, "utf8");
    for (const [from, to] of rewrites) body = body.replaceAll(from, to);
    body = body
      .replaceAll("{{YEAR}}", year)
      .replaceAll("{{BUILD_DATE}}", stamp.slice(0, 10))
      .replaceAll("{{BUILD}}", stamp);

    await writeFile(file, body, "utf8");
  }

  const built = await walk(DIST);
  const bytes = (await Promise.all(built.map(async (f) => (await stat(f)).size))).reduce((a, b) => a + b, 0);
  const names = rewrites.map(([, to]) => basename(to)).join(", ");

  console.log(`built dist/  ·  ${built.length} files  ·  ${(bytes / 1024).toFixed(1)} kB  ·  ${stamp}`);
  console.log(`hashed  ${names}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
