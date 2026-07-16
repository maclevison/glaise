#!/usr/bin/env node
// Pure unit tests for browser-audit.mjs (no browser). Run: node scripts/test-browser-audit.mjs
import { parseBrandTokens, parseArgs } from "../skills/glaise-audit/references/browser-audit.mjs";

let failed = 0;
const ok = (name, cond) => { console.log(`${cond ? "✓" : "✗"} ${name}`); if (!cond) failed++; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// parseBrandTokens: per-theme --glaise-* extraction, comment-safe.
{
  const css = `/* note: a token in :root {} applies to both themes */
:root { --glaise-primary: #2257c8; --glaise-canvas: #f3f5f9; }
:root[data-theme='dark'] { --glaise-primary: #2f6df0; }`;
  const t = parseBrandTokens(css);
  ok("light (base) block parsed", t.light["primary"] === "#2257c8" && t.light["canvas"] === "#f3f5f9");
  ok("dark block parsed (single quotes) and inherits the base", t.dark["primary"] === "#2f6df0" && t.dark["canvas"] === "#f3f5f9");
  ok("comment :root {} did not hijack the base block", t.light["primary"] === "#2257c8");
}

// parseArgs: url positional + flags with defaults.
{
  const a = parseArgs(["http://localhost:5173", "--brand", "docs/glaise/brand.css", "--theme", "light"]);
  ok("url parsed", a.url === "http://localhost:5173");
  ok("brand parsed", a.brand === "docs/glaise/brand.css");
  ok("theme parsed", a.theme === "light");
  ok("out default", a.out === "docs/glaise/audit");
  const b = parseArgs(["http://x", "--out", "tmp"]);
  ok("out override + theme default both", b.out === "tmp" && b.theme === "both" && b.brand === undefined);
}

console.log(failed ? `\n${failed} failed` : "\nall tests passed");
process.exit(failed ? 1 : 0);
