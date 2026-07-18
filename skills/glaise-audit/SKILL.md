---
name: glaise-audit
description: Use to run the mechanical, measurable quality pass on a Glaise build — the evidence sibling of glaise-review. Where glaise-review judges taste, family, and soul, glaise-audit verifies what can be measured: WCAG contrast on both themes (via references/contrast.mjs), token fidelity (no hardcoded hex/px, no undefined vars, no off-scale type/space), responsive and touch targets, complete interaction/data states, and family-mechanical conformance (Lucide, headless primitives, surface ladder). Reports findings by severity; fixes only when asked.
---

# Glaise Audit

`glaise-review` judges what only a person can judge — does it have craft, does it read as family, does it carry the soul. **This skill judges what a machine can verify.** Most "looks done" builds carry measurable defects the squint test misses: a muted gray that fails AA by 0.3, a `var(--glaise-text-button)` that never resolved, a 30px tap target, an empty state nobody triggered. Audit catches those with evidence, not opinion.

Run **both**: review for taste, audit for evidence. A build that passes review but fails audit is pretty and broken; one that passes audit but fails review is correct and characterless. Ship only when both clear.

> **Detector output and clean scripts are evidence of *absence of one defect*, never proof the build is strong.** A green `contrast.mjs` says the curated pairs pass — not that *this* screen's gray-on-tint does. Always gather browser evidence and walk the real interaction path.

## Inputs — load first

