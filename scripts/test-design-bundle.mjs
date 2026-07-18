#!/usr/bin/env node
// Glaise — design-bundle generator test. Zero deps: node scripts/test-design-bundle.mjs
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const GEN = "skills/glaise-design-sync/references/build-design-bundle.mjs";
const EXPECTED = [
  "foundations/Colors.html",
  "foundations/Typography.html",
  "foundations/SpacingRadii.html",
  "foundations/Surfaces.html",
  "components/Button.html",
  "components/Input.html",
  "components/Card.html",
  "components/Badge.html",
  "components/Table.html",
];

let failures = 0;
function ok(label, cond) {
  console.log(`${cond ? "✓" : "✗"} ${label}`);
  if (!cond) failures++;
}

const root = join(tmpdir(), `glaise-bundle-test-${process.pid}`);
rmSync(root, { recursive: true, force: true });

// --- run 1: default skin --------------------------------------------------
const proj = join(root, "proj");
mkdirSync(proj, { recursive: true });
execFileSync("node", [GEN, "--project", proj], { stdio: "pipe" });
const out = join(proj, "docs/glaise/design-bundle");

for (const rel of EXPECTED) {
  let html = "";
  try { html = readFileSync(join(out, rel), "utf8"); } catch { }
  ok(`${rel} exists`, html.length > 0);
  if (!html) continue;
  const first = html.split("\n", 1)[0];
  ok(`${rel} line 1 is a @dsCard marker`, /^<!-- @dsCard group="(Foundations|Components)" viewport="\d+x\d+" -->$/.test(first));
  ok(`${rel} defines both theme faces`, html.includes(".theme-light{") && html.includes(".theme-dark{"));

  // Every referenced --glaise-* var must be defined in the card's own theme blocks.
  const defined = new Set([...html.matchAll(/(--glaise-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const missing = [...html.matchAll(/var\((--glaise-[a-z0-9-]+)[),]/g)].map((m) => m[1]).filter((v) => !defined.has(v));
  ok(`${rel} has no undefined var() refs`, missing.length === 0);

  // Components: raw hex may exist ONLY inside the theme var blocks (+ the #fff page bg).
  if (rel.startsWith("components/")) {
    const stripped = html
      .replace(/\.theme-light\{[\s\S]*?\n  \}/, "")
      .replace(/\.theme-dark\{[\s\S]*?\n  \}/, "")
      .replace(/background:#fff\b/g, "");
    ok(`${rel} styles only via tokens (no stray hex)`, !/#[0-9a-fA-F]{3,8}\b/.test(stripped));
  }
}
ok("no unexpected files", readdirSync(join(out, "foundations")).length === 4 && readdirSync(join(out, "components")).length === 5);

// --- run 2: brand.css flows through ---------------------------------------
const bproj = join(root, "branded");
mkdirSync(join(bproj, "docs/glaise"), { recursive: true });
// The fixture pins the REAL cascade semantics (specificity beats load order):
// - primary: branded on both faces → both override.
// - danger: branded only in :root, but tokens.css redefines it in the dark block
//   (`:root[data-theme="dark"]`, higher specificity) → dark keeps the base dark value.
// - radius-md: branded only in :root and absent from the base dark block → flows to dark.
writeFileSync(join(bproj, "docs/glaise/brand.css"), `:root { --glaise-primary: #7c5cff; --glaise-danger: #b00020; --glaise-radius-md: 10px; }\n:root[data-theme="dark"] { --glaise-primary: #a894ff; }\n`);
execFileSync("node", [GEN, "--project", bproj], { stdio: "pipe" });
const branded = readFileSync(join(bproj, "docs/glaise/design-bundle/components/Button.html"), "utf8");
const face = (name) => (branded.match(new RegExp(`\\.theme-${name}\\{([\\s\\S]*?)\\n  \\}`)) || [, ""])[1];
ok("brand.css overrides the light face", face("light").includes("--glaise-primary: #7c5cff;"));
ok("brand.css overrides the dark face", face("dark").includes("--glaise-primary: #a894ff;"));
ok("light-only brand token loses to the base dark block (specificity)", face("dark").includes("--glaise-danger: #eb5757;") && face("light").includes("--glaise-danger: #b00020;"));
ok("light-only brand token flows to dark when base has no dark override", face("dark").includes("--glaise-radius-md: 10px;"));

rmSync(root, { recursive: true, force: true });
if (failures) { console.error(`\n✗ ${failures} failure(s)`); process.exit(1); }
console.log("\n✓ design-bundle generator passed");
