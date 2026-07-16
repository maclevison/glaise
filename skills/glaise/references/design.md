---
version: alpha
name: Glaise-design-analysis
description: An off-white product-focused workspace (the canvas) with floating white panels, dark functional ink, and a monochrome primary — a washed near-black used for the primary CTA and focus, never decoratively. The system reads as software-craft documentation: dense, technical, and quietly luxurious. Display type is set in Inter at 500–700 with measured negative tracking. Cards float as white panels (surface-1) with generous radii and one elevation language (hairline or soft shadow). The default skin has no chromatic accent — color arrives only through a pigment or brand pack; success/danger are the only colors, earned by meaning. Dark is the second state — the same skin inverted onto a soft dark-gray ladder. Scope: admin panels, dashboards, and internal tools — from the login screen inward; never marketing sites or landing pages.
---

> Brandable values — color, surfaces, radius, spacing, and the type *family* — are canonical in `tokens.css` (default) and may be overridden per client by `brand.css`; this document never pins their literals (read `tokens.css` for current values). The invariant type *scale* (weights, line-heights, tracking) and structural measures are specified here as part of the fixed engine — a brand cannot change them. The accent role is `--glaise-primary`, whatever its effective value — a washed near-black (monochrome) in the default skin; a pigment or brand may re-value it, bringing chroma, without changing its role or scarcity.

## Overview

Glaise's canvas is an off-white workspace — `--glaise-canvas` is the "whitespace" everything floats on, never pure white. On top sits a four-step surface ladder (`--glaise-surface-1` through `--glaise-surface-4`) for cards, panels, and lifted tiles, with hairline borders running from `--glaise-hairline` up through `--glaise-hairline-strong` and `--glaise-hairline-tertiary`. Dark text (`--glaise-ink`) carries the body and headlines. The family's default frame is the **floating Console** (see `shells.md`): the sidebar and the content panels are detached `surface-1` cards floating on the canvas with a visible gutter — not full-bleed columns.

The primary is **monochrome**: `--glaise-primary` is a washed near-black (a washed white in dark) — functional ink, not a color. It marks the primary CTA button, focus rings, and selected-state emphasis. A hover state (`--glaise-primary-hover`) and a focus variant (`--glaise-primary-focus`) extend the same ramp. The default skin has **no chromatic accent at all** — chroma arrives only through a pigment or brand pack re-valuing `--glaise-primary`. The semantic colors are exactly two: `--glaise-success` for status pills and the rare success indicator, and `--glaise-danger` for error states. A semantic color is **not** an accent: it is earned by meaning and never used decoratively. There is deliberately no `warning` and no `info` — an informational emphasis is already `--glaise-primary`.

Display type runs **Inter** at weight 500–700 with negative letter-spacing scaling from -3.0px at the largest display size down to 0 at body. Body sizes also run Inter, and JetBrains Mono is reserved for code and identifiers in the product UI (service names, IDs, snippets).

The page rhythm is **dense working surfaces** — real tables, stat rows, timelines, and forms doing the product's job, framed as floating `--glaise-surface-1` panels with generous corners. The chrome stays quiet so the data can lead. Glaise's scope runs **from the login screen inward**: auth, dashboards, consoles, settings, back-offices — never marketing pages.

**Key Characteristics:**
- **Light-canvas system** — `--glaise-canvas` is an off-white workspace; white panels float on it.
- **Monochrome primary** (`--glaise-primary`) — washed near-black ink, used scarcely on the primary CTA, focus, and selected emphasis. Zero chroma by default.
- **Floating panels** — sidebar and content live as detached `surface-1` cards with generous radii and a canvas gutter around them.
- Four-step surface ladder (canvas → surface-1 → surface-2 → surface-3 → surface-4) carries hierarchy; light adds a soft shadow, dark leans on hairlines.
- Display tracking pulls aggressively negative (-3.0px at the largest size); body holds at -0.05px.
- Cards use `--glaise-radius-lg` corners — never pill.
- **Data leads the page.** Tables, metrics, and panels are the protagonists; the chrome is a quiet frame.
- No chromatic accent, no atmospheric gradients, no spotlight cards.

## Colors

> Source: Glaise design system — base tokens for dashboards and panels.

