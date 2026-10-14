#!/usr/bin/env node
/** Tiny static server for `npm run dev`. Serves dist/ — build first. */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = Number(process.env.PORT) || 4173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidates = clean.endsWith("/") ? [join(DIST, clean, "index.html")] : [join(DIST, clean), join(DIST, clean, "index.html")];

  for (const candidate of candidates) {
    if (!candidate.startsWith(DIST)) continue;
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolve(req.url || "/");

  if (!file) {
    const fallback = join(DIST, "404.html");
    res.writeHead(404, { "content-type": TYPES[".html"] });
    createReadStream(fallback).pipe(res);
    return;
  }

  res.writeHead(200, {
    "content-type": TYPES[extname(file)] || "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`alchamentry-web  →  http://localhost:${PORT}`);
});
