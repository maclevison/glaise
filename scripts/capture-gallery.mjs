#!/usr/bin/env node
// Gallery capture — renders assets/gallery/sample.html once per skin and writes PNGs.
// OPTIONAL tooling (needs playwright): npx playwright install chromium && node scripts/capture-gallery.mjs
// Convert to lossless webp afterwards (see plan step) — webp keeps the repo's asset convention.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// "glaise" (no pigment) must stay first: its guard catches regex drift the celadon entry can't (sample.html already links celadon).
const SKINS = [
  { name: "glaise", theme: "dark", pigment: null },
  { name: "celadon", theme: "light", pigment: "celadon" },
  { name: "terracotta", theme: "light", pigment: "terracotta" },
  { name: "verdigris", theme: "dark", pigment: "verdigris" },
  { name: "tyrian", theme: "dark", pigment: "tyrian" },
  { name: "cobalt", theme: "light", pigment: "cobalt" },
];

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { console.error("playwright not installed — capture manually (see plan). Skipping."); process.exit(0); }

const src = readFileSync("assets/gallery/sample.html", "utf8");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
for (const { name, theme, pigment } of SKINS) {
  let html = src.replace(/<html lang="en">/, theme === "light" ? '<html lang="en" data-theme="light">' : '<html lang="en">');
  html = html.replace(/<link rel="stylesheet" href="\.\.\/\.\.\/skills\/glaise-brand[^>]*>\n?/,
    pigment ? `<link rel="stylesheet" href="../../skills/glaise-brand/references/pigments/${pigment}.css">\n` : "");
  // Loud failure if a swap silently missed: a stale/absent pigment link, or a missing theme stamp, would capture the wrong skin.
  if (pigment && !html.includes(`pigments/${pigment}.css`)) throw new Error(`${name}: pigment link swap missed — expected pigments/${pigment}.css`);
  if (!pigment && html.includes("glaise-brand")) throw new Error(`${name}: pigment link removal missed — glaise-brand still present`);
  if (theme === "light" && !html.includes('data-theme="light"')) throw new Error(`${name}: theme stamp missing — expected data-theme="light"`);
  const tmp = `assets/gallery/.capture-${name}.html`;
  writeFileSync(tmp, html);
  await page.goto("file://" + path.resolve(tmp));
  await page.screenshot({ path: `assets/gallery/${name}.png` });
  console.log(`✓ ${name}.png (${theme})`);
}
await browser.close();
console.log("Now convert: for f in assets/gallery/*.png; do cwebp -lossless \"$f\" -o \"${f%.png}.webp\"; done");
