#!/usr/bin/env node
// Integration test for browser-audit.mjs — needs chromium. Run: node scripts/test-browser-audit-integration.mjs
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Skip if Playwright isn't installed in this project (keeps the zero-dep repo green in CI).
const require = createRequire(join(process.cwd(), "noop.js"));
try { require.resolve("playwright"); require.resolve("@axe-core/playwright"); }
catch { console.log("• integration test skipped — Playwright not installed (npm i -D playwright @axe-core/playwright && npx playwright install chromium)"); process.exit(0); }

let failed = 0;
const ok = (name, cond) => { console.log(`${cond ? "✓" : "✗"} ${name}`); if (!cond) failed++; };

// Two fixtures: a clean page and an overflowing one. The head MUST be axe-clean (lang +
// title + a main landmark + sufficient contrast) so the only `serious`/`critical` signal is
// the one each test intends — otherwise document-title/html-has-lang would force exit 1.
// The overlay check uses its own probe element, so --glaise-primary need not be visible.
const page = (overflow) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>fixture</title><style>
  :root { --glaise-primary: #2f6df0; --glaise-canvas: #07090d; color-scheme: dark; }
  :root[data-theme="light"] { --glaise-canvas: #f4f5f7; }
  body { margin:0; background:#07090d; color:#ffffff; font-size:18px; }
  button { min-width:44px; min-height:44px; }
  ${overflow ? ".wide{width:3000px;height:10px;background:#333}" : ""}
</style></head><body>
  <main><h1>Hello</h1><button>Click</button>${overflow ? '<div class="wide"></div>' : ""}</main>
</body></html>`;

function serve(html) {
  // Bind explicitly to 127.0.0.1 (not localhost): a chromium subprocess can fail to reach a
  // parent's in-process server via the "localhost" alias under network isolation.
  const server = createServer((_, res) => { res.setHeader("content-type", "text/html"); res.end(html); });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}
function runHelper(url, extra = []) {
  const out = mkdtempSync(join(tmpdir(), "ba-out-"));
  try {
    const stdout = execFileSync("node", ["skills/glaise-audit/references/browser-audit.mjs", url, "--out", out, "--theme", "dark", ...extra], { encoding: "utf8" });
    return { code: 0, output: stdout, out };
  } catch (e) { return { code: e.status ?? 1, output: (e.stdout || "") + (e.stderr || ""), out }; }
}

// Operational skip-gate: if the helper can't run the browser here (exit 2 — chromium
// missing, or the browser subprocess can't reach this in-process server under network
// isolation), SKIP rather than fail. The logic is unverifiable here, not wrong.
{
  const { server, url } = await serve(page(false));
  const probe = runHelper(url);
  server.close();
  if (probe.code === 2) {
    console.log("• integration test skipped — browser run not operational here (chromium/network isolation): " + (probe.output || "").trim());
    process.exit(0);
  }
}

// Test 1: clean page → exit 0, screenshot written.
{
  const { server, url } = await serve(page(false));
  const r = runHelper(url);
  ok("clean page exits 0", r.code === 0);
  ok("screenshot written", existsSync(r.out) && readdirSync(r.out).some((f) => f.endsWith(".png")));
  server.close();
}

// Test 2: overflowing page → exit 1 with an overflow finding (assert the reason, not just the code).
{
  const { server, url } = await serve(page(true));
  const r = runHelper(url);
  ok("overflow page exits 1", r.code === 1);
  ok("overflow finding present (right reason)", /overflow/i.test(r.output));
  server.close();
}

// Test 3: brand overlay — matching brand passes, mismatched brand is flagged.
{
  const { server, url } = await serve(page(false));
  const dir = mkdtempSync(join(tmpdir(), "ba-brand-"));
  // matching: same value the fixture renders
  const match = join(dir, "match.css"); writeFileSync(match, `:root { --glaise-primary: #2f6df0; }`);
  const r1 = runHelper(url, ["--brand", match]);
  ok("matching brand overlay passes (exit 0)", r1.code === 0);
  // mismatched: a value the page does NOT render (also covers color-mix normalization via probe)
  const miss = join(dir, "miss.css"); writeFileSync(miss, `:root { --glaise-primary: color-mix(in srgb, #ff0000, #ffffff 0%); }`);
  const r2 = runHelper(url, ["--brand", miss]);
  ok("mismatched brand overlay flagged (exit 1)", r2.code === 1);
  ok("overlay finding present (right reason)", /brand overlay/i.test(r2.output));
  server.close();
}

console.log(failed ? `\n${failed} failed` : "\nall integration tests passed");
process.exit(failed ? 1 : 0);