### Brand & Accent
- **Primary Ink** (`--glaise-primary`): The monochrome primary — washed near-black (washed white in dark). Primary CTA, focus, link emphasis. Functional ink, not a color; a pigment/brand re-values it to bring chroma.
- **Primary Hover** (`--glaise-primary-hover`): The hovered step of the same ramp.
- **Primary Focus** (`--glaise-primary-focus`): Focus-ring value — focused inputs, focused buttons.
- **Brand Secure** (`--glaise-brand-secure`): Muted slate-gray — used in "Glaise Security" surfaces.

### Surface
- **Canvas** (`--glaise-canvas`): Default page / workspace background — an off-white "whitespace" (a soft dark gray in dark, deep but never near-black).
- **Chrome** (`--glaise-chrome`): The app sidebar / chrome surface — kept **distinct** from the canvas (never the same fill: a touch darker than the workspace in light, a subtle lift in dark). A same-color sidebar is only for briefs that explicitly ask for it.
- **Surface 1** (`--glaise-surface-1`): One step above canvas — every floating panel and card (sidebar, stat cards, table panels, the login card).
- **Surface 2** (`--glaise-surface-2`): Two steps above — icon tiles, filter chips, hovered/featured cards.
- **Surface 3** (`--glaise-surface-3`): Three steps above — line-tertiary backgrounds, sub-nav.
- **Surface 4** (`--glaise-surface-4`): Four steps above — bg-level-3, deepest lifted surface.
- **Hairline** (`--glaise-hairline`): 1px borders on cards and dividers.
- **Hairline Strong** (`--glaise-hairline-strong`): Stronger 1px borders — input focus rings.
- **Hairline Tertiary** (`--glaise-hairline-tertiary`): Tertiary borders for nested surfaces.
- **Inverse Canvas** (`--glaise-inverse-canvas`): The opposite theme's canvas — reserved for rare inverse moments (a theme-preview tile, a contrast-flipped panel).
- **Inverse Surface 1** (`--glaise-inverse-surface-1`): One step above inverse canvas.
- **Inverse Surface 2** (`--glaise-inverse-surface-2`): Two steps above inverse canvas.

### Text

The ink ramp doubles as the **text-role ramp** — hierarchy is made with weight and tone first, size last (see Typography → Principles).

- **Ink** (`--glaise-ink`): The **primary/anchor role** — what the eye lands on: page and section titles, the metric number, the row's anchor (a service name), the lead of a timeline event. **At most one primary element per row/line** — everything else steps down.
- **Ink Muted** (`--glaise-ink-muted`): The **secondary role** — supporting data: table cell values, regions, owners, the complement of an event line.
- **Ink Subtle** (`--glaise-ink-subtle`): The **tertiary/meta role** — micro-labels, table column headers, timestamps, footers, sublines. The lightest tone that still carries real text (AA holds on both themes).
- **Ink Tertiary** (`--glaise-ink-tertiary`): Disabled and decorative only — **never meta text** (it dips below AA on light; timestamps and labels belong to `ink-subtle`).

### Semantic

Exactly two, and they are not accents — a semantic color is earned by meaning, never used to decorate. Their contrast floors differ because their **roles** differ.

- **Success Green** (`--glaise-success`): Status pills, success indicators. Only ever a dot or a pill, never a sentence — held to the 3:1 floor.
- **Danger Red** (`--glaise-danger`): Error states — field validation messages, the error state of a data view, destructive confirmation. It carries **body text**, so it is held to the **4.5:1** floor on both themes, against the canvas and the card surfaces. Use it for the message, the field's border, and the error icon; do not fill a button with it (a destructive action is a `button-secondary` with danger text — the system stays quiet).
- **Overlay** (`--glaise-overlay`): Pure black overlay scrim for modals.

> A pigment or brand may re-value `--glaise-danger`, and **must** when its accent lands within ~30° of the danger hue — otherwise an error reads as a CTA (and the two collapse onto each other under protanopia). Terracotta is the shipped example.

### Interactive State Fills

The surface ladder describes *containers*; these describe *interactive states* (hover / selected / pressed) on nav items, list rows, and menu options. They are neutral overlays — not surface steps — so they read on any surface and in both themes.

- **Fill Hover** (`--glaise-fill-hover`): Hovered nav item, row, or ghost icon button.
- **Fill Selected** (`--glaise-fill-selected`): The active/selected nav item — a perceptible neutral fill, stronger than hover. Selection is a fill, **never** a left-accent bar; any accent emphasis is carried by the item's icon (`--glaise-primary` — weight alone in the default mono skin, chroma under a pigment).
- **Fill Pressed** (`--glaise-fill-pressed`): Momentary pressed state.

