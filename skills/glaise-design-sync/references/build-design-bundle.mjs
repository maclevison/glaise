#!/usr/bin/env node
// Glaise — build-design-bundle: generates @dsCard preview HTMLs for Claude Design
// from the EFFECTIVE skin (tokens.css + the project's docs/glaise/brand.css, if any).
// Zero dependencies. Usage:
//   node build-design-bundle.mjs [--project <dir>] [--out <dir>]
// Defaults: --project = cwd, --out = <project>/docs/glaise/design-bundle
//
// Output: self-contained HTML cards (first line `<!-- @dsCard group="…" viewport="WxH" -->`)
// plus a _ds_manifest.json indexing them, so an incremental sync lists the new cards
// immediately instead of waiting for Claude Design's self-check to reprocess the project.
// Components style exclusively via var(--glaise-*); raw values exist only in the
// per-theme variable blocks, so a client brand.css flows through automatically.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- args -----------------------------------------------------------------
const argv = process.argv.slice(2);
function arg(name) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
}
const project = resolve(arg("--project") || process.cwd());
const outDir = resolve(arg("--out") || join(project, "docs/glaise/design-bundle"));

// --- locate the skin ------------------------------------------------------
// Works from the repo (skills/glaise-design-sync/references/ → skills/glaise/references/)
// and from any install layout, since glaise-design-sync is always a sibling of glaise.
const tokensPath = join(__dirname, "../../glaise/references/tokens.css");
if (!existsSync(tokensPath)) {
  console.error(`✗ tokens.css not found at ${tokensPath} — is the glaise skill installed next to glaise-design-sync?`);
  process.exit(1);
}
const brandPath = join(project, "docs/glaise/brand.css");
const hasBrand = existsSync(brandPath);

