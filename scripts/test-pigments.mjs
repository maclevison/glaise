#!/usr/bin/env node
// Tests for the curated pigment packs — contract + AA on both themes.
// Run: node scripts/test-pigments.mjs   (zero deps; AA delegates to contrast.mjs --brand)
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PIGMENTS_DIR = "skills/glaise-brand/references/pigments";
const CONTRAST = "skills/glaise/references/contrast.mjs";
// The engine is never brandable — a pigment must not touch these prefixes.
const DENYLIST = ["--glaise-text-", "--glaise-space-", "--glaise-ease-", "--glaise-duration-"];

let failed = 0;
const ok = (name, cond) => { console.log(`${cond ? "✓" : "✗"} ${name}`); if (!cond) failed++; };

ok("pigments dir exists", existsSync(PIGMENTS_DIR));
const files = existsSync(PIGMENTS_DIR)
  ? readdirSync(PIGMENTS_DIR).filter((f) => f.endsWith(".css"))
  : [];
ok("at least one pigment ships", files.length > 0);

for (const f of files) {
  const p = join(PIGMENTS_DIR, f);
  const css = readFileSync(p, "utf8");
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // Header: accept the pigment form or the brand.css.example form.
  ok(`${f}: header identifies a pigment or brand pack`,
    /^\/\*\s*Glaise (pigment|brand pack)/.test(css));

  // Both theme blocks present. Convention: :root is the dark block (as in tokens.css),
  // so the opposite block must be the LIGHT one — contrast.mjs --brand only overlays
  // :root + the light block, so a data-theme="dark" block would silently escape AA.
  ok(`${f}: has :root block`, /:root\s*\{/.test(noComments));
  ok(`${f}: has light-theme block`,
    /:root\[\s*data-theme\s*=\s*['"]?light['"]?\s*\]\s*\{/.test(noComments));

  // Only --glaise-* custom properties, none on the engine denylist.
  const props = [...noComments.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]);
  ok(`${f}: declares only --glaise-* tokens`,
    props.length > 0 && props.every((t) => t.startsWith("--glaise-")));
  const engine = props.filter((t) => DENYLIST.some((d) => t.startsWith(d)));
  ok(`${f}: no engine token overridden${engine.length ? ` (found ${engine.join(", ")})` : ""}`,
    engine.length === 0);

  // AA on both themes over the effective tokens (contrast.mjs exits 1 on any failing pair).
  let aa = true, out = "";
  try { out = execFileSync("node", [CONTRAST, "--brand", p], { encoding: "utf8" }); }
  catch (e) { aa = false; out = (e.stdout || "") + (e.stderr || ""); }
  ok(`${f}: AA clears on both themes`, aa);
  if (!aa) console.log(out.split("\n").filter((l) => /✗|suggest/.test(l)).map((l) => "    " + l).join("\n"));
}

console.log(failed ? `\n${failed} check(s) failed` : "\nall pigment checks passed");
process.exit(failed ? 1 : 0);
