---
name: glaise-review
description: Use to review a product UI built with Glaise — strictly, before it ships or merges. Judges three bars: craft (would a design lead put their name on it), family conformance (unmistakably Glaise — tokens, the effective type family (Inter by default), surface ladder, Lucide, headless primitives), and soul (does it carry the brief's signature, or could it be any product). Judges by default; rebuilds only when asked.
---

# Glaise Review

An unusually strict review. Most generated UI is *correct* (it renders, it aligns) and *not crafted* (nothing was decided, the hierarchy is flat). On top of craft, a Glaise build must also be *of the family* (unmistakably Glaise) and *have a soul* (the brief's signature). This review pulls a build toward all three, scores what's wrong by how much it matters, and blocks what isn't there yet.

**Judges by default.** Report findings and a verdict; rebuild only when the user asks. Keep the review and the mutation separate.

## The three bars

1. **Craft** — would a design lead at Linear or Apple put their name on this? Real hierarchy, restraint, polish.
2. **Family** — is this unmistakably Glaise? Bound to tokens, the effective type family (Inter by default; a brand may override it), surface ladder, the accent (--glaise-primary — lavender by default; a pigment/brand may re-value it) used sparingly, Lucide icons, headless primitives — no skin violation.
3. **Soul** — does the brief's signature actually exist and do work? Or could this be any product (convergence)?

## Inputs — load first

- `docs/glaise/glaise-brief.md` — the soul (for the uniqueness test). If absent, review craft + family only and note the gap.
- `references/design.md` + `references/tokens.css` — the skin. **Also load
  `docs/glaise/brand.css` if present** (a pigment or client brand): the family test
  judges the *effective* tokens — default, pigment, or brand — never a hardcoded ideal.
  The cascade is `tokens.css` → [`theme.css`] → `brand.css`: brand loads last and wins
  wherever it declares a token; anything it omits falls through to the default skin.
  Load `references/motion.md` when the build has movement, to cite exact curves,
  durations, and motion rules.
- The build under review (a screen, a component, or a branch's UI changes).
- **Pair with `glaise-audit`.** This review is the *taste* half — craft, family-as-read, soul. The *measurable* half (WCAG contrast numbers, token resolution, touch-target px, triggered data states) is `glaise-audit`'s job. Run both before merge; don't re-derive the mechanical checks here — judge what only a person can, and fold the audit's P0/P1 into your verdict.

## How to run it

Five steps, in order. The procedure is what keeps the review honest.

### 1. Scope & intent
Bound what's under review. The intent is **given, not inferred** — read the brief for the user, task, feel, and signature; read the skin (`design.md`/`tokens.css`). Review against the product's own intent, not a generic ideal.

### 2. See the whole first
Look at the rendered output as a user would (use a render/screenshot tool if available; otherwise read the layout holistically). A clean compile is not evidence — the rendered screen is. If the tool is there, render at desktop and mobile widths and **trigger the non-happy states** (empty, error), so you judge what the user sees, not what the code implies. Squint:
- Does one thing lead, or is it a parking lot where everything competes equally?
- Does it read as *Glaise* (the effective canvas, type family, accent restraint, quiet surfaces)?
- Is the brief's **signature** visible and alive?

Then look again at **reading distance** — squint judges the macro, reading judges the micro. Zoom into each component and scan for the detail tells that survive the blur (a value glued to its label, interactives with no separation or selected state, everything at one weight) — run them through lens I.

### 3. Run the lenses (independently — one concern at a time)
- **A · Hierarchy** — name the focal element; does it win (size, weight, contrast, isolation)? Are tiers (primary / secondary / meta) distinct via size + weight + the ink ramp, not size alone?
- **B · Family conformance** — bound to tokens, or hardcoded hex/px? the effective type family (Inter by default; a pigment/brand may re-value it), or a stray font? Surface ladder + hairlines, or ad-hoc colors/borders? The accent (--glaise-primary, whatever its effective value) ≤ ~10% (focus / CTA / selection), or decorative? Lucide icons, or another set? Controls from headless primitives, or a styled UI kit? If the brief is "both", squint-test in both themes; confirm the toggle persists and there is no theme flash on reload. On light, elevation must read (shadow, not a flat ladder) and the accent must hold AA.
- **C · Surfaces & depth** — quiet elevation (the surface ladder), findable-not-harsh hairlines, one committed depth strategy? Is the **sidebar/chrome a tone distinct from the workspace** (`--glaise-chrome`, never the same fill)? Are surface transitions **intentional** — no abrupt, jarring background-color jump between adjacent regions; do white cards **float softly** on the canvas rather than sit on a same-value slab? Does each card carry **one** elevation language — a hairline **or** a shadow token, never both (the ghost-card)?
- **D · Composition & rhythm** — does it breathe unevenly, or is it monotone (same card, gap, density everywhere)? Do proportions state a relationship? **Shell fidelity:** does the app frame match the brief's *Shell & navigation* — the named archetype (build notes in `references/shells.md`) and its details: the right sidebar / top bar / page shape, the sidebar on `--glaise-chrome` (distinct from the workspace canvas, never the same fill) separated by a hairline, the active nav item a **perceptible neutral fill** (`--glaise-fill-selected`) + weight + accent-colored icon (**never a side-stripe**), the top-bar controls quiet (ghost icon buttons, low-key context switcher) and holding only what the brief listed? A shell that contradicts the brief (a sidebar it didn't ask for, chrome competing with the focal point) is a finding. The archetype is structure only — same archetype must not mean same-looking product; if it does, that's the soul lens (G), not this one.
- **E · States & polish** — every interactive element has default / hover / active / focus / disabled; every data view has loading / empty / error? Concentric radius, tabular-nums, ≥44px hit areas?
- **E2 · Motion** — judge against the family's motion layer (`references/motion.md`); these are non-negotiable, a violation is a finding:
  - **Justified & frequency-appropriate** — does each animation answer *why it moves*? Anything on a **keyboard-initiated or 100+×/day action is a block** (it should not animate at all). "Looks cool" on a frequently-seen element fails.
  - **Responsive easing** — entering/exiting uses `var(--glaise-ease-out)` or a strong curve. **`ease-in` on UI is a block.** No hardcoded `cubic-bezier`/ms where a motion token exists.
  - **Sub-300ms** — UI motion under 300ms; only drawers/modals may use `--glaise-duration-drawer`. Slower than that on routine UI needs a reason.
  - **Physical correctness** — never `scale(0)` (start `scale(0.95)` + opacity); popovers/dropdowns scale from their trigger, modals stay centered; press feedback `scale(0.97)`.
  - **GPU-only** — animate `transform`/`opacity` only; `width`/`height`/`margin`/`padding`/`top`/`left` (or Framer `x`/`y`/`scale` shorthands under load) is a performance finding. No `transition: all`.
  - **Interruptibility** — rapidly re-fired/gesture motion uses transitions or springs that retarget, not keyframes that restart from zero.
  - **Asymmetric timing** — deliberate phase slow, system response snaps; symmetric timing on press-and-release/hold is a finding.
  - **Accessibility** — `prefers-reduced-motion` honored (gentler, not zero); `:hover` motion gated behind `@media (hover: hover) and (pointer: fine)`.
  - **Layer discipline** — springs/decorative delight belong to a deliberate `glaise-direction` moment, not sprayed into routine UI.
- **F · Structure & reuse** — native → headless primitive (Base UI / Reka UI) → hand-roll? Any reinvented control missing keyboard / focus / ARIA? Hardcoded literals where tokens exist?
- **G · Soul / uniqueness** — read the brief's signature; is it present and doing real work? Strip the product name: could this screen be any product? If yes, the soul is missing.
- **H · Copy & voice** — does the wording fit the brief's feel, and do the mechanics hold (no em dashes or `--`, no marketing buzzwords, button labels = verb + object, links that stand alone, one noun per concept, clean seed/mock data)? Empty and error copy says what happened and the way out, not just "Nada aqui". The hard rules live in `glaise-build`'s Copy section.
- **I · Micro-craft / detail** — at reading distance (not squint), scan each component against `glaise-build`'s micro-craft tells: does every element declare its rank — accessory receding, related grouped, interactive separated? Catch the failures that survive the squint test — a count glued to its label, segments with no separation or no visible selected state, everything at one weight, content jammed to the edge, an icon off the text axis, proportional numbers that jump. The principle is rank; cite the specific tell and the fix, not just "looks off".

### 4. Score & filter
Severity per finding:
- **Blocker** — reads as generic or broken, OR violates the family, OR has no signature. Fails the bar.
- **Should-fix** — a real craft gap, but the screen still functions.
- **Note** — minor; mention once.

Then drop false positives: taste (a coherent choice you'd merely make differently), a bold choice working as intended, out-of-scope, ratified by the brief or the skin, or a lint/compile concern. If you can't say *why a finding costs the user or breaks the family*, cut it. Prefer a few high-conviction findings over a long cosmetic list.

### 5. Report & verdict
Synthesize across lenses, prioritized: hierarchy → family violations → surfaces/composition → states & polish → micro-craft → motion → structure → copy → soul. For each finding give: what defaulted or violated, why it costs the user or breaks the family, the specific fix (the decision, not a patch), and its severity. Then state the verdict against the bar. If `glaise-audit` ran, fold its open P0/P1 into the verdict — a build is not approved while either pass has an unresolved blocker.

## Approval bar

To pass, all three must hold:
- **Craft:** a clear focal point and readable hierarchy (survives the squint test); real size + weight + color hierarchy; restrained, meaningful color; quiet layering; clean detail at reading distance (every element ranked, no component blobs); complete states; purposeful sub-300ms motion; no structural hacks.
- **Family:** binds to tokens (no hardcoded skin), the effective type family, the surface ladder, the effective accent sparingly, Lucide icons, headless primitives — no styled UI kit, no reinvented skin.
- **Soul:** the brief's signature is present and doing work; the screen could not be mistaken for a different product.

**Presumptive blockers** (unless justified against the brief): no focal point · size-only or defaulted hierarchy · monotone layout · harsh or fragmented surfaces · **abrupt background-color jump** between adjacent regions (unintentional surface transition) · **sidebar painted the same fill as the workspace** (chrome must be distinct) · **side-stripe / left-accent bar** on a nav item, row, or callout · **ghost-card** (a 1px border and a diffuse shadow on the same element) · **invisible interactive state** (hover/selected that doesn't read, or a surface step that vanishes on a same-value background) · missing states · structural hacks · an inaccessible hand-rolled control · **component blob** (accessories that don't recede, interactives with no separation, a value glued to its label — fails at reading distance) · **skin violation** (hardcoded palette/font, a styled UI kit, non-Lucide icons) · **feel-breaking motion** (`ease-in` on UI, `scale(0)` entry, animation on a keyboard/100+×/day action, a non-GPU animation with an easy GPU fix) · **missing signature** (generic — could be any product). Any one present → **not approved**; leave explicit, actionable feedback.

## Applying fixes

Only when the user asks. Then rebuild the flagged parts **from the decision, not as patches**: re-derive the focal point, restore the token binding, build the signature for real. Start with blockers, then should-fix.

## Portability

Plain Markdown, works in Claude Code and OpenCode. No agent-specific tools, slash commands, or hardcoded paths; "if a render tool is available" stays conditional.