- The build under audit (a screen, component, or a branch's UI changes).
- `references/tokens.css` (+ `theme.css` if Tailwind) — the token source of truth.
- `references/contrast.mjs` — the WCAG checker (runs against `tokens.css`).
- `docs/glaise/glaise-brief.md` if present — for the declared theme (dark / light / both) and stack.

## How to run it

Five dimensions, each scored **0–4**. Don't fix here; document for `glaise-build` to address. Gather browser evidence (render at desktop + mobile widths; trigger the non-happy states) before scoring — a dimension you didn't *see* is unscored, not 4.

### 1 · Contrast & accessibility

- **Run the skin audit:** `node references/contrast.mjs` — clears AA on both themes, or names the failing pair. Regression guard for anyone who edits `tokens.css`.
- **If the project has a client brand** (`docs/glaise/brand.css`): audit the **effective**
  tokens with `node references/contrast.mjs --brand docs/glaise/brand.css`. Every failing
  curated pair prints a `↳ suggest --glaise-<token>: #hex` line — a hue-preserving value
  that clears AA. Apply the suggestion to `brand.css` (or re-run `glaise-brand`) and
  re-audit. The audit reports; it does not rewrite. A brand cannot ship with a failing
  required pair — treat an unresolved one as **P0**. Note: a suggestion fixes one pair; when
  the accent is both a text color and a fill, applying one suggestion can shift another pair
  — re-run until the table is clean.
- **Check product-specific pairs the skin audit can't know** — any text on a tinted/colored surface (status seals, chips, accent fills, gray on a hover tint). Resolve `color-mix()` to hex and run ad-hoc: `node references/contrast.mjs '#6c7079' '#eef0f3' --theme light`. Body text ≥ 4.5:1; large/bold ≥ 3:1; placeholders ≥ 4.5:1.
- **ARIA & semantics:** interactive elements have roles/labels/states; one logical heading order; landmarks present; real `<button>`/`<a>`, not click-divs.
- **Keyboard:** every control reachable and operable; visible `:focus-visible`; no traps; logical tab order; focus returns after dialogs.
- **Render evidence (deterministic):** if the build is servable and Playwright is available,
  run `node references/browser-audit.mjs <url> [--brand docs/glaise/brand.css]` from the
  project root. It writes dark/light × desktop/mobile screenshots to `docs/glaise/audit/`
  and emits findings: **axe-core** a11y/contrast on the live screen (the gray-on-tint
  `contrast.mjs` can't see), **brand overlay** applied (computed `--glaise-*` match the
  brand), **horizontal overflow**, and **touch targets** < 44px. Exit 1 on any P0. Open the
  screenshots to judge craft. **If Playwright isn't installed** (`npm i -D playwright
  @axe-core/playwright && npx playwright install chromium`), fall back to the manual checklist
  below and say so — the helper is optional, like `contrast.mjs` needing Node.

**0**=fails WCAG A · **2**=AA effort with real gaps · **3**=AA met, minor gaps · **4**=AA clean both themes, keyboard complete.

### 2 · Token fidelity

The skin lives in tokens; drift is measurable. From the project's style/source root:

- **Hardcoded skin values** that a token covers:
  `grep -rnE '#[0-9a-fA-F]{3,6}' src` (allow only token *definitions*) and spot-check `px` font-sizes/colors against the scale.
- **Undefined Glaise vars** (silently dropped, e.g. the `var(--glaise-text-button)` that never existed):
  `grep -rhoE 'var\(--glaise-[a-z0-9-]+' src | sort -u` then confirm each exists in `tokens.css`/`theme.css`.
- **Off-scale type/space:** font-sizes outside the scale (display-xl…caption, eyebrow, mono) and gaps/padding not on the 4px/space tokens. Bespoke wordmark sizing is an allowed exception; body/label/meta text is not.
- **Breathing floor:** no adjacent visible siblings at computed gap 0 (gap + margins + padding sum < 4px between them), and no container whose content sits flush against its edge (padding 0 with visible content). Measure the rendered layout, not the CSS intent — a collapsed margin or a `gap` overridden to 0 is the drift this catches. A violation is **P1**.

**0**=hardcoded everywhere · **2**=tokens exist, used inconsistently · **3**=tokens used, a few literals · **4**=fully bound, no undefined vars, on-scale.

### 3 · Responsive & touch

- **The sweep:** measure at 360 · 480 · 768 · 900 (split-screen) · 1024 · 1280 · 1440 — every check in this section runs at each step, and the floor is continuous: drag between steps when the tool allows. Page-level overflow at any step is **P0**; clipped/overlapped text or a mid-token identifier wrap is **P1**.
- **Scroll reachability:** at each sweep step (run once at a short viewport, ~720px tall), every pane's content is reachable — no element with `scrollHeight > clientHeight` whose overflow is hidden without a scrollable ancestor; chrome stays fixed while the workspace scrolls; below the drawer breakpoint the nav trigger is present and visible. Trapped content or a missing drawer trigger is **P0** (function lost).
- **Touch targets:** interactive elements ≥ 44×44px on touch (skin floor: CTAs ≥ 40px, pills ≥ 36px, touch grows to ≥ 44px). Extend small controls with a pseudo-element rather than growing the visual.
- **No horizontal overflow** at any width: confirm `documentElement.scrollWidth === innerWidth` (note: some headless browsers clamp viewport width to ~500px min — measure, don't trust a cropped screenshot).
- **Breakpoints** present and sane (skin grid: 3-up → 2-up at ~1024 → 1-up at ~640); headings don't overflow their container at any width.
- **No real text below the caption floor (12px).** 11/10px hardcoded labels are drift.
- The `browser-audit.mjs` helper (dim. 1) measures overflow and touch targets across
  desktop/mobile and reports the real rendered width — use its findings here.

**0**=desktop-only · **2**=works on mobile, rough edges · **3**=responsive, minor target/overflow issues · **4**=fluid, proper targets, zero overflow.

### 4 · States & motion

- **Every interactive element** has default / hover / active / focus-visible / disabled. **Verify by triggering**, not by reading code.
- **Every data view** has loading / empty / error — not just the happy path. Trigger the empty state (search for nothing, filter to zero) and screenshot it.
- **Motion:** durations < 300ms; custom ease-out (`cubic-bezier(0.23, 1, 0.32, 1)`), never ease-in/bounce/elastic; animates only `transform`/`opacity`; `prefers-reduced-motion` has an alternative.
- **Theme (if brief says "both"):** toggle persists to `glaise-theme`; the inline no-FOUC script is present in `<head>` before CSS; reload in dark shows no light flash. (If the brief is light-only or dark-only, confirm the fixed `data-theme` and that there's no dead toggle.)

**0**=happy path only · **2**=most interactive states, data states missing · **3**=states present, motion rough · **4**=all states triggered-and-verified, motion purposeful, reduced-motion honored.

### 5 · Family-mechanical

The measurable half of family conformance (the *taste* half belongs to `glaise-review`):

- **Icons:** Lucide only (`lucide-react` / `lucide-vue-next`) — `grep` for any other icon import (heroicons, material-icons, font-awesome, tabler) → finding.
- **Controls:** native or headless primitive (Base UI / Reka UI). `grep` package imports for a styled kit (`@mui`, `vuetify`, `@chakra-ui`, `antd`, `react-bootstrap`) → blocker; it ships its own skin.
- **Depth:** surface ladder + the shadow tokens; `--glaise-shadow-1` is `none` on both themes by default (cards separate by value; a dark hairline ring only if the brief opted in), `--glaise-shadow-2` is overlays-only — no hardcoded `box-shadow`, no ad-hoc border colors, no real shadow on a resting card in light.
- **Chrome separation:** the app sidebar sits on `--glaise-chrome` (a tone distinct from `--glaise-canvas`), never the workspace fill — `grep` the sidebar/rail background; a sidebar set to `--glaise-canvas` (matching the workspace) is a finding unless the brief asks for it.
- **No side-stripe:** no colored `border-left`/`border-right` > 1px and no inset accent bar on nav items / rows / callouts —
  `grep -rnE 'inset [0-9]+px 0 0|border-(left|right):\s*(2|3|4|5|6)px' src`.
- **One elevation language (no ghost-card):** no element carries **both** a 1px border and a `--glaise-shadow-*` at once (the shadow token already rings in both themes) — flag `border` + `box-shadow` pairs on cards/panels.
- **Interactive fills:** hover/selected use `--glaise-fill-hover` / `--glaise-fill-selected` (perceptible on any surface), not a surface step that vanishes on a same-value background —
  `grep -rnE '(hover|active|selected)[^{]*\{[^}]*background' src` and confirm the fill reads.

**0**=styled kit / foreign icons · **2**=mostly family, some foreign deps · **3**=family, minor depth drift · **4**=Lucide + primitives + ladder, distinct chrome, one elevation language, no side-stripe.

## Severity

Tag every finding:

- **P0 Blocking** — broken or inaccessible: AA failure on body text, undefined var dropping a style, a styled UI kit, horizontal overflow, an inoperable-by-keyboard control.
- **P1 Major** — WCAG AA gap on non-body, missing data state, touch target < 40px, foreign icon set, text clipped/overlapped or an identifier wrapping mid-token at any sweep width.
- **P2 Minor** — off-scale value, a missing hover/active, motion easing wrong.
- **P3 Polish** — sub-pixel optical nits, redundant rules.

## Report

```
Glaise Audit — <target>

Score   1 Contrast/a11y  ?/4   · 2 Tokens ?/4 · 3 Responsive ?/4
        4 States/motion  ?/4   · 5 Family-mechanical ?/4      Total ??/20

Evidence  <render widths seen; states triggered; contrast.mjs result>

Findings  (by severity, P0 first)
  [P?] <name> — <file:line> — <dim> — <impact> — <fix: the decision> — <standard>

Systemic  <recurring root causes, e.g. "ink-tertiary used for real text in 4 spots">
Working   <what to keep>
```

**Bands:** 18–20 ship · 14–17 fix weak dims · 10–13 significant work · ≤9 overhaul.

## Applying fixes

Only when asked. Then hand to `glaise-build` and fix **from the decision, not the symptom**: patch the token (or add the missing one), swap to the shared primitive, re-derive the state. Start at P0. Re-run `contrast.mjs` and re-trigger the states to confirm. Then re-audit to watch the score move.

## Relationship to glaise-review

Same target, two passes, no overlap:

- **glaise-review** — craft · family-as-read · soul/signature. *Would a design lead sign it? Could it be any product?* Judgment.
- **glaise-audit** — contrast · tokens · responsive/touch · states · family-as-measured. *Does it pass, resolve, fit, and not break?* Evidence.

Lead with whichever the moment needs; clear both before merge.

## Portability

Plain Markdown, works in any Agent Skills harness (Claude Code, Codex, Cursor, OpenCode). `contrast.mjs` needs Node; `browser-audit.mjs` additionally needs Playwright + chromium in the target project (optional) — if either is unavailable, fall back to the checklist (compute ratios by hand, gather render evidence manually) and say so. No agent-specific tools, slash commands, or hardcoded paths beyond the skill's own `references/`.
