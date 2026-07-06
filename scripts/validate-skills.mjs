#!/usr/bin/env node
// Glaise foundation validator — zero deps, run with: node scripts/validate-skills.mjs
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const SKILLS_DIR = "skills";
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const errors = [];

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  const lines = m[1].split("\n");
  for (let i = 0; i < lines.length; i++) {
    const mm = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!mm) continue;
    const key = mm[1];
    let val = mm[2];
    // Block scalar (| or >) or empty: collect following more-indented lines.
    if (val === "|" || val === ">" || val === "") {
      const collected = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
        collected.push(lines[++i].trim());
      }
      if (collected.length) val = collected.join(" ");
    }
    // Strip a single pair of surrounding quotes.
    val = val.trim().replace(/^(['"])([\s\S]*)\1$/, "$2");
    fm[key] = val;
  }
  return fm;
}

// 1. Portability of every skill under skills/
if (!existsSync(SKILLS_DIR)) {
  errors.push(`missing ${SKILLS_DIR}/`);
} else {
  for (const entry of readdirSync(SKILLS_DIR)) {
    const dir = join(SKILLS_DIR, entry);
    if (!statSync(dir).isDirectory()) continue;
    const skillFile = join(dir, "SKILL.md");
    if (!existsSync(skillFile)) { errors.push(`${entry}: missing SKILL.md`); continue; }
    const fm = frontmatter(readFileSync(skillFile, "utf8"));
    if (!fm) { errors.push(`${entry}: missing or malformed frontmatter`); continue; }
    if (!fm.name) {
      errors.push(`${entry}: frontmatter missing 'name'`);
    } else {
      if (fm.name !== entry) errors.push(`${entry}: name "${fm.name}" must match folder name`);
      if (fm.name.includes(":")) errors.push(`${entry}: name must not contain ':' (not portable to OpenCode)`);
      if (!NAME_RE.test(fm.name)) errors.push(`${entry}: name "${fm.name}" must be kebab-case [a-z0-9-]`);
    }
    if (!fm.description) errors.push(`${entry}: frontmatter missing 'description'`);
    else if (fm.description.length > 1024) errors.push(`${entry}: description exceeds 1024 chars`);
  }
}

// 2. Token-chain integrity for the glaise skill
const tokensPath = join(SKILLS_DIR, "glaise/references/tokens.css");
const themePath = join(SKILLS_DIR, "glaise/references/theme.css");
if (existsSync(tokensPath) && existsSync(themePath)) {
  const tokens = readFileSync(tokensPath, "utf8");
  const theme = readFileSync(themePath, "utf8");
  const defined = new Set([...tokens.matchAll(/(--glaise-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  for (const m of theme.matchAll(/var\((--glaise-[a-z0-9-]+)\)/g)) {
    if (!defined.has(m[1])) errors.push(`theme.css references ${m[1]} not defined in tokens.css`);
  }
  const themeBlock = theme.match(/@theme\s*\{([\s\S]*?)\}/);
  if (themeBlock && /#[0-9a-fA-F]{3,8}\b/.test(themeBlock[1])) {
    errors.push("theme.css @theme block contains raw hex — must reference tokens.css vars");
  }
} else {
  errors.push("glaise skill: missing references/tokens.css or references/theme.css");
}

// 3. glaise-discovery brief-template integrity (only if the skill exists)
const discoveryPath = join(SKILLS_DIR, "glaise-discovery/SKILL.md");
if (existsSync(discoveryPath)) {
  const disc = readFileSync(discoveryPath, "utf8");
  // Anchor the section check to the brief template block, not the whole file.
  const briefBlock = (disc.match(/```markdown\n([\s\S]*?)```/g) || []).find((b) => /#\s+Glaise Brief/.test(b)) || "";
  if (!briefBlock) errors.push("glaise-discovery: missing the glaise-brief.md template block");
  const requiredSections = ["Product", "User", "Task", "Domain", "Feel", "Signature"];
  const missing = requiredSections.filter((s) => !new RegExp(`##\\s+${s}\\b`).test(briefBlock));
  if (missing.length) errors.push(`glaise-discovery: brief template missing section(s): ${missing.join(", ")}`);
  if (!/glaise-brief\.md/.test(disc)) errors.push("glaise-discovery: must reference glaise-brief.md output");
}

// 4. glaise-build must reference the skin and the brief (only if it exists)
const buildPath = join(SKILLS_DIR, "glaise-build/SKILL.md");
if (existsSync(buildPath)) {
  const build = readFileSync(buildPath, "utf8");
  const mustMention = ["glaise-brief.md", "tokens.css", "theme.css", "Base UI", "Reka UI", "Lucide"];
  const absent = mustMention.filter((s) => !build.includes(s));
  if (absent.length) errors.push(`glaise-build: must reference skin/brief, missing: ${absent.join(", ")}`);
}

// 5. glaise-review must reference the brief, the skin, and the uniqueness test (only if it exists)
const reviewPath = join(SKILLS_DIR, "glaise-review/SKILL.md");
if (existsSync(reviewPath)) {
  const review = readFileSync(reviewPath, "utf8");
  const mustMention = ["glaise-brief.md", "tokens.css", "signature", "Lucide", "Base UI", "Reka UI"];
  const absent = mustMention.filter((s) => !review.includes(s));
  if (absent.length) errors.push(`glaise-review: must reference brief/skin/signature, missing: ${absent.join(", ")}`);
}

// 6. glaise-direction must keep the skin fixed and reference the brief/signature (only if it exists)
const directionPath = join(SKILLS_DIR, "glaise-direction/SKILL.md");
if (existsSync(directionPath)) {
  const direction = readFileSync(directionPath, "utf8");
  const mustMention = ["glaise-brief.md", "signature", "Inter", "surface ladder", "Lucide"];
  const absent = mustMention.filter((s) => !direction.includes(s));
  if (absent.length) errors.push(`glaise-direction: must reference skin/brief, missing: ${absent.join(", ")}`);
}

// 7. The canonical tokens must ship a light theme block redefining the core surfaces
if (existsSync(tokensPath)) {
  const tokensLight = readFileSync(tokensPath, "utf8");
  const lightBlock = tokensLight.match(/:root\[data-theme="light"\]\s*\{([\s\S]*?)\}/);
  if (!lightBlock) {
    errors.push('tokens.css: missing :root[data-theme="light"] block');
  } else {
    const need = ["--glaise-canvas", "--glaise-ink", "--glaise-surface-1", "--glaise-hairline", "--glaise-primary"];
    const miss = need.filter((v) => !new RegExp(v + "\\s*:").test(lightBlock[1]));
    if (miss.length) errors.push(`tokens.css light theme missing: ${miss.join(", ")}`);
  }
}

// 8. design.md is value-free for BRANDABLE values — color/surface/radius/spacing live in
//    tokens.css (the single source) and a brand overrides them; design.md must not duplicate
//    or pin those literals. This check guards them via the hex + structured-block scans.
//    px is intentionally out of scope: the invariant type scale (weights, line-heights,
//    tracking) legitimately documents structural px here — a brand cannot override it.
const designPath = join(SKILLS_DIR, "glaise/references/design.md");
if (existsSync(designPath)) {
  const design = readFileSync(designPath, "utf8");
  const hexes = design.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  if (hexes.length) {
    errors.push(
      `design.md must be value-free (values live in tokens.css); found ${hexes.length} literal hex value(s): ${[...new Set(hexes)].slice(0, 5).join(", ")}${hexes.length > 5 ? " …" : ""}`,
    );
  }
  if (/^\s*(colors|typography|spacing|radius):\s*$/m.test(design)) {
    errors.push("design.md must not carry a structured colors/typography/spacing/radius token block — that duplicates tokens.css");
  }
}

// 9. glaise-brand: the brand-interview skill must reference its output (brand.css),
//    write under docs/glaise/, and ship the brand.css contract example.
const brandPath = join(SKILLS_DIR, "glaise-brand/SKILL.md");
if (existsSync(brandPath)) {
  const brand = readFileSync(brandPath, "utf8");
  const mustMention = ["brand.css", "docs/glaise/", "tokens.css", "glaise-audit"];
  const absent = mustMention.filter((s) => !brand.includes(s));
  if (absent.length) errors.push(`glaise-brand: must reference output/skin, missing: ${absent.join(", ")}`);
  if (!existsSync(join(SKILLS_DIR, "glaise-brand/references/brand.css.example"))) {
    errors.push("glaise-brand: missing references/brand.css.example (the brand.css contract)");
  }
}

// 10. Brand orchestration is reconciled: the old import-based override is gone,
//     the hub and build know the canonical brand.css, and nothing references the
//     retired brand-overrides.css filename as a live mechanism.
for (const [name, rel] of [["glaise", "glaise/SKILL.md"], ["glaise-build", "glaise-build/SKILL.md"], ["glaise-discovery", "glaise-discovery/SKILL.md"]]) {
  const p = join(SKILLS_DIR, rel);
  if (!existsSync(p)) continue;
  const txt = readFileSync(p, "utf8");
  if (/brand-overrides\.css/.test(txt) && !/retired|legacy|superseded/i.test(txt)) {
    errors.push(`${name}: references brand-overrides.css without marking it retired/legacy — use docs/glaise/brand.css`);
  }
}
const hubTxt = existsSync(join(SKILLS_DIR, "glaise/SKILL.md")) ? readFileSync(join(SKILLS_DIR, "glaise/SKILL.md"), "utf8") : "";
if (hubTxt && (!hubTxt.includes("glaise-brand") || !hubTxt.includes("brand.css"))) {
  errors.push("glaise hub: must orchestrate glaise-brand and mention brand.css");
}
const buildTxt2 = existsSync(buildPath) ? readFileSync(buildPath, "utf8") : "";
if (buildTxt2 && /##\s+Brand override \(optional\)/.test(buildTxt2)) {
  errors.push("glaise-build: the import-based 'Brand override (optional)' section must be removed (superseded by glaise-brand)");
}
if (buildTxt2 && !buildTxt2.includes("brand.css")) {
  errors.push("glaise-build: must load docs/glaise/brand.css if present");
}

// 11. glaise-audit must reference the browser-audit helper and keep the optional/fallback
//     framing (so the conditional render-tool pattern isn't lost in a future edit).
const auditPath = join(SKILLS_DIR, "glaise-audit/SKILL.md");
if (existsSync(auditPath)) {
  const audit = readFileSync(auditPath, "utf8");
  if (!audit.includes("browser-audit.mjs")) errors.push("glaise-audit: must reference browser-audit.mjs");
  if (audit.includes("browser-audit.mjs") && !/optional|fall back|fallback/i.test(audit)) {
    errors.push("glaise-audit: browser-audit.mjs must stay optional with a manual fallback");
  }
  if (!existsSync(join(SKILLS_DIR, "glaise-audit/references/browser-audit.mjs"))) {
    errors.push("glaise-audit: missing references/browser-audit.mjs");
  }
}

// 12. Pigments: the curated packs in glaise-brand/references/pigments/ and the
//     Pigments table in glaise-brand/SKILL.md must name the same set.
const pigmentsDir = join(SKILLS_DIR, "glaise-brand/references/pigments");
if (existsSync(brandPath)) {
  const brandTxt = readFileSync(brandPath, "utf8");
  const pigmentFiles = existsSync(pigmentsDir)
    ? readdirSync(pigmentsDir).filter((f) => f.endsWith(".css")).map((f) => f.replace(/\.css$/, ""))
    : [];
  if (!pigmentFiles.length) errors.push("glaise-brand: missing references/pigments/ packs");
  // Table rows: | Celadon | ... — first cell is the pigment name. Bound the scan to the
  // Pigments section (up to the next ## heading) so future tables can't leak rows in.
  const section = (brandTxt.split(/^##\s+Pigments\b/m)[1] || "").split(/^##\s+/m)[0];
  const tableNames = [...section.matchAll(/^\|\s*\*{0,2}([A-Za-z][\w-]*)\*{0,2}\s*\|/gm)]
    .map((m) => m[1].toLowerCase())
    .filter((n) => !["pigment", "---"].includes(n));
  if (!section) errors.push("glaise-brand: SKILL.md missing '## Pigments' section");
  for (const f of pigmentFiles) if (!tableNames.includes(f))
    errors.push(`glaise-brand: pigments/${f}.css not listed in the Pigments table`);
  for (const n of tableNames) if (!pigmentFiles.includes(n))
    errors.push(`glaise-brand: Pigments table lists "${n}" with no pigments/${n}.css`);
}

if (errors.length) {
  console.error("✗ Glaise validation failed:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("✓ Glaise validation passed");
