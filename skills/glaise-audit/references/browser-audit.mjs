#!/usr/bin/env node
/**
 * Glaise browser audit — deterministic render evidence for glaise-audit.
 *
 *   node browser-audit.mjs <url> [--brand <path>] [--out <dir>] [--theme dark|light|both]
 *
 * Renders a served Glaise build and emits findings: screenshots (dark/light ×
 * desktop/mobile), brand-overlay proof, axe-core a11y/contrast, horizontal
 * overflow, touch-target sizes. Exit 1 on any P0 (overflow, axe critical/serious,
 * overlay mismatch), 2 on usage/operational error, else 0.
 *
 * Playwright + @axe-core/playwright are resolved from the TARGET project's
 * node_modules (run from the project root). They are NOT deps of the skill.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

// ── pure helpers (exported for unit tests; no browser) ───────────────────────
export function parseBrandTokens(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, ""); // comment-safe (contrast.mjs lesson)
  const block = (re) => {
    const m = re.exec(stripped);
    if (!m) return {};
    const open = stripped.indexOf("{", m.index);
    const close = stripped.indexOf("}", open);
    const body = stripped.slice(open + 1, close);
    const out = {};
    for (const mm of body.matchAll(/--glaise-([\w-]+)\s*:\s*([^;]+);/g)) {
      out[mm[1].trim()] = mm[2].trim();
    }
    return out;
  };
  return {
    dark: block(/:root\s*\{/),
    light: block(/:root\[\s*data-theme\s*=\s*['"]?\s*light\s*['"]?\s*\]\s*\{/),
  };
}

export function parseArgs(argv) {
  const args = [...argv];
  const take = (flag) => {
    const i = args.indexOf(flag);
    if (i === -1) return undefined;
    const v = args[i + 1];
    args.splice(i, 2);
    return v;
  };
  const brand = take("--brand");
  const out = take("--out") || "docs/glaise/audit";
  const theme = take("--theme") || "both";
  const url = args.filter((a) => !a.startsWith("--"))[0];
  return { url, brand, out, theme };
}

// ── dep resolution from the TARGET project (not the skill) ───────────────────
function loadDeps() {
  const require = createRequire(path.join(process.cwd(), "noop.js")); // anchor; noop.js need not exist
  const get = (name) => { try { return require(name); } catch { return null; } };
  // require() (CJS) yields the named exports directly (chromium, AxeBuilder); both packages
  // ship CJS today. (The spec originally suggested require.resolve()+dynamic import() for an
  // ESM-only future; require() is reverted-to here because dynamic-importing a CJS file wraps
  // exports under `.default`, complicating the named access. Revisit if either goes ESM-only.)
  const pw = get("playwright");
  const axe = get("@axe-core/playwright");
  const missing = [!pw && "playwright", !axe && "@axe-core/playwright"].filter(Boolean);
  if (missing.length) return { error: `browser-audit: missing ${missing.join(" + ")} — run: npm i -D playwright @axe-core/playwright && npx playwright install chromium` };
  return { chromium: pw.chromium, AxeBuilder: axe.AxeBuilder ?? axe.default ?? axe };
}

async function main() {
  const { url, brand, out, theme } = parseArgs(process.argv.slice(2));
  if (!url || url.startsWith("--")) {
    console.error("usage: browser-audit.mjs <url> [--brand <path>] [--out <dir>] [--theme dark|light|both]");
    process.exit(2);
  }
  const deps = loadDeps();
  if (deps.error) { console.error(deps.error); process.exit(2); }
  const { chromium, AxeBuilder } = deps;

  const themes = theme === "both" ? ["dark", "light"] : [theme];
  const widths = [["desktop", 1280, 900], ["mobile", 375, 740]];
  mkdirSync(out, { recursive: true });
  const expected = brand ? parseBrandTokens(readFileSync(brand, "utf8")) : null;

  const findings = [];
  let p0 = 0;
  const fail = (sev, msg) => { findings.push(`[${sev}] ${msg}`); if (sev === "P0") p0++; };

  let browser;
  try { browser = await chromium.launch(); }
  catch { console.error("chromium not installed — run: npx playwright install chromium"); process.exit(2); }

  for (const t of themes) {
    const context = await browser.newContext();
    await context.addInitScript((th) => {
      try { th === "light" ? localStorage.setItem("glaise-theme", "light") : localStorage.removeItem("glaise-theme"); } catch {}
    }, t);
    const page = await context.newPage();

    for (const [device, w, h] of widths) {
      await page.setViewportSize({ width: w, height: h });
      try { await page.goto(url, { waitUntil: "networkidle", timeout: 15000 }); }
      catch { console.error(`could not load ${url} — is the dev server running?`); await browser.close(); process.exit(2); }
      await page.evaluate((th) => { document.documentElement.dataset.theme = th === "light" ? "light" : ""; }, t);

      const realW = await page.evaluate(() => window.innerWidth);
      await page.screenshot({ path: path.join(out, `audit-${t}-${device}.png`), fullPage: true });
      if (realW !== w) findings.push(`[note] ${t}/${device}: viewport clamped to ${realW}px (requested ${w}px)`);

      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollW - realW > 1) fail("P0", `overflow ${t}/${device}: scrollWidth ${scrollW} > innerWidth ${realW}`);

      if (device === "mobile") {
        const small = await page.evaluate(() => {
          const sel = "button, a, [role=button], input:not([type=hidden]), select, textarea, [tabindex]";
          return [...document.querySelectorAll(sel)]
            .filter((el) => {
              if (el.getAttribute("tabindex") === "-1") return false;
              const vis = el.checkVisibility ? el.checkVisibility() : !!el.offsetParent;
              const r = el.getBoundingClientRect();
              return vis && r.width > 0 && r.height > 0;
            })
            .filter((el) => { const r = el.getBoundingClientRect(); return r.width < 44 || r.height < 44; })
            .slice(0, 15)
            .map((el) => { const r = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()} ${Math.round(r.width)}×${Math.round(r.height)}`; });
        });
        for (const s of small) fail("P1", `touch target < 44px (${t}/mobile): ${s}`);
      }
    }

    // desktop analysis pass — overlay (if a brand was given) and axe both run at 1280×900
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: "networkidle" }).catch(() => {});
    await page.evaluate((th) => { document.documentElement.dataset.theme = th === "light" ? "light" : ""; }, t);

    // overlay check (desktop), if a brand was given
    if (expected) {
      for (const [token, val] of Object.entries(expected[t] || {})) {
        const r = await page.evaluate(({ token, val }) => {
          const probe = document.createElement("span");
          document.body.appendChild(probe);
          probe.style.color = `var(--glaise-${token})`;
          const actual = getComputedStyle(probe).color;
          probe.style.color = val;
          const want = getComputedStyle(probe).color;
          probe.remove();
          return { actual, want };
        }, { token, val });
        if (r.actual !== r.want) fail("P0", `brand overlay ${t}: --glaise-${token} resolved ${r.actual}, expected ${r.want}`);
      }
    }

    // axe (desktop)
    try {
      const results = await new AxeBuilder({ page }).analyze();
      for (const v of results.violations) {
        const serious = v.impact === "critical" || v.impact === "serious";
        fail(serious ? "P0" : "P1", `axe ${t}: ${v.id} (${v.impact}) ×${v.nodes.length} — ${v.help}`);
      }
    } catch (e) { findings.push(`[note] axe failed on ${t}: ${e.message}`); }

    await context.close();
  }
  await browser.close();

  console.log(`\n  Glaise browser audit — ${url}`);
  console.log(`  themes: ${themes.join(", ")} · screenshots: ${out}`);
  const uniq = [...new Set(findings)];
  if (!uniq.length) console.log("\n  No findings. (screenshots written for craft review.)");
  else { console.log(""); for (const f of uniq) console.log("  " + f); }
  console.log("");
  process.exit(p0 > 0 ? 1 : 0);
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] || "").href;
if (isMain) main();