## Typography

### Font Family

- **Inter** (`--glaise-font-sans`) — the system typeface; fallback `Inter, -apple-system, system-ui, Segoe UI, Roboto`. Carries everything from display-xl through captions and button labels.
- **JetBrains Mono** (`--glaise-font-mono`) — monospace cut; fallback `ui-monospace, SF Mono, Menlo`. Used for code, identifiers, and status/ID tokens in the product UI (a table's anchor column of service names, log lines, API keys).

The surface treats display and body sizes as one continuous voice; the size change is silent.

### Hierarchy

| Token | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|
| `--glaise-text-display-xl` | 600 | 1.05 | -3.0px | Rare oversized display (an empty-state or auth hero) — most admin screens never reach it |
| `--glaise-text-metric` | 600 | 1.10 | -0.5px | Stat-card metric number (ink, tabular-nums) |
| `--glaise-text-display-lg` | 600 | 1.10 | -1.8px | Section opener headlines |
| `--glaise-text-display-md` | 600 | 1.15 | -1.0px | Sub-section headlines |
| `--glaise-text-headline` | 600 | 1.20 | -0.6px | Page titles |
| `--glaise-text-card-title` | 500 | 1.25 | -0.4px | Large card/section titles |
| `--glaise-text-subhead` | 400 | 1.40 | -0.2px | Lead body, intro paragraphs |
| `--glaise-text-body-lg` | 400 | 1.50 | -0.1px | Lead paragraphs, dialog intros |
| `--glaise-text-body` | 400 | 1.50 | -0.05px | Default body |
| `--glaise-text-body-sm` | 400 | 1.50 | 0 | Card body, footer columns |
| `--glaise-text-caption` | 400 | 1.40 | 0 | Captions, meta, status |
| (button label) | 500 | 1.20 | 0 | All button labels |
| `--glaise-text-eyebrow` | 500 | 1.30 | 0.06em | Section eyebrow (positive tracking) |
| `--glaise-text-mono` | 400 | 1.50 | 0 | JetBrains Mono for code, IDs, and table anchor identifiers |
| `--glaise-text-microlabel` | 600 | 1.30 | 0.06em | UPPERCASE micro-labels: stat-card labels, table column headers (ink-subtle) |

### Principles

- **Hierarchy is weight and tone first, size last.** The text-role ramp (ink → ink-muted → ink-subtle) carries hierarchy; size variation is reserved for macro structure (page title → section → metric). Tonal flatness — everything in the same dark tone and weight — is the failure mode this ramp exists to prevent.
- **Inside dense tables and lists, font-size is constant.** Differentiation comes from weight and tone only: the row's anchor (service name) is ink at 500–600, every other cell is ink-muted at 400, headers are microlabel style. **At most one primary element per row.** (Mono cells use `--glaise-text-mono` — its 13px is the optical match for 14px sans, not a size step.)
- **Aggressive negative tracking on display** (-3.0px at 80px ≈ 4% of size).
- **Single voice from display to body.** Display-xl at 600 → body at 400 — same family (Inter), narrower weights.
- **Micro-labels and eyebrows use positive tracking** (+0.06em) with UPPERCASE — contrast against the negative-tracked display marks them as taxonomy.
- **Mono only where data is code-like.** JetBrains Mono marks identifiers (service names, IDs, keys, log lines) — never labels, buttons, or prose.

### Note on Fonts

**Inter** is the canonical Glaise typeface — free, variable, and widely available (Google Fonts / self-hosted). Use weights 500 / 600 / 700 for display and 400 for body. On macOS, `-apple-system, system-ui` is an acceptable fallback. For mono, **JetBrains Mono** at weight 400 is the standard; **Geist Mono** is a viable alternative.

## Layout

### Spacing System

- **Base unit**: 4px.
- **Tokens**: `--glaise-space-xxs` · `--glaise-space-xs` · `--glaise-space-sm` · `--glaise-space-md` · `--glaise-space-lg` · `--glaise-space-xl` · `--glaise-space-xxl` · `--glaise-space-section`.
- Card interior padding: `--glaise-space-md` on dense admin cards (stat cards, table panels); `--glaise-space-lg` on roomier panels; `--glaise-space-xl` on the login card.
- Button padding: `--glaise-space-xs` vertical · 14px horizontal — Glaise's compact button spec.
- Form input padding: `--glaise-space-xs` vertical · `--glaise-space-sm` horizontal.

### Grid & Container

- App shells run full-width with one consistent gutter (`--glaise-space-sm` between floating panels).
- Stat-card rows are 4-up at desktop, 2-up at tablet, 1-up at mobile.
- Content splits follow the shell: `2fr / 1fr` for a table beside a side panel (Console), a single ~560–720px column for forms and auth (Focused).
- The data panel (table, board, feed) spans the widest track — it's the protagonist.

### Whitespace Philosophy

The canvas IS the whitespace. Sections separate by lift onto floating surface-1 panels, not by rules or repainted bands. Panels keep a visible canvas gutter around them (`--glaise-space-sm`–`--glaise-space-md`); within a panel, generous `--glaise-space-lg` gaps between content blocks; `--glaise-space-section` between sections.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow, no border | Default for body type, hero text, footer |
| 1 (panel lift) | `--glaise-surface-1` background on canvas, `--glaise-shadow-1` (light) or 1px `--glaise-hairline` (dark) | Default cards, floating panels |
| 2 (surface-2 lift) | `--glaise-surface-2` background, `--glaise-shadow-2` (light) or 1px `--glaise-hairline-strong` (dark) | Icon tiles, filter chips, hovered/featured cards |
| 3 (surface-3 lift) | `--glaise-surface-3` background | Sub-nav, dropdown menus |
| 4 (focus ring) | 2px `--glaise-primary-focus` outline at 50% opacity | Focused input, focused button |

Glaise's depth is carried by the surface ladder plus **one elevation language per card — `box-shadow: var(--glaise-shadow-1)`, with no border stacked on it**. By default it resolves to **none on both themes**: a card separates from the canvas by value alone (white on off-white in light; the dark ladder carries a deliberately wider canvas→surface delta so value holds the edge there too). **Dark card edges are a per-project taste question asked at discovery**: a project that prefers outlined dark cards records it in the brief and re-values `--glaise-shadow-1` to a hairline ring (`0 0 0 1px var(--glaise-hairline)`) in its dark block — the single-declaration model is unchanged. `--glaise-shadow-2` is for **overlays only** (menus, popovers, modals) — a real shadow on light, a ring on dark (a floating surface needs an edge value can't give). Bare hairline borders remain for inputs, dividers, and seams — not for cards.