// --- parse CSS custom properties per theme --------------------------------
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}
function parseVars(css) {
  const light = {}, dark = {};
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(stripComments(css)))) {
    const sel = m[1].trim();
    const target = /data-theme=["']?dark["']?/.test(sel) ? dark : /:root/.test(sel) ? light : null;
    if (!target) continue;
    const varRe = /(--glaise-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let v;
    while ((v = varRe.exec(m[2]))) target[v[1]] = v[2].trim();
  }
  return { light, dark };
}

const base = parseVars(readFileSync(tokensPath, "utf8"));
const brand = hasBrand ? parseVars(readFileSync(brandPath, "utf8")) : { light: {}, dark: {} };

// Effective faces, mirroring the REAL CSS cascade. Specificity beats source order:
// `:root[data-theme="dark"]` (0,2,0) always wins over `:root` (0,1,0), so a brand
// token declared only in :root does NOT reach dark when tokens.css redefines that
// token in its dark block — exactly what a browser renders. A brand token absent
// from the base dark block falls through to both faces. Brands that change a
// dark-redefined token on both faces must ship their own dark block
// (the glaise-brand contract).
const light = { ...base.light, ...brand.light };
const dark = { ...light, ...base.dark, ...brand.dark };

const V = (name) => {
  if (!(name in light)) throw new Error(`token ${name} not defined in the effective skin`);
  return light[name];
};

// --- card scaffolding -----------------------------------------------------
const varBlock = (vars) =>
  Object.entries(vars).map(([k, v]) => `    ${k}: ${v};`).join("\n");

const SHARED_CSS = `
  body{margin:0;padding:24px;background:#fff}
  .themes{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
  .themes.single{grid-template-columns:1fr}
  .theme{border-radius:16px;padding:20px;background:var(--glaise-canvas);color:var(--glaise-ink);
    font-family:var(--glaise-font-sans);font-size:14px;line-height:1.5}
  .theme>h3{margin:0 0 14px;font-size:12px;font-weight:600;text-transform:uppercase;
    letter-spacing:.06em;color:var(--glaise-ink-subtle)}
  .lbl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;
    color:var(--glaise-ink-subtle);margin:14px 0 6px}`;

function card({ group, viewport, title, extraCss, body, single = false }) {
  const sections = single
    ? `<section class="theme theme-light"><h3>Light</h3>${body(light)}</section>`
    : `<section class="theme theme-light"><h3>Light</h3>${body(light)}</section>
  <section class="theme theme-dark"><h3>Dark</h3>${body(dark)}</section>`;
  return `<!-- @dsCard group="${group}" viewport="${viewport}" -->
<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  .theme-light{
${varBlock(light)}
  }
  .theme-dark{
${varBlock(dark)}
  }
${SHARED_CSS}
${extraCss || ""}
</style></head><body>
<div class="themes${single ? " single" : ""}">
  ${sections}
</div>
</body></html>
`;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// --- foundations ----------------------------------------------------------
const swatch = (token, label) => `
      <div class="sw"><div class="chip" style="background:var(${token})"></div><small>${label || token.replace("--glaise-", "")}</small></div>`;

const colorsCard = card({
  group: "Foundations",
  viewport: "900x680",
  title: "Glaise — Colors",
  extraCss: `
  .row{display:flex;gap:8px;flex-wrap:wrap}
  .sw{flex:1 1 72px;min-width:72px}
  .chip{height:44px;border-radius:var(--glaise-radius-md);border:1px solid var(--glaise-hairline)}
  .sw small{display:block;margin-top:4px;font-size:10px;color:var(--glaise-ink-subtle);
    font-family:var(--glaise-font-mono)}`,
  body: () => `
    <div class="lbl">Surface ladder</div>
    <div class="row">${["--glaise-canvas", "--glaise-chrome", "--glaise-surface-1", "--glaise-surface-2", "--glaise-surface-3", "--glaise-surface-4"].map((t) => swatch(t)).join("")}
    </div>
    <div class="lbl">Ink ramp</div>
    <div class="row">${["--glaise-ink", "--glaise-ink-muted", "--glaise-ink-subtle", "--glaise-ink-tertiary"].map((t) => swatch(t)).join("")}
    </div>
    <div class="lbl">Primary &amp; semantic</div>
    <div class="row">${["--glaise-primary", "--glaise-primary-hover", "--glaise-success", "--glaise-danger"].map((t) => swatch(t)).join("")}
    </div>
    <div class="lbl">Hairlines</div>
    <div class="row">${["--glaise-hairline", "--glaise-hairline-strong", "--glaise-hairline-tertiary"].map((t) => swatch(t)).join("")}
    </div>`,
});

const TYPE_SCALE = [
  ["--glaise-text-headline", "Headline"],
  ["--glaise-text-card-title", "Card title"],
  ["--glaise-text-subhead", "Subhead"],
  ["--glaise-text-body-lg", "Body large"],
  ["--glaise-text-body", "Body"],
  ["--glaise-text-body-sm", "Body small"],
  ["--glaise-text-eyebrow", "Eyebrow"],
  ["--glaise-text-caption", "Caption"],
  ["--glaise-text-microlabel", "Microlabel"],
];

const typographyCard = card({
  group: "Foundations",
  viewport: "900x760",
  title: "Glaise — Typography",
  single: true,
  extraCss: `
  .trow{display:flex;align-items:baseline;gap:16px;padding:8px 0;border-bottom:1px solid var(--glaise-hairline)}
  .trow small{flex:0 0 190px;font-family:var(--glaise-font-mono);font-size:11px;color:var(--glaise-ink-subtle)}
  .metric{font-size:var(--glaise-text-metric);font-weight:600}
  .micro{text-transform:uppercase;letter-spacing:.06em;font-weight:600;color:var(--glaise-ink-subtle)}`,
  body: (vars) => `
    <div class="lbl">Family</div>
    <div style="font-size:var(--glaise-text-subhead)">${esc(vars["--glaise-font-sans"])}</div>
    <div class="lbl">Scale</div>
    ${TYPE_SCALE.map(
      ([t, label]) => `<div class="trow"><small>${t.replace("--glaise-text-", "")} · ${esc(vars[t])}</small><span style="font-size:var(${t})${t.endsWith("microlabel") ? "" : ""}" class="${t.endsWith("microlabel") ? "micro" : ""}">${label} — Aa Bb Cc 0123</span></div>`
    ).join("\n    ")}
    <div class="trow"><small>metric · ${esc(V("--glaise-text-metric"))}</small><span class="metric">R$ 48.290</span></div>`,
});

const SPACE_SCALE = ["xxs", "xs", "sm", "md", "lg", "xl", "xxl"];
const RADIUS_SCALE = ["xs", "sm", "md", "lg", "xl", "xxl", "pill"];

const spacingCard = card({
  group: "Foundations",
  viewport: "900x600",
  title: "Glaise — Spacing & Radii",
  single: true,
  extraCss: `
  .srow{display:flex;align-items:center;gap:16px;padding:5px 0}
  .srow small{flex:0 0 150px;font-family:var(--glaise-font-mono);font-size:11px;color:var(--glaise-ink-subtle)}
  .bar{height:14px;background:var(--glaise-primary);border-radius:2px}
  .rrow{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}
  .rchip{width:72px;height:52px;background:var(--glaise-surface-1);border:1px solid var(--glaise-hairline-strong)}
  .rwrap{text-align:center}
  .rwrap small{font-family:var(--glaise-font-mono);font-size:10px;color:var(--glaise-ink-subtle)}`,
  body: (vars) => `
    <div class="lbl">Spacing (4px base)</div>
    ${SPACE_SCALE.map(
      (s) => `<div class="srow"><small>space-${s} · ${esc(vars[`--glaise-space-${s}`])}</small><div class="bar" style="width:var(--glaise-space-${s})"></div></div>`
    ).join("\n    ")}
    <div class="lbl">Radius</div>
    <div class="rrow">
    ${RADIUS_SCALE.map(
      (r) => `<div class="rwrap"><div class="rchip" style="border-radius:var(--glaise-radius-${r})"></div><small>${r} · ${esc(vars[`--glaise-radius-${r}`])}</small></div>`
    ).join("\n    ")}
    </div>`,
});

const surfacesCard = card({
  group: "Foundations",
  viewport: "900x560",
  title: "Glaise — Surface ladder",
  extraCss: `
  .shell{display:flex;border-radius:var(--glaise-radius-lg);overflow:hidden;border:1px solid var(--glaise-hairline)}
  .chrome{flex:0 0 84px;background:var(--glaise-chrome);padding:12px 10px}
  .navitem{height:10px;border-radius:4px;margin-bottom:8px;background:var(--glaise-fill-hover)}
  .navitem.sel{background:var(--glaise-fill-selected)}
  .cv{flex:1;background:var(--glaise-canvas);padding:14px}
  .s1{background:var(--glaise-surface-1);border-radius:var(--glaise-radius-lg);
    box-shadow:var(--glaise-shadow-1);padding:12px}
  .s2{background:var(--glaise-surface-2);border-radius:var(--glaise-radius-md);
    border:1px solid var(--glaise-hairline);padding:10px;margin-top:10px;
    font-size:var(--glaise-text-body-sm);color:var(--glaise-ink-muted)}
  .overlay{background:var(--glaise-surface-1);border-radius:var(--glaise-radius-md);
    box-shadow:var(--glaise-shadow-2);padding:10px;margin-top:12px;width:60%;
    font-size:var(--glaise-text-body-sm)}`,
  body: () => `
    <div class="shell">
      <aside class="chrome"><div class="navitem sel"></div><div class="navitem"></div><div class="navitem"></div></aside>
      <div class="cv">
        <div class="s1">surface-1 — card lifts from the canvas
          <div class="s2">surface-2 — nested well</div>
        </div>
        <div class="overlay">overlay — shadow-2</div>
      </div>
    </div>`,
});

// --- components -----------------------------------------------------------
const BTN_CSS = `
  .btn{font-family:var(--glaise-font-sans);font-size:var(--glaise-text-body-sm);font-weight:600;
    line-height:1;border-radius:var(--glaise-radius-md);padding:10px 16px;border:1px solid transparent;
    cursor:pointer;transition:background var(--glaise-duration-fast) var(--glaise-ease-out)}
  .btn-primary{background:var(--glaise-primary);color:var(--glaise-on-primary)}
  .btn-primary:hover,.btn-primary.hover{background:var(--glaise-primary-hover)}
  .btn-secondary{background:var(--glaise-surface-1);color:var(--glaise-ink);border-color:var(--glaise-hairline-strong)}
  .btn-ghost{background:transparent;color:var(--glaise-ink)}
  .btn-ghost:hover{background:var(--glaise-fill-hover)}
  .btn:disabled{opacity:.45;cursor:not-allowed}
  .btn.focus,.btn:focus-visible{outline:2px solid var(--glaise-primary-focus);outline-offset:2px}
  .row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}`;

const buttonCard = card({
  group: "Components",
  viewport: "900x460",
  title: "Glaise — Button",
  extraCss: BTN_CSS,
  body: () => `
    <div class="lbl">Variants</div>
    <div class="row">
      <button class="btn btn-primary">Primary</button>
      <button class="btn btn-secondary">Secondary</button>
      <button class="btn btn-ghost">Ghost</button>
    </div>
    <div class="lbl">States</div>
    <div class="row">
      <button class="btn btn-primary hover">Hover</button>
      <button class="btn btn-primary focus">Focus</button>
      <button class="btn btn-primary" disabled>Disabled</button>
    </div>`,
});

const inputCard = card({
  group: "Components",
  viewport: "900x560",
  title: "Glaise — Input",
  extraCss: `
  .field{margin-bottom:14px;max-width:340px}
  .field label{display:block;font-size:var(--glaise-text-body-sm);font-weight:600;margin-bottom:6px}
  .in{width:100%;box-sizing:border-box;font-family:var(--glaise-font-sans);
    font-size:var(--glaise-text-body-sm);color:var(--glaise-ink);
    background:var(--glaise-surface-1);border:1px solid var(--glaise-hairline-strong);
    border-radius:var(--glaise-radius-md);padding:9px 12px}
  .in::placeholder{color:var(--glaise-ink-tertiary)}
  .in.focus{outline:2px solid var(--glaise-primary-focus);outline-offset:1px}
  .in.error{border-color:var(--glaise-danger)}
  .help{font-size:var(--glaise-text-caption);color:var(--glaise-ink-subtle);margin-top:4px}
  .help.error{color:var(--glaise-danger)}`,
  body: () => `
    <div class="field"><label>Default</label><input class="in" placeholder="Placeholder"></div>
    <div class="field"><label>Focus</label><input class="in focus" value="Valor digitado"></div>
    <div class="field"><label>Error</label><input class="in error" value="valor-inválido">
      <div class="help error">Mensagem de erro do campo.</div></div>
    <div class="field"><label>Disabled</label><input class="in" disabled value="Somente leitura">
      <div class="help">Texto de apoio do campo.</div></div>`,
});

const cardCard = card({
  group: "Components",
  viewport: "900x480",
  title: "Glaise — Card & Stat",
  extraCss: `
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .kard{background:var(--glaise-surface-1);border-radius:var(--glaise-radius-lg);
    box-shadow:var(--glaise-shadow-1);padding:16px}
  .micro{font-size:var(--glaise-text-microlabel);font-weight:600;text-transform:uppercase;
    letter-spacing:.06em;color:var(--glaise-ink-subtle)}
  .metric{font-size:var(--glaise-text-metric);font-weight:600;margin-top:4px}
  .delta{font-size:var(--glaise-text-caption);color:var(--glaise-success);margin-top:2px}
  .ktitle{font-size:var(--glaise-text-card-title);font-weight:600;margin:0 0 6px}
  .kbody{font-size:var(--glaise-text-body-sm);color:var(--glaise-ink-muted)}`,
  body: () => `
    <div class="grid2">
      <div class="kard"><div class="micro">Receita do mês</div>
        <div class="metric">R$ 48.290</div><div class="delta">▲ 12% vs mês anterior</div></div>
      <div class="kard"><h4 class="ktitle">Card title</h4>
        <p class="kbody">Corpo do card em body-sm sobre surface-1, separado do canvas por valor.</p></div>
    </div>`,
});

const badgeCard = card({
  group: "Components",
  viewport: "900x400",
  title: "Glaise — Badge & Status",
  extraCss: `
  .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  .badge{display:inline-flex;align-items:center;gap:6px;font-size:var(--glaise-text-caption);
    font-weight:600;padding:4px 10px;border-radius:var(--glaise-radius-pill);
    background:var(--glaise-surface-2);border:1px solid var(--glaise-hairline)}
  .dot{width:7px;height:7px;border-radius:var(--glaise-radius-full)}
  .dot.ok{background:var(--glaise-success)}
  .dot.err{background:var(--glaise-danger)}
  .dot.off{background:var(--glaise-ink-tertiary)}`,
  body: () => `
    <div class="lbl">Status</div>
    <div class="row">
      <span class="badge"><span class="dot ok"></span>Ativo</span>
      <span class="badge"><span class="dot err"></span>Falha</span>
      <span class="badge"><span class="dot off"></span>Inativo</span>
      <span class="badge">Neutro</span>
    </div>`,
});

const tableCard = card({
  group: "Components",
  viewport: "900x560",
  title: "Glaise — Table",
  extraCss: `
  table{width:100%;border-collapse:collapse;background:var(--glaise-surface-1);
    border-radius:var(--glaise-radius-lg);overflow:hidden;box-shadow:var(--glaise-shadow-1)}
  th{font-size:var(--glaise-text-microlabel);font-weight:600;text-transform:uppercase;
    letter-spacing:.06em;color:var(--glaise-ink-subtle);text-align:left;
    padding:10px 12px;border-bottom:1px solid var(--glaise-hairline-strong)}
  td{font-size:var(--glaise-text-body-sm);padding:10px 12px;border-bottom:1px solid var(--glaise-hairline)}
  tr.hover td{background:var(--glaise-fill-hover)}
  tr.sel td{background:var(--glaise-fill-selected)}
  td.num{font-family:var(--glaise-font-mono);text-align:right}`,
  body: () => `
    <table>
      <thead><tr><th>Cliente</th><th>Status</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>
        <tr><td>Aurora Ltda</td><td>Ativo</td><td class="num">12.480</td></tr>
        <tr class="hover"><td>Boreal S.A. (hover)</td><td>Ativo</td><td class="num">9.310</td></tr>
        <tr class="sel"><td>Cíclades ME (selected)</td><td>Pendente</td><td class="num">4.070</td></tr>
        <tr><td>Delta Corp</td><td>Inativo</td><td class="num">1.145</td></tr>
      </tbody>
    </table>`,
});

// --- guidelines -----------------------------------------------------------
// The laws that do NOT travel inside tokens — they travel here so a design tool
// reading the DS project applies the family rules, not only its values. Each row
// pairs the rule with a live DO vs DON'T so the pane shows the difference, not
// just asserts it. Sourced from design.md "Do's and Don'ts".
const guidelinesCard = card({
  group: "Guidelines",
  viewport: "1000x900",
  title: "Glaise — Family rules",
  single: true,
  extraCss: `
  .rule{padding:14px 0;border-bottom:1px solid var(--glaise-hairline)}
  .rule h4{margin:0 0 4px;font-size:var(--glaise-text-body);font-weight:600}
  .rule p{margin:0 0 10px;font-size:var(--glaise-text-body-sm);color:var(--glaise-ink-muted)}
  .pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .ex{border:1px solid var(--glaise-hairline);border-radius:var(--glaise-radius-md);padding:10px;background:var(--glaise-surface-1)}
  .tag{font-size:var(--glaise-text-microlabel);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
  .tag.do{color:var(--glaise-success)} .tag.dont{color:var(--glaise-danger)}
  .nav{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--glaise-radius-md);font-size:var(--glaise-text-body-sm);font-weight:600}
  .nav .ic{width:14px;height:14px;border-radius:3px;background:var(--glaise-ink-tertiary)}
  .nav.good{background:var(--glaise-fill-selected)} .nav.good .ic{background:var(--glaise-primary)}
  .nav.bad{border-left:3px solid #c76a2a;background:transparent}
  .card-ok{background:var(--glaise-surface-1);border-radius:var(--glaise-radius-md);box-shadow:var(--glaise-shadow-1);padding:12px;font-size:var(--glaise-text-body-sm)}
  .card-bad{background:var(--glaise-surface-1);border:1px solid var(--glaise-hairline-strong);box-shadow:0 6px 16px -6px rgba(0,0,0,.25);border-radius:var(--glaise-radius-md);padding:12px;font-size:var(--glaise-text-body-sm)}
  .pill{display:inline-flex;align-items:center;gap:6px;font-size:var(--glaise-text-caption);font-weight:600;padding:3px 9px;border-radius:var(--glaise-radius-pill);background:var(--glaise-surface-2);border:1px solid var(--glaise-hairline)}
  .dot{width:7px;height:7px;border-radius:var(--glaise-radius-full);background:var(--glaise-success)}
  .swatch{width:16px;height:16px;border-radius:4px;display:inline-block;vertical-align:middle}`,
  body: () => `
    <div class="rule">
      <h4>Selection: fill, not a side-stripe</h4>
      <p>Active nav item / row / callout = perceptible neutral fill (--glaise-fill-selected) + weight + a primary-colored icon. Never a left border or inset accent bar.</p>
      <div class="pair">
        <div class="ex"><div class="tag do">Do</div><div class="nav good"><span class="ic"></span>Visão geral</div></div>
        <div class="ex"><div class="tag dont">Don't</div><div class="nav bad"><span class="ic"></span>Visão geral</div></div>
      </div>
    </div>
    <div class="rule">
      <h4>No improvised chromatic accent</h4>
      <p>The default skin is monochrome — the primary is washed ink. Chroma (orange, teal, pink) is a brand/pigment decision in brand.css, never invented per screen. success/danger are semantic, earned by meaning, not accents.</p>
      <div class="pair">
        <div class="ex"><div class="tag do">Do</div><span class="swatch" style="background:var(--glaise-primary)"></span> primary = ink &nbsp; <span class="swatch" style="background:var(--glaise-success)"></span> success &nbsp; <span class="swatch" style="background:var(--glaise-danger)"></span> danger</div>
        <div class="ex"><div class="tag dont">Don't</div><span class="swatch" style="background:#c76a2a"></span> a per-screen orange as brand accent (logo, active icon, pills)</div>
      </div>
    </div>
    <div class="rule">
      <h4>One elevation language per card</h4>
      <p>A resting card carries the shadow token alone — on light it separates by value (light card on off-white canvas). Never stack a 1px border and a diffuse drop shadow (the "ghost card").</p>
      <div class="pair">
        <div class="ex"><div class="tag do">Do</div><div class="card-ok">Floats by value — shadow token only.</div></div>
        <div class="ex"><div class="tag dont">Don't</div><div class="card-bad">Border + drop shadow stacked.</div></div>
      </div>
    </div>
    <div class="rule">
      <h4>Status as dot or pill, from the two semantics</h4>
      <p>Status reads through --glaise-success / --glaise-danger as a dot or pill — never a decorative color, never a third accent hue on a data surface.</p>
      <div class="pair">
        <div class="ex"><div class="tag do">Do</div><span class="pill"><span class="dot"></span>Concluída</span></div>
        <div class="ex"><div class="tag dont">Don't</div><span class="pill" style="background:#e7d3f5;border-color:#c9a2e8"><span class="dot" style="background:#8b3fd0"></span>Concluída</span></div>
      </div>
    </div>
    <div class="rule">
      <h4>Sidebar on chrome, workspace on canvas</h4>
      <p>The sidebar sits on --glaise-chrome, a tone distinct from the workspace --glaise-canvas (sidebar darker, workspace lighter in light). Never paint them the same fill. CTAs use --glaise-radius-md corners, never pill-rounded.</p>
    </div>`,
});

// --- write ----------------------------------------------------------------
const FILES = {
  "guidelines/Rules.html": guidelinesCard,
  "foundations/Colors.html": colorsCard,
  "foundations/Typography.html": typographyCard,
  "foundations/SpacingRadii.html": spacingCard,
  "foundations/Surfaces.html": surfacesCard,
  "components/Button.html": buttonCard,
  "components/Input.html": inputCard,
  "components/Card.html": cardCard,
  "components/Badge.html": badgeCard,
  "components/Table.html": tableCard,
};

for (const [rel, html] of Object.entries(FILES)) {
  const p = join(outDir, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, html);
  console.log(`✓ ${rel}`);
}

// Emit _ds_manifest.json ourselves. Claude Design's self-check normally compiles
// this from each card's @dsCard marker, but only when it reprocesses the project —
// so an incremental sync into an already-open project leaves the index stale and the
// new card never lists. Shipping the manifest with the bundle makes every upload
// self-sufficient. Cards (path/group/viewport) are read back from each card's own
// marker so the marker stays the single source of truth; array order = pane order.
const cards = Object.keys(FILES).map((rel) => {
  const m = FILES[rel].match(/^<!-- @dsCard group="([^"]+)" viewport="([^"]+)" -->/);
  if (!m) throw new Error(`${rel}: first line is not a valid @dsCard marker`);
  return { path: rel, group: m[1], viewport: m[2] };
});
const manifest = {
  namespace: "Glaise",
  components: [], startingPoints: [], cards,
  templates: [], hasThumbnailHtml: false,
  globalCssPaths: [], tokens: [], themes: [], fonts: [], brandFonts: [],
  source: "glaise-design-sync",
};
writeFileSync(join(outDir, "_ds_manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("✓ _ds_manifest.json");

console.log(`\n✓ ${cards.length} cards + manifest → ${outDir}`);
console.log(hasBrand ? `  skin: tokens.css + brand.css (${brandPath})` : "  skin: tokens.css (default — no brand.css found)");
