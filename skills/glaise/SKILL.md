---
name: glaise
description: Use when building product UI — administrative panels, dashboards, consoles, back-offices, internal tools, app screens — so the result belongs to the shared Glaise design family. NOT for marketing websites, landing pages, blogs, or brochures. Loads the fixed visual skin (off-white canvas with floating panels, Inter by default, a monochrome washed-ink primary by default, surface ladder, Lucide icons, headless primitives) from references/, and guides the discover-build-review flow. Creativity goes into the product's domain, layout, hierarchy, and signature — never the skin.
---

# Glaise

Glaise makes every interface belong to the same family: recognizable skin, product-specific soul. **The skin is Glaise; the soul is the product's.**

## The skin is non-negotiable (load it first)

Read these files, relative to this skill, before designing anything:

- `references/design.md` — the semantic design system (the "why").
- `references/tokens.css` — the canonical token values. Import directly when the project is not on Tailwind.
- `references/theme.css` — the Tailwind v4 preset. Import when the project uses Tailwind.
- `references/motion.md` — the family's motion layer (the "why" behind movement); curves and durations live as tokens in `tokens.css`. Load when a value, rule, or decision about animation is needed.
- `references/shells.md` — the app-shell archetypes (Console / Focused / Workbench / Reader / Canvas). Load when deciding or building the navigation structure. This is structure, not skin — it never overrides the soul.
- `references/contrast.mjs` — the WCAG contrast checker over the skin's tokens (both themes), used by `glaise-audit`. Run `node references/contrast.mjs` to audit the skin pairs, or pass `<fg> <bg>` for an ad-hoc product pair.

Non-negotiable skin (never reinvent): the effective tokens — the palette/colors, the type family (**Inter** by default), and the primary (`--glaise-primary`, monochrome washed ink by default — a pigment/brand may bring chroma) used sparingly — the surface ladder, the radius and spacing scales, **Lucide** icons, the **motion defaults** (strong custom curves, sub-300ms, the decision-before-how discipline in `motion.md`), and the use of **headless primitives** for controls (Base UI for React, Reka UI for Vue) — never a styled UI kit (Material, Vuetify, Chakra, Ant).

## The soul is the product's (this is where creativity goes)

Free per product: layout, composition, hierarchy/focus, density within range, which screens/components exist, content, and the **signature** — one element that could only exist for this product.

## Flow

1. **Discover the product** — for greenfield (if the repo isn't initialized yet, offer `git init` first), invoke the `glaise-discovery` skill: it interviews the developer and writes `docs/glaise/glaise-brief.md` capturing the user, task, domain, feel, and the one signature. The brief also records the theme (light / dark / both) and the dark-card-edge choice. For an existing project, read `docs/glaise/glaise-brief.md`; **if it's missing, still run `glaise-discovery`** — the taste questions (theme, dark card edges, pigment, the signature) are never inferable from code; only the Stack answers may be pre-filled from the repo. The interview is the gate: no brief, no build.
2. **Load the family** — read `references/design.md` + `references/tokens.css` (and `theme.css` if Tailwind); read `references/motion.md` when the screen has any movement.
3. **Skin (optional)** — check for `docs/glaise/brand.css`. If present, the build
   inherits it automatically (no action). If absent and the brief didn't already decide
   the skin, offer the **three doors**: the **default Glaise skin** (recommended) · a
   curated **pigment** (see the *Pigments* table in `glaise-brand`; picking one copies
   the pack to `docs/glaise/brand.css`) · a **custom brand** (run the `glaise-brand`
   interview — once per client, reused across their products). If the brief already
   names a pigment but `brand.css` is missing (discovery was interrupted, or the file
   was deleted), don't silently fall back to the default — re-copy that pigment's pack,
   per the copy mechanics in `glaise-discovery`'s Skin step. If you find a legacy
   `docs/glaise/brand-overrides.css`, treat it as retired and offer to regenerate with
   `glaise-brand`.
4. **Build** — invoke the `glaise-build` skill, guided by `glaise-brief.md`. If Tailwind is present, import `theme.css`; otherwise import `tokens.css`. Controls from headless primitives; icons from Lucide.
5. **Review & audit** — two passes, both before merge. Invoke `glaise-review` for the *taste* half: craft bar + family test (does it read as Glaise?) + uniqueness test (signature, or could it be any product?). Invoke `glaise-audit` for the *measurable* half: WCAG contrast on both themes (via `references/contrast.mjs`), token fidelity, responsive/touch, complete states, family-mechanical. A build ships only when both clear.

Invoke `glaise-direction` in step 1–2 only when the product needs stronger visual character — always within the skin.

> **Convention:** every document the Glaise skills generate (the brief, notes, reports) lives in the project's `docs/glaise/` — never scattered in the root.

> The satellite skills (`glaise-discovery`, `glaise-brand`, `glaise-build`, `glaise-review`, `glaise-audit`, `glaise-direction`) are invoked by name as the flow reaches each step.

## Portability

This skill is plain Markdown + referenced files, and works in both Claude Code and OpenCode. It uses no agent-specific tools, slash commands, or hardcoded paths beyond its own `references/`.