### Decorative Depth

- **No atmospheric gradients, no spotlight cards** — the data itself is the visual interest; sparklines and charts carry the decoration.
- **Subtle white edge highlight** on the top edge of lifted panels — gives the dark surface a faint "pixel rendered" feel (dark-only).

## Shapes

### Border Radius Scale

| Token | Use |
|---|---|
| `--glaise-radius-xs` | Small chips, status badges |
| `--glaise-radius-sm` | Inline tags |
| `--glaise-radius-md` | All buttons, form inputs, nav items |
| `--glaise-radius-lg` | Cards and content panels (stat cards, table panels) |
| `--glaise-radius-xl` | Floating shell panels (the sidebar, the login card) |
| `--glaise-radius-xxl` | Oversized surfaces (rare) |
| `--glaise-radius-pill` | Status badges, segmented toggles |
| `--glaise-radius-full` | Avatar circles |

### Imagery Geometry

- Admin surfaces carry little imagery — data visualizations (sparklines, area charts) are the visual layer, drawn in the primary + grays.
- Avatar circles use `--glaise-radius-full` at 24–32px (nav footer, activity rows, assignee cells).
- Empty-state illustrations, when present, stay monochrome and quiet — never atmospheric art.

## Components

### Buttons

**`button-primary`** — Monochrome ink CTA (washed near-black on light, washed white on dark). The default primary CTA across all pages.
- Background `--glaise-primary`, text `--glaise-on-primary`, button-label type, padding `--glaise-space-xs` 14px, rounded `--glaise-radius-md`.
- Pressed state shifts the background to `--glaise-primary-focus`.
- Hover state shifts the background to `--glaise-primary-hover` (the next step of the same ramp).

