---
name: glaise-build
description: Use to build or extend product UI (admin panels, dashboards, consoles, internal tools, app screens) in the Glaise design family — never marketing sites or landing pages. Reads the glaise-brief.md for the product's soul and the skin (design.md, tokens.css, theme.css) plus the client's brand.css if present, then builds with real visual hierarchy, headless primitives (Base UI / Reka UI), and Lucide icons. The skin is decided; creativity goes into layout, hierarchy, and the product's signature.
---

# Glaise Build

Build product UI on the **fixed Glaise skin**, from the **soul in the brief**. The hard visual decisions (palette, type, surfaces) are already made — so this is not about inventing a look. It's about applying the skin with real craft and spending creativity where it counts: layout, hierarchy, and the product's signature.

## Inputs — load these first

1. **`glaise-brief.md`** (the soul) from the project's `docs/glaise/`. If it's missing, run the `glaise-discovery` skill first — don't build without a brief. Any documents you generate also go under `docs/glaise/`.
2. **The skin:** `references/design.md` (semantic) + `references/tokens.css` (canonical values). Plus `references/theme.css` if the project uses Tailwind, and `references/motion.md` whenever the screen has any movement.
3. **If present, `docs/glaise/glaise-direction.md`** — the character plan from `glaise-direction`; read it alongside the brief and let it guide how far to push the signature, layout, and motion.

## The skin is decided — don't reinvent it

Non-negotiable, taken from the family: the effective tokens — the palette/colors, the type family (**Inter** by default), and the primary — `--glaise-primary`, monochrome washed ink by default (a pigment or client brand.css may re-value it, bringing chroma) — used sparingly, the surface ladder, the radius and spacing scales, and **Lucide** icons. Bind everything to tokens — never hardcode a hex or a px that a token already covers. Reinventing any of these is the most common way to break the family.

## Spend creativity here — the soul

Free per product, driven by the brief: **layout, composition, hierarchy/focus, density within range, and the signature.** Build the brief's signature *for real* — it's the one thing this product will be remembered by. A build with no signature has failed even if every token is correct.

## App shell & navigation (from the brief)

Build the frame from the brief's **Shell & navigation** first — get the shell right and every surface inherits the right structure. The brief names a **shell archetype** (Console / Focused / Workbench / Reader / Canvas); read its build notes in the skin's `references/shells.md` and frame the app from there. The archetype is the structure only — the signature, hierarchy, and content still come from the brief, so two builds of the same archetype must not look alike.

- **Sidebar** (if the brief calls for one) — in the brief's mode: **floating (the family default)** — a detached `--glaise-surface-1` card with `--glaise-radius-xl` corners, `box-shadow: var(--glaise-shadow-1)` and a visible canvas gutter on all sides — or **docked** (only if the brief says so) — full-bleed on `--glaise-chrome`, a tone **distinct from the workspace `canvas`** (never the same fill), a `hairline` separating them. Either way: nav grouped by section; the active item is a **perceptible neutral fill** (`--glaise-fill-selected`) + weight, at full radius, with the accent on the item's **icon** — **never a side-stripe / left-accent bar**; hover uses `--glaise-fill-hover`; collapsible if specified. Width states a relationship: a ~240–280px nav *serves* the content; ~320px+ reads as a *peer*.
- **Top bar** (if specified) — holds only what the brief lists (wordmark, search, primary action, profile, theme toggle); in floating mode the breadcrumb/actions sit **directly on the canvas** above the panels (no boxed band); in docked mode it's a thin band on the canvas with a hairline bottom. It must not compete with the page's focal point.
- **Page shape** — full-width app shell, centered/contained, or split (list + detail) per the brief; hold one content max-width and consistent gutters.
- **None** (a single focused view) — don't add chrome for its own sake; the screen is the shell.

## Visual hierarchy & composition (what makes it look designed)

This is the highest-leverage craft, and now the main place creativity lives.

