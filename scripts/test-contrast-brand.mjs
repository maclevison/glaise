#!/usr/bin/env node
// Tests for contrast.mjs brand overlay + suggestions. Run: node scripts/test-contrast-brand.mjs
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const SCRIPT = "skills/glaise/references/contrast.mjs";
let failed = 0;
const ok = (name, cond) => { console.log(`${cond ? "✓" : "✗"} ${name}`); if (!cond) failed++; };

function run(args) {
  try {
    return { out: execFileSync("node", [SCRIPT, ...args], { encoding: "utf8" }), code: 0 };
  } catch (e) {
    return { out: (e.stdout || "") + (e.stderr || ""), code: e.status ?? 1 };
  }
}
function tmpBrand(css) {
  const dir = mkdtempSync(join(tmpdir(), "vbrand-"));
  const p = join(dir, "brand.css");
  writeFileSync(p, css);
  return { dir, p };
}
const readBack = (p) => readFileSync(p, "utf8");

// Test 1: --brand overlays the accent so an ad-hoc pair reflects the brand value.
{
  const { dir, p } = tmpBrand(`:root { --glaise-primary: #2f6df0; }`);
  const r = run(["--brand", p, "primary", "canvas", "--theme", "dark"]);
  ok("brand overlay changes resolved primary", r.out.includes("#2f6df0"));
  rmSync(dir, { recursive: true, force: true });
}

// Test 2: a brand accent that fails AA gets reported with a suggested value (exit 1, file untouched).
{
  // White on-primary (#ffffff default) on a pale primary fails 4.5:1 → audit must flag it
  // and suggest a hue-preserving on-primary value. The brand file must NOT be rewritten.
  const css = `:root { --glaise-primary: #cdd7ff; --glaise-on-primary: #ffffff; }`;
  const { dir, p } = tmpBrand(css);
  const r = run(["--brand", p]);
  ok("failing brand audit exits 1", r.code === 1);
  ok("audit suggests a replacement value", /suggest/i.test(r.out) && /#[0-9a-fA-F]{6}/.test(r.out));
  ok("brand file is NOT rewritten (report-only)", readBack(p) === css);
  rmSync(dir, { recursive: true, force: true });
}

// Test 3: the suggestion PRESERVES HUE (the brand identity survives).
{
  // A saturated lavender accent as a link on canvas (primary/canvas, min 3.0). If it fails,
  // the suggested primary must stay blue-dominant, not greyed out.
  const { dir, p } = tmpBrand(`:root { --glaise-primary: #3a2fb0; --glaise-canvas: #0a0a14; }`);
  const r = run(["--brand", p]);
  // pull the first suggested hex from the output and check blue stays dominant
  const m = r.out.match(/suggest[^#]*(#[0-9a-fA-F]{6})/i);
  const huePreserved = m && (() => {
    const n = parseInt(m[1].slice(1), 16);
    const rr = (n >> 16) & 255, gg = (n >> 8) & 255, bb = n & 255;
    return bb > rr && bb > gg;
  })();
  ok("suggestion preserves hue (stays blue-dominant)", !!huePreserved);
  rmSync(dir, { recursive: true, force: true });
}

// Test 4: a clean brand passes untouched (exit 0).
{
  // Accent with strong contrast both ways; neutrals left to default.
  const { dir, p } = tmpBrand(`:root { --glaise-primary: #5e6ad2; }`);
  const r = run(["--brand", p]);
  ok("clean brand audit exits 0", r.code === 0);
  rmSync(dir, { recursive: true, force: true });
}

// Test 5: a brand written with `:root{` (no space) still overlays (tolerant selector).
{
  const { dir, p } = tmpBrand(`:root{ --glaise-primary: #2f6df0; }`);
  const r = run(["--brand", p, "primary", "canvas", "--theme", "dark"]);
  ok("no-space :root{ still overlays", r.out.includes("#2f6df0"));
  rmSync(dir, { recursive: true, force: true });
}

// Test 6: a light block with single quotes still overlays the light theme.
{
  const { dir, p } = tmpBrand(`:root { --glaise-primary: #2f6df0; }\n:root[data-theme='light'] { --glaise-primary: #112233; }`);
  const r = run(["--brand", p, "primary", "canvas", "--theme", "light"]);
  ok("single-quote light block overlays", r.out.includes("#112233"));
  rmSync(dir, { recursive: true, force: true });
}

// Test 7: --brand with no path value errors instead of silently auditing the default.
{
  const r = run(["--brand"]);
  ok("--brand with no path errors (non-zero, not a false all-clear)", r.code !== 0 && /brand/i.test(r.out));
}

// Test 8: --brand pointing at a missing file errors cleanly (no raw stack only).
{
  const r = run(["--brand", "/no/such/brand.css"]);
  ok("missing --brand path errors cleanly", r.code !== 0 && /not found|no such|brand/i.test(r.out));
}

// Test 9: a comment containing `:root {}` before the real block must not hijack parsing.
{
  const css = `/* note: a token set only in :root {} applies to both themes */\n:root { --glaise-primary: #2f6df0; }`;
  const { dir, p } = tmpBrand(css);
  const r = run(["--brand", p, "primary", "canvas", "--theme", "dark"]);
  ok("comment with :root {} does not hijack the dark block", r.out.includes("#2f6df0"));
  rmSync(dir, { recursive: true, force: true });
}

console.log(failed ? `\n${failed} test(s) failed` : "\nall tests passed");
process.exit(failed ? 1 : 0);