**`button-secondary`** — Charcoal button. Used for secondary CTAs ("Sign in", "Read changelog").
- Background `--glaise-surface-1`, text `--glaise-ink`, button-label type, padding `--glaise-space-xs` 14px, rounded `--glaise-radius-md`. 1px `--glaise-hairline` border.

**`button-tertiary`** — Plain text button.
- Background `--glaise-canvas`, text `--glaise-ink`, button-label type, rounded `--glaise-radius-md`, padding `--glaise-space-xs` 14px.

### Segmented Control

**`segmented-default`** + **`segmented-selected`** — a pill-toggle for switching views/filters (list ↔ board, time ranges).
- Default: transparent background, `--glaise-ink-subtle` text, rounded `--glaise-radius-pill`, padding 6px 14px.
- Selected: `--glaise-surface-2` background, `--glaise-ink` text at weight 500 — selected = surface lift, never a color fill.

### Cards & Panels

Every card carries `box-shadow: var(--glaise-shadow-1)` and **no border** (see Elevation & Depth).

**`panel-card`** — the generic floating content panel (a table panel, an activity panel, a chart panel).
- Background `--glaise-surface-1`, rounded `--glaise-radius-lg`, padding `--glaise-space-md`.
- Header: a `card-title` (body size, 600, ink, with a Lucide icon in ink-subtle) + tools on the right; footer (when present): a hairline-topped meta row in ink-subtle (counts, pagination, "view all").

**`stat-card`** — the metric tile of a dashboard's top row.
- Structure: microlabel (UPPERCASE, ink-subtle) → metric number (`--glaise-text-metric`, 600, ink, tabular-nums) → trend line (caption, semantic color for good/bad, ink-subtle for flat) → an accent sparkline anchored to the corner.
- Same panel-card surface spec; padding `--glaise-space-md`.

**`login-card`** — the entry door: Glaise's scope starts here.
- The Focused shell: one centered `--glaise-surface-1` card at ~360–420px, rounded `--glaise-radius-xl`, padding `--glaise-space-xl`, floating on the canvas.
- Contents: the product wordmark, a short ink-subtle subline, stacked `text-input`s, one full-width `button-primary`, quiet tertiary links (forgot password / SSO). No imagery, no marketing copy — the door is calm.

### Data Table

**`data-table`** — the workhorse surface, living inside a `panel-card`.
- Column headers: `--glaise-text-microlabel` spec (UPPERCASE, 600, ink-subtle, 0.06em), hairline underneath.
- Cells: body-sm at 400 in **ink-muted**; the row's **anchor column** (name/ID) in ink at 500 (mono via `--glaise-text-mono` when it's an identifier) — at most one anchor per row; numerics right-aligned with tabular-nums.
- Rows separated by hairlines; hover = `--glaise-fill-hover`; row height constant — no font-size variation inside the table.
- Footer: "Showing X of Y" + quiet pager in ink-subtle.

### Activity / Timeline

**`activity-list`** — recent events in a side panel.
- Each row: a small `--glaise-surface-2` icon tile (Lucide, semantic or primary color by event kind), the event lead in ink at 600, its complement in ink-muted, a relative timestamp in ink-subtle pushed right.
- Rows separated by hairlines; a "view all" footer link.

### Inputs & Forms