- **One focal point per view.** Name the one thing the user came to do; make it win through size, contrast, position, or surrounding space. Demote everything else deliberately. A parking lot where everything competes equally reads as generated.
- **Weight + color do more than size.** A single 14px size holds three tiers via weight + the ink ramp (`ink` → `ink-muted` → `ink-subtle`). Build hierarchy from size, weight, and color together — never size alone. Squint: if you can't tell headline from body from label, it's too flat.
- **Density is a decision, in px.** Pick it from the brief's feel (tight/balanced/airy) and hold the same numbers everywhere.
- **Rhythm — breathe unevenly.** Group tightly-related things, then put real air between groups. Monotone layouts (same card, gap, density everywhere) are the sound of no one deciding.
- **Proportions speak.** A 280px sidebar vs full content says "nav serves content"; 360px says "peers". Choose widths that state a relationship.
- **Restraint (~60/30/10).** Mostly neutral surface, some secondary tone, the accent ≤ ~10%. Color communicates (status/action), it doesn't decorate.

## Subtle layering (the backbone)

- Use the **surface ladder** from tokens: `canvas` → `surface-1` → `surface-2` → ... Each step is a whisper — a few percent of lightness. Stacked, hierarchy emerges; in isolation you barely see one step.
- **Hairline borders** (`hairline`, `hairline-strong`) define edges without shouting.
- **Sidebars sit on `--glaise-chrome`** — a tone distinct from the workspace `canvas` (never the same fill), a hairline separating them. White `surface-1` cards then **float** on the canvas with soft edges; that is the premium separation, not a same-value slab.
- **One elevation language per card** — a hairline **or** a shadow token, never both (the ghost-card): in light, `--glaise-shadow-1` already carries a 1px ring, so a light card uses the shadow alone; in dark (shadow `none`) it uses the hairline.
- **Interactive state fills** — hover/selected on nav items, rows, and menu options use `--glaise-fill-hover` / `--glaise-fill-selected` (perceptible neutral overlays), not a surface step that vanishes on a same-value background.
- **Inputs sit slightly inset/darker**, not lighter.
- **Squint test:** blur your eyes — you still perceive structure, but nothing jumps out harshly.

## Micro-craft — detailing inside the component

Macro composition can be right and the screen still read as generated, because the failure hides *inside* a single control — the gap the squint test can't see (it survives the blur). The rule:

**Inside a component, every element declares its rank: the accessory recedes, the related groups, the interactive separates.**

Scan each component you build against these tells — the concrete shapes that rule gets violated in. Each is failure → cost → fix:

- **Value glued to its label** — a count/figure touches the text (`9Publicado`), so it reads as one word. → Give label↔value a dedicated gap, and demote the value (`ink-subtle`, or a badge on `surface-2`).
- **Everything at one rank** — label, value, icon, meta all at the same size/weight/color = a flat blob. → Only the component's protagonist stays at `ink`; the rest steps down the ink ramp.
- **Interactives fused** — segments/tabs/chips with no separation and no visible selected state. → Separate with a hairline divider, a gap, or an individual pill; the selected one is a surface lift (`surface-2`), not just bold.
- **Padding missing or lopsided** — content jammed against the edge, asymmetric padding. → Token padding, symmetric unless there's a reason; concentric radius on nested elements.
- **Icon off the axis** — icon not aligned to the text's x-height, no gap to the label. → Align to x-height, give a dedicated label↔icon gap, nudge ~2px optically.
- **Numbers that dance** — proportional counters/metrics jump on update. → `tabular-nums` on any dynamic figure.
- **Flat grouping** — uniform gap between everything, related and unrelated at the same distance. → Tighten the related, open real air between groups (the build's rhythm, now *inside* the component).
- **Loud border, dead center** — the container has a strong border but nothing inside is ranked. → Quiet hairline outside, hierarchy inside (weight + ink + surface).

These are recognition aids, not a scorecard — the one principle behind all of them is rank. Fix the rank, not the symptom.

## Use what exists (controls, styling, icons)

- **Controls: native → headless primitive → hand-roll (last resort).** Use `<button>`/`<a>`/`<input>` where they fit. For anything stateful (select, combobox, dialog, popover, tooltip, tabs, date picker) compose a headless primitive — **Base UI for React, Reka UI for Vue** — then style it to the skin. Never ship a styled UI kit (Material, Vuetify, Chakra, Ant): it brings its own skin and hijacks the family. Hand-roll only if no primitive fits, and then owe the full a11y contract (keyboard, focus trap/return, ARIA, click-outside, scroll-lock).
- **Styling:** if the project uses **Tailwind**, import `theme.css` and use the family utilities (`bg-canvas`, `text-ink`, `border-hairline`, `rounded-md`, `text-display-md`). If **not Tailwind**, import `tokens.css` and style with the custom properties (`var(--glaise-canvas)`, etc.). Either way: bind to tokens, never hardcode literals; extract a component on the second reuse.
- **Icons: Lucide only** (`lucide-react` / `lucide-vue-next`). Icons inherit `currentColor`, so they respect the ink ramp automatically.

## Theme (from the brief's Stack)

The skin ships dark + light as two fixed states; the brief picks which the product exposes. Never re-paint — only switch.

- **Light or Dark (fixed):** set (or omit) `data-theme="dark"` on `<html>`. No toggle.
- **Both:** build a toggle (Lucide `sun` / `moon`) that flips `document.documentElement.dataset.theme` and persists to `localStorage` under the fixed key **`glaise-theme`**. First load with nothing saved → **light**. `prefers-color-scheme` is opt-in per project, not the default.
- **No FOUC:** when "both", put this inline script in `<head>` **before any CSS/JS**, reading the same `glaise-theme` key:

  ```html
  <script>try{if(localStorage.getItem('glaise-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}</script>
  ```

- **Elevation:** cards carry `box-shadow: var(--glaise-shadow-1)` and nothing else — it resolves to **none on both themes** by default (the card separates by value alone; the dark ladder's wider delta holds the edge). If the brief says **Dark card edges: hairline ring**, add to the app's CSS: `:root[data-theme="dark"] { --glaise-shadow-1: 0 0 0 1px var(--glaise-hairline); }` — components don't change. `var(--glaise-shadow-2)` is for **overlays only** (menus, popovers, modals). **Never stack a border on a card** (ghost-card) and never put a real shadow on a resting card in light. Don't hardcode shadows.

## Brand layer (per client)

If the project has **`docs/glaise/brand.css`** (written by the `glaise-brand` skill), load
it **after** the skin so it overrides the `--glaise-*` tokens by cascade — this is the
client's brand. The build does not derive overrides itself.

- Non-Tailwind: `@import "tokens.css"; @import "brand.css";` — brand last.
- Tailwind: `@import "tokens.css"; @import "theme.css"; @import "brand.css";` — brand last.
  `@theme` maps to `var(--glaise-*)` resolved at runtime, so a later `brand.css` wins by
  cascade with no utility regeneration.

A light re-skin overrides a few tokens; a full identity overrides many — same mechanism.
Reason about the **effective tokens** (default overlaid by brand), never the default
literals. AA over the effective tokens is enforced by `glaise-audit`. If you find a legacy
`docs/glaise/brand-overrides.css` (the retired import path), don't load it — tell the user
to regenerate with `glaise-brand`.

## Polish & motion (ship-quality)

- **States are not optional.** Every interactive element: default, hover, active, focus, disabled. Every data view: loading, empty, error. Missing states are the fastest tell of unfinished work.
- **Concentric radius:** nested rounded elements use `outer = inner + padding`.
- **Tabular numbers** on any dynamic figure (counters, metrics, tables): `font-variant-numeric: tabular-nums`.
- **Hit areas ≥ 44×44px** (40 minimum); extend small controls with a pseudo-element.
- **Optical alignment & text:** nudge icons/glyphs that look off-center (~2px); `text-wrap: balance` on headings and `text-wrap: pretty` on body to kill orphans; `-webkit-font-smoothing: antialiased` on the root.
- **Motion — decide *whether* before *how*.** The first question is never "how do I animate this", it's "should this move at all?" Match motion to frequency: **100+×/day or keyboard-initiated → no animation, ever**; tens/day → reduce; occasional (modals, drawers, toasts) → standard; rare/first-time → delight (and that delight is `glaise-direction`'s job, not the default). Every animation must answer *why it moves* (feedback, spatial consistency, state, preventing a jarring change) — "looks cool" is not a reason. When in doubt, the strongest move is to delete it. The full decision tables, curves, and rules live in `references/motion.md`.
- **Motion is felt, not watched (the family defaults).** Bind to the motion tokens, never hardcode a curve or ms: easing `var(--glaise-ease-out)` (or the `ease-out` utility on Tailwind), never `ease-in`; durations from `--glaise-duration-fast/base/slow` (UI < 300ms; only drawers/modals earn `--glaise-duration-drawer`). Press feedback `transform: scale(0.97)`; animate only `transform`/`opacity` (never `transition: all`); never animate from `scale(0)` (start at 0.95 + opacity 0); popovers/dropdowns scale from their trigger (origin-aware; modals stay centered); use transitions (not keyframes) for anything rapidly re-fired; stagger entrances 30–80ms; respect `prefers-reduced-motion` (gentler, not zero) and gate `:hover` motion behind `@media (hover: hover) and (pointer: fine)`.

## Copy is part of the build (it ships in the UI)

Words render alongside pixels; sloppy copy reads as unfinished just like a missing hover. Hold the same bar:

- **No em dashes or `--` in UI strings.** Use a comma, colon, period, or parentheses. (Prose in docs is fine; product copy is not.)
- **No marketing buzzwords** — streamline / empower / supercharge / leverage / seamless / world-class / next-generation. Name the specific noun and the verb the thing actually does.
- **Button labels = verb + object.** "Salvar alterações" beats "OK"; "Excluir post" beats "Sim". The label says what will happen.
- **Link text stands alone.** "Ver planos" beats "clique aqui" — screen readers announce links out of context.
- **One noun per concept, consistent casing.** The same thing is called the same name everywhere; pick sentence case or Title Case and hold it. This includes **seed/mock data** — it ships in screenshots, so no `LiaNogueira` or `Caio REIS`.
- **Empty / error copy says what happened and the way out**, not just "Nada aqui".

## Before writing each component — checkpoint

State (briefly): **Intent** (from the brief) · **Focal element** (and how it wins) · **Tokens used** · **Surface level** · **Primitive or native** · **Icons**. If you can't say *why* for each, you're defaulting — stop and think.

## Build flow

1. **Ensure the brief** — read `docs/glaise/glaise-brief.md`; if absent, run `glaise-discovery` first.
2. **Load the skin** — `design.md` + `tokens.css` (and `theme.css` if Tailwind).
3. **Build the shell, then screen by screen, signature first** — frame the app from the brief's Shell & navigation, then make the signature real before filling in the rest.
4. **Run the checks** (below).
5. **Hand off to review:** `glaise-review` for taste/family/soul, and `glaise-audit` for the measurable pass (contrast, tokens, states, touch). Clear both before merge.

## The checks (before showing)

- **Squint test** — hierarchy readable, nothing harsh?
- **Reading-distance pass** — squint catches the macro (what leads); reading catches the micro (collisions, separation, accessories). Walk each component at reading distance against the micro-craft tells — these survive the squint.
- **States** — every interactive element and data view has its states?
- **Primitives** — every non-native control is a headless primitive, not hand-rolled, not a styled kit?
- **Tokens** — no hardcoded hex/px that a token covers?
- **Signature** — is the brief's signature actually present and doing work? If a generic version of this screen would look the same, the soul is missing.
- **Copy** — UI strings and seed data clean (no em dashes, buzzwords, "click here" links, or inconsistent names)?
- **Contrast** — text on tints/fills clears AA? Run `references/contrast.mjs` for the skin pairs, and `node references/contrast.mjs '<fg>' '<bg>'` for any product-specific pair (status seals, gray on a hover tint).
- **Render it and walk it** — if a render/screenshot tool is available, verify at desktop and mobile widths and **trigger the non-happy states** (empty, error) rather than assuming them, then **zoom into each component and scan it against the micro-craft tells**, fixing what you find before showing. A clean compile is not evidence; the rendered screen is. Without a render tool, read the markup at detail level against the same tells.

## Avoid

- Reinventing the skin (new palette, font, radius scale).
- A styled UI kit instead of headless primitives.
- Hardcoded hex/px where a token exists.
- Flat hierarchy; monotone layout; missing states.
- Component blobs: accessories that don't recede, interactives with no separation, a value glued to its label.
- Mixed depth strategies (the family uses surface ladder + hairlines).
- Ignoring the brief's signature — the most important failure.

## Portability

Plain Markdown, works in Claude Code and OpenCode. No agent-specific tools, slash commands, or hardcoded paths; "if a render tool is available" stays conditional.
