#!/usr/bin/env node
/**
 * Glaise contrast checker — WCAG ratios over the fixed skin's tokens, plus the
 * semantic-separation rule that contrast math alone is blind to.
 *
 * The skin is shared, so its text/surface pairs can be verified once and hold
 * for every Glaise product. Two modes:
 *
 *   node contrast.mjs                 → audit the skin's curated pairs, both themes
 *   node contrast.mjs <fg> <bg>       → ad-hoc pair (hex like #6c7079, or a token
 *                                       name like ink-subtle); add --theme light
 *
 * Exit code is 1 if any *required* curated pair fails AA, or if two semantics
 * are too close in hue to tell apart (so it is CI-able); ad-hoc mode never fails
 * the process, it just reports.
 *
 * No dependencies. Reads tokens.css next to this file. color-mix()/non-hex
 * token values are skipped (resolve them by hand and pass hex to ad-hoc mode).
 *
 * Convention: `:root` is the LIGHT (default) theme; `:root[data-theme="dark"]`
 * overrides it. A token only in `:root` applies to both themes.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const TOKENS = path.join(HERE, 'tokens.css')

// ── WCAG math ──────────────────────────────────────────────────────────────
const lin = (c) => {
  c /= 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const L = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
const ratio = (fg, bg) => {
  const a = L(fg)
  const b = L(bg)
  const hi = Math.max(a, b)
  const lo = Math.min(a, b)
  return (hi + 0.05) / (lo + 0.05)
}
const norm3 = (hex) => {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return '#' + h.toLowerCase()
}
const isHex = (v) => /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(v.trim())

// ── HSL (hue-preserving value adjustment) ────────────────────────────────────
const hexToHsl = (hex) => {
  const n = parseInt(norm3(hex).slice(1), 16);
  let r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h, s, l };
};
const hslToHex = ({ h, s, l }) => {
  const hue = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue(p, q, h + 1 / 3); g = hue(p, q, h); b = hue(p, q, h - 1 / 3);
  }
  const to = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(b);
};
// Suggest a value for `fgHex` (hue/sat preserved, lightness moved) that clears `min` vs bg,
// choosing the candidate closest to the original lightness. Always resolvable for AA floors.
const suggestForContrast = (fgHex, bgHex, min) => {
  const { h, s, l: orig } = hexToHsl(fgHex);
  let best = null, bestDist = Infinity;
  for (let i = 0; i <= 100; i++) {
    const l = i / 100;
    const cand = hslToHex({ h, s, l });
    if (ratio(cand, bgHex) >= min) {
      const d = Math.abs(l - orig);
      if (d < bestDist) { bestDist = d; best = cand; }
    }
  }
  return best;
};

// ── token parsing ───────────────────────────────────────────────────────────
function parseTheme(css, selector) {
  // Strip CSS comments first so a commented-out `:root {}` (or stray braces inside
  // a comment) can't shift the block window and hijack which block we capture.
  css = css.replace(/\/\*[\s\S]*?\*\//g, "")
  // Tolerant: accept `:root {` or `:root{`, and single/double quotes + whitespace
  // in the data-theme attribute. Keeps default tokens.css parsing working.
  const isDark = /data-theme/.test(selector)
  const re = isDark
    ? /:root\[\s*data-theme\s*=\s*['"]?\s*dark\s*['"]?\s*\]\s*\{/
    : /:root\s*\{/
  const m = re.exec(css)
  if (!m) return {}
  const open = css.indexOf('{', m.index)
  const close = css.indexOf('}', open)
  const body = css.slice(open + 1, close)
  const out = {}
  for (const mm of body.matchAll(/--glaise-([\w-]+):\s*([^;]+);/g)) {
    const val = mm[2].trim()
    if (isHex(val)) out[mm[1]] = norm3(val)
  }
  return out
}

const css = fs.readFileSync(TOKENS, 'utf8')
const LIGHT = parseTheme(css, ':root {')
const DARK = { ...LIGHT, ...parseTheme(css, ':root[data-theme="dark"]') }

// Curated pairs that carry real text. `min` is the AA floor for that role:
//   4.5 = body text · 3.0 = large/non-body (≥18px or bold ≥14px, dots, icons)
//   0   = informational only (WCAG-exempt role like disabled/footnote) — the
//         ratio is printed but never fails the process.
const PAIRS = [
  ['ink', 'canvas', 4.5, 'body/headlines on canvas'],
  ['ink', 'surface-1', 4.5, 'card text'],
  ['ink-muted', 'surface-1', 4.5, 'secondary text'],
  ['ink-subtle', 'surface-1', 4.5, 'tertiary text (the usual offender)'],
  ['ink-subtle', 'surface-2', 4.5, 'muted text on lifted surface'],
  ['ink-tertiary', 'surface-1', 0, 'disabled/footnote — never real text (light dips <3:1)'],
  ['on-primary', 'primary', 4.5, 'button label on the primary fill'],
  ['primary', 'canvas', 3.0, 'accent/link on canvas (≥18px or non-text)'],
  ['primary', 'surface-1', 3.0, 'accent on card (≥18px or non-text)'],
  ['success', 'surface-1', 3.0, 'status dot/text (non-body)'],
  ['danger', 'surface-1', 4.5, 'field error message (real body text — stricter than success)'],
  ['danger', 'canvas', 4.5, "error state on the workspace (body text)"],
]

// ── Semantic separation (what AA cannot see) ────────────────────────────────
// Two colors can BOTH clear 4.5:1 against the same surface and still be the same
// color to the user. So contrast alone can't tell whether --glaise-danger is
// distinguishable from --glaise-primary: if they sit a few degrees apart, an
// error reads as a CTA, and under protanopia the two collapse onto each other.
// A pigment/brand whose accent lands near the danger hue MUST re-value danger
// (terracotta's burnt orange is the shipped case).
//
// Hue is only meaningful on a chromatic color — a near-gray reports hue 0° and
// would false-fail against a red, so anything below MIN_CHROMA is skipped: it is
// already told apart by chroma, not hue. The default skin's monochrome primary
// takes exactly this path — the rule only bites when a pigment brings chroma.
const MIN_HUE_SEPARATION = 30
const MIN_CHROMA = 0.15
const SEPARATION = [['danger', 'primary', 'an error must not read as a CTA']]

function auditSeparation(theme) {
  let failed = 0
  for (const [aTok, bTok, note] of SEPARATION) {
    const a = resolveEff(aTok, theme)
    const b = resolveEff(bTok, theme)
    if (!a || !b) continue
    const ha = hexToHsl(a)
    const hb = hexToHsl(b)
    if (ha.s < MIN_CHROMA || hb.s < MIN_CHROMA) {
      console.log(`  · ${pad(aTok + ' vs ' + bTok, 26)} ${pad('—', 9)} ${pad('skip', 6)} near-gray, told apart by chroma`)
      continue
    }
    const d = Math.abs(ha.h * 360 - hb.h * 360)
    const gap = Math.min(d, 360 - d)
    const okPair = gap >= MIN_HUE_SEPARATION
    if (!okPair) failed++
    console.log(
      `  ${okPair ? '·' : '✗'} ${pad(aTok + ' vs ' + bTok, 26)} ${pad(gap.toFixed(1) + '°', 9)} ${pad(okPair ? 'OK' : 'FAIL', 6)} ${note}`,
    )
    if (!okPair) {
      console.log(
        `      ↳ --glaise-${aTok} (${a}) is only ${gap.toFixed(1)}° from --glaise-${bTok} (${b}, hue ${(hb.h * 360).toFixed(1)}°).`,
      )
      console.log(`        Re-value --glaise-${aTok} at least ${MIN_HUE_SEPARATION}° away, keeping AA above.`)
    }
  }
  return failed
}

const bar = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA-lg' : 'FAIL')
const pad = (s, n) => String(s).padEnd(n)

function auditTheme(theme) {
  console.log(`\n  ${theme.toUpperCase()}`)
  console.log('  ' + '─'.repeat(64))
  let failed = 0
  for (const [fgTok, bgTok, min, note] of PAIRS) {
    const fg = resolveEff(fgTok, theme)
    const bg = resolveEff(bgTok, theme)
    if (!fg || !bg) {
      console.log(`  ${pad(fgTok + ' / ' + bgTok, 26)} skipped (non-hex token)`)
      continue
    }
    const r = ratio(fg, bg)
    const info = min === 0
    const okPair = info || r >= min
    if (!okPair) failed++
    const tag = info ? 'info' : okPair ? bar(r) : 'FAIL'
    const mark = okPair ? '·' : '✗'
    console.log(
      `  ${mark} ${pad(fgTok + ' / ' + bgTok, 26)} ${pad(r.toFixed(2) + ':1', 9)} ${pad(tag, 6)} ${note}`,
    )
    if (!okPair && !info) {
      const sugg = suggestForContrast(fg, bg, min)
      if (sugg) console.log(`      ↳ suggest --glaise-${fgTok}: ${sugg} (keeps hue, clears ${min}:1)`)
    }
  }
  return failed + auditSeparation(theme)
}

// ── run ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const themeFlag = (() => {
  const i = args.indexOf('--theme')
  if (i === -1) return null
  const t = args[i + 1]
  args.splice(i, 2)
  return t
})()
// Optional per-client brand overlay: brand.css redefines a subset of --glaise-* tokens.
const brandFlag = (() => {
  const i = args.indexOf("--brand");
  if (i === -1) return null;
  const v = args[i + 1];
  if (!v || v.startsWith("--")) { console.error("--brand requires a path to a brand.css"); process.exit(2); }
  args.splice(i, 2);
  return v;
})();
let DARK_EFF = DARK, LIGHT_EFF = LIGHT;
if (brandFlag) {
  let bcss;
  try { bcss = fs.readFileSync(brandFlag, "utf8"); }
  catch { console.error(`brand.css not found: ${brandFlag}`); process.exit(2); }
  const bLight = parseTheme(bcss, ":root {");
  const bDark = parseTheme(bcss, ':root[data-theme="dark"]');
  if (Object.keys(bDark).length === 0 && Object.keys(bLight).length === 0) {
    console.error("warning: --brand parsed 0 tokens from " + brandFlag);
  }
  LIGHT_EFF = { ...LIGHT, ...bLight };
  DARK_EFF = { ...DARK, ...bLight, ...bDark };
}
const THEMES_EFF = { dark: DARK_EFF, light: LIGHT_EFF };
const resolveEff = (token, theme) => {
  if (isHex(token)) return norm3(token);
  const key = token.replace(/^--glaise-/, "");
  return THEMES_EFF[theme]?.[key];
};
const positional = args.filter((a) => !a.startsWith('--'))

if (positional.length >= 2) {
  const theme = themeFlag || 'light'
  const fg = resolveEff(positional[0], theme)
  const bg = resolveEff(positional[1], theme)
  if (!fg || !bg) {
    console.error(`Could not resolve "${positional[0]}" / "${positional[1]}" in ${theme} theme.`)
    process.exit(2)
  }
  const r = ratio(fg, bg)
  console.log(`\n  ${positional[0]} on ${positional[1]} (${theme})`)
  console.log(`  ${fg} on ${bg}  →  ${r.toFixed(2)}:1  [${bar(r)}]`)
  console.log(
    `  AA normal (4.5): ${r >= 4.5 ? 'PASS' : 'FAIL'}   AA large (3.0): ${r >= 3 ? 'PASS' : 'FAIL'}\n`,
  )
  process.exit(0)
}

console.log('\n  Glaise skin — WCAG contrast + semantic separation audit')
const failures = auditTheme('light') + auditTheme('dark')
console.log('')
if (failures > 0) {
  console.log(`  ${failures} required check(s) failed. Fix the token, not the symptom.\n`)
  process.exit(1)
}
console.log('  All required pairs clear AA, and the semantics stay apart, on both themes.\n')
process.exit(0)