**`text-input`** + **`text-input-focused`** — form fields (settings, auth, record editing).
- Background `--glaise-surface-1`, text `--glaise-ink`, body type, rounded `--glaise-radius-md`, padding `--glaise-space-xs` `--glaise-space-sm`, 1px `--glaise-hairline` border (inputs keep borders — they're controls, not cards).
- Focused state retains the same surface; the focus ring is a 2px `--glaise-primary-focus` outline at 50% opacity.
- Error state: border and message in `--glaise-danger` (the message is body text — 4.5:1 floor).

**`search-input`** — the filter box above a data table.
- A `text-input` with a leading Lucide search icon in ink-subtle and an ink-subtle placeholder.

**`filter-chip`** — a dropdown trigger for column filters ("Status ⌄").
- Background `--glaise-surface-2`, text `--glaise-ink-muted` at 500, rounded `--glaise-radius-md`, padding 6px 10px, trailing chevron.

### Status

**`status-badge`** — the semantic state pill (Healthy / Degraded / Down, Active / Archived).
- A leading dot + caption label, rounded `--glaise-radius-pill`, padding 2px 9px.
- Semantic states: text in `--glaise-success` / `--glaise-danger` over a ~10% tint of the same color; neutral states: `--glaise-ink-muted` over `--glaise-surface-3`. Never a saturated fill.

### Navigation

**`app-sidebar`** — the product's left rail. Two treatments (see `shells.md`):
- **Floating (default):** a detached `--glaise-surface-1` card with `--glaise-radius-xl` corners, one elevation language (shadow on light, hairline on dark), and a canvas gutter on all sides — the sidebar floats on the workspace like every other panel.
- **Docked:** full-bleed column on `--glaise-chrome` (distinct from the workspace `--glaise-canvas` — never the same fill), 1px `--glaise-hairline` on its inner edge.
Holds `nav-item`s either way.

**`nav-item`** (app sidebar) — a row in the product sidebar. Default / hover / selected are one component, not three improvised looks.
- **Default:** transparent background, `--glaise-ink-subtle` icon, `--glaise-ink-muted` label, `--glaise-radius-md`, ~34–38px height (≥44px touch), consistent horizontal inset so the fill has air from the sidebar edge.
- **Hover:** background `--glaise-fill-hover`, label brightens toward `--glaise-ink-muted`.
- **Selected:** background `--glaise-fill-selected`, label `--glaise-ink` at weight 500–600, icon `--glaise-primary`. Full radius on all four corners. **No side-stripe / left-accent bar** — the fill + weight + lavender icon carry the state.

**`app-topbar`** — the product's thin top band (Console / Workbench shells). Height ~56–60px, `--glaise-canvas` (optionally a translucent canvas with `backdrop-filter`), 1px `--glaise-hairline` bottom.
- Controls are **quiet**: the account/context switcher is a low-key `surface-1` pill (hairline, chevron, hover fill) — not a heavy bordered box. Icon actions are **ghost buttons** (transparent, fill with `--glaise-fill-hover` on hover), grouped at the right edge — never individually boxed with borders + shadows. Left content aligns to the page gutter.

## Do's and Don'ts

### Do

- Reserve `--glaise-canvas` as the system's anchor surface — everything floats on it.
- Use `--glaise-primary` ONLY for: brand mark, primary CTA, focus ring, link emphasis. It is functional ink — in the default skin it brings weight, not color.
- Use the four-step surface ladder for hierarchy. Avoid skipping levels.
- Pair display weight 600 with body weight 400 — Glaise resists 700+ display weights.
- Apply negative letter-spacing aggressively on display.
- Let the data lead — the table, the metric row, the working panel is the protagonist of every screen.
- Compose CTAs as `--glaise-radius-md` corners.
- Keep the sidebar on `--glaise-chrome`, distinct from the workspace `--glaise-canvas` (sidebar a touch darker, workspace lighter).
- Let white/`surface-1` cards float on the workspace canvas — the soft edge (light card on the canvas) *is* the premium separation; don't repaint the whole workspace to force it.
- Give each card one elevation language — a hairline **or** a shadow token (in light, `--glaise-shadow-1` already carries a ring, so use the shadow alone).
- Express selection/active state as a `--glaise-fill-selected` fill + weight + primary icon.

### Don't

- Don't use the primary as a section background or card fill.
- Don't introduce a chromatic accent (orange, pink, green) — the default skin is monochrome; chroma is a pigment/brand decision, never improvised per screen. `--glaise-success` / `--glaise-danger` are semantic, not accents — they're earned by meaning, never decorative.
- Don't invent a red for an error state, and don't ship a form without one — `--glaise-danger` exists precisely so neither happens.
- Don't add atmospheric gradients or spotlight cards.
- Don't pill-round CTAs.
- Don't use true black (`--glaise-overlay` is reserved for scrims, not the canvas) or pure white as the canvas — the dark canvas is a soft gray, the light canvas an off-white.
- Don't combine multiple bright accents on a data surface — charts and tags stay within the primary + grays + the two semantics.
- **Don't paint the sidebar the same fill as the workspace.** Use `--glaise-chrome` (a distinct tone — sidebar darker, workspace lighter in light); a same-color sidebar reads flat. Only override when the brief explicitly asks.
- **Don't use a side-stripe / left-accent bar** (`border-left` or an inset box-shadow bar) to mark selected nav items, rows, or callouts — it reads as unfinished. Use a fill, weight, and the primary icon.
- **Don't stack a 1px border and a diffuse drop shadow** on the same card/button ("ghost card"). Pick one elevation language: a hairline **or** a defined shadow token.
- **Don't let muted text drop below contrast.** `--glaise-ink-subtle`/`-tertiary` on a tinted near-white must still clear WCAG AA (verify with `contrast.mjs`); nudge toward `--glaise-ink` if close.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Desktop-XL | 1440px | Default desktop layout |
| Desktop | 1280px | Stat row 4-up maintained; side panel may narrow |
| Tablet | 1024px | Stat row 4-up → 2-up; side panel drops below the table; sidebar may collapse to an icon rail |
| Mobile-Lg | 768px | Sidebar becomes a drawer; tables scroll horizontally inside their panel or shed low-priority columns |
| Mobile | 480px | Single-column; panels stack with the same gutter |

### Touch Targets

- CTAs hold ≥40px tap height across viewports.
- Segmented toggles hold ≥36px tap height; touch viewports grow to ≥44px.
- Form inputs and table row actions hold ≥44px tap target on touch.

### Collapsing Strategy

- **Sidebar**: full rail → icon rail at 1024px → drawer below 768px; the floating gutter stays constant.
- **Stat grids**: 4-up → 2-up at 1024px → 1-up below 768px.
- **Tables**: horizontal scroll inside their own panel (the page never scrolls sideways), or shed low-priority columns by design.
- **Split layouts** (table + side panel): stack below 1024px, data panel first.

### Chart Behavior

- Charts and sparklines stretch with their panel (`preserveAspectRatio="none"`) with `vector-effect: non-scaling-stroke` so stroke weight and end dots stay true at any size.
- Avatars and icon tiles keep fixed sizes; they never scale with the viewport.

## Dark Theme

Glaise ships light by default and a dark counterpart as the *same skin inverted* — not a different identity. Same Inter, same monochrome primary, same surface-ladder + floating-panel model. Only surfaces, ink, hairlines, the primary's value (for legibility), and the depth strategy change.

- **Activation:** `<html data-theme="dark">`. No attribute = light. Tokens are redefined under `:root[data-theme="dark"]` in `tokens.css`; `theme.css` (Tailwind) inherits via the vars, no rebuild.
- **Surfaces invert:** `--glaise-canvas` becomes a soft dark gray (deep, never near-black); cards lift toward lighter grays; `--glaise-ink` is light in four levels; hairlines darken.
- **Primary stays monochrome, value flipped:** a washed near-black is invisible on a dark canvas, so the dark theme re-values `--glaise-primary` as a washed white and `--glaise-on-primary` as a near-black label. The identity is the monochrome role; the value carries the function — the same way the system re-values the semantic colors per theme.
- **Depth stays edge-free by default:** `--glaise-shadow-1` resolves to `none` on both themes — value alone separates a card (the dark ladder's canvas→surface delta is wider than light's for exactly this). Overlays use `--glaise-shadow-2` (soft shadow on light, hairline ring on dark). A project may opt into outlined dark cards at discovery (see Elevation & Depth). The white edge-highlight on lifted panels is a dark-only trick.

Dark is a *state* of the fixed skin, chosen per project (light / dark / both) — never a per-product re-paint.

## Iteration Guide

1. Focus on ONE component at a time and reference it by its component name.
2. When introducing a section, decide first which surface lift it lives on.
3. Default body to `--glaise-text-body` at weight 400.
4. Run `node scripts/validate-skills.mjs` after edits.
5. Add new variants as separate component entries.
6. Treat the primary as scarce: brand mark, primary CTA, focus, link emphasis.
7. Lead every screen with its working data — the table, the metric row, the panel.

## Known Gaps

- The four-step surface ladder is Glaise's canonical surface spec (`bg-level-3`, `line-tint`, etc.) — treat its tokens as the base for any dashboard.
- Form-field error and validation now have their color (`--glaise-danger`), but not yet a canonical composition — the field/error recipe is still pending.
- Dark mode is an official second state of the skin — see "Dark Theme". Light is the default and the family's face.
- A richer color-tag palette (red, orange, yellow, green, blue, purple) for priorities and labels is not yet tokenized — tokenize on the first product that needs tags.
- Inter and JetBrains Mono are the canonical, freely-distributed Glaise typefaces.
</content>
</invoke>
