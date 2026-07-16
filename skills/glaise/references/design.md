---
version: alpha
name: Glaise-design-analysis
description: A near-black product-focused canvas built around the deepest dark surface in the system (the canvas), light gray text (ink), and a signature Glaise lavender-blue (the primary accent) used as the single chromatic accent. The system reads as software-craft documentation: dense, technical, and quietly luxurious. Display type is set in Inter at 500–700 with measured negative tracking. Cards live as charcoal panels (surface-1) with hairline borders. The accent lavender appears on the brand mark, focus rings, and a few intentional CTAs — never decoratively. Page rhythm leans on product UI screenshots framed in dark panels rather than atmospheric color.
---

> Brandable values — color, surfaces, radius, spacing, and the type *family* — are canonical in `tokens.css` (default) and may be overridden per client by `brand.css`; this document never pins their literals (read `tokens.css` for current values). The invariant type *scale* (weights, line-heights, tracking) and structural measures are specified here as part of the fixed engine — a brand cannot change them. The accent role is `--glaise-primary`, whatever its effective value — lavender in the default skin; a pigment or brand may re-value it without changing its role or scarcity.

## Overview

Glaise's canvas is the deepest dark surface in the system — `--glaise-canvas` is essentially pure black with a faint blue tint. On top sits a four-step surface ladder (`--glaise-surface-1` through `--glaise-surface-4`) for cards, panels, and lifted tiles, with hairline borders running from `--glaise-hairline` up through `--glaise-hairline-strong` and `--glaise-hairline-tertiary`. Light gray text (`--glaise-ink`) carries the body and headlines.

The single chromatic accent is **Glaise lavender-blue** `--glaise-primary` — used on the brand mark, focus rings, and the primary CTA button. A lighter hover state (`--glaise-primary-hover`) and a focus-tinted variant (`--glaise-primary-focus`) extend the same hue. Glaise avoids saturated greens, oranges, reds, etc. on the canvas — the semantic colors are exactly two: `--glaise-success` for status pills and the rare success indicator, and `--glaise-danger` for error states. A semantic color is **not** an accent: it is earned by meaning and never used decoratively. There is deliberately no `warning` and no `info` — an informational emphasis is already `--glaise-primary`.

Display type runs **Inter** at weight 500–700 with negative letter-spacing scaling from -3.0px at the largest display size down to 0 at body. Body sizes also run Inter, and JetBrains Mono is reserved for code snippets in product screenshots.

The page rhythm is **dense product screenshots** — Glaise leads with high-fidelity captures of the product UI (issue list, project view, dashboard) framed in `--glaise-surface-1` panels with `--glaise-radius-xl` corners. The chrome is intentionally minimal so the app screenshots can do the heavy lifting.

**Key Characteristics:**
- **Dark-canvas system** — `--glaise-canvas` is the deepest dark in the system, a near-black surface.
- **Lavender-blue brand accent** (`--glaise-primary`) — used scarcely on brand mark, focus, and the primary CTA.
- Four-step surface ladder (canvas → surface-1 → surface-2 → surface-3 → surface-4) carries hierarchy without shadow.
- Display tracking pulls aggressively negative (-3.0px at the largest size); body holds at -0.05px.
- Cards use `--glaise-radius-lg` corners with 1px hairline borders — never pill, rarely the screenshot radius.
- **Product UI screenshots** dominate the page. The chrome is a dark frame for the app.
- No second chromatic color. No atmospheric gradients. No spotlight cards.

## Colors

> Source: Glaise design system — base tokens for dashboards and panels.

### Brand & Accent
- **Lavender-Blue** (`--glaise-primary`): The signature Glaise accent — primary CTA, brand mark, link emphasis.
- **Lavender Hover** (`--glaise-primary-hover`): Lighter lavender — hovered state of the primary CTA.
- **Lavender Focus** (`--glaise-primary-focus`): Focus-ring tint — focused inputs, focused buttons.
- **Brand Secure** (`--glaise-brand-secure`): Muted lavender-gray — used in "Glaise Security" surfaces.

### Surface
- **Canvas** (`--glaise-canvas`): Default page / workspace background — near-pure black with a faint blue tint (an off-white workspace in light).
- **Chrome** (`--glaise-chrome`): The app sidebar / chrome surface — kept **distinct** from the canvas (never the same fill: a touch darker than the workspace in light, a subtle lift in dark). A same-color sidebar is only for briefs that explicitly ask for it.
- **Surface 1** (`--glaise-surface-1`): One step above canvas — feature cards, pricing cards, product screenshot panels.
- **Surface 2** (`--glaise-surface-2`): Two steps above — featured pricing card, hovered cards.
- **Surface 3** (`--glaise-surface-3`): Three steps above — line-tertiary backgrounds, sub-nav.
- **Surface 4** (`--glaise-surface-4`): Four steps above — bg-level-3, deepest lifted surface.
- **Hairline** (`--glaise-hairline`): 1px borders on cards and dividers.
- **Hairline Strong** (`--glaise-hairline-strong`): Stronger 1px borders — input focus rings.
- **Hairline Tertiary** (`--glaise-hairline-tertiary`): Tertiary borders for nested surfaces.
- **Inverse Canvas** (`--glaise-inverse-canvas`): Pure white — surface of the inverse pill CTA on a small set of section openers.
- **Inverse Surface 1** (`--glaise-inverse-surface-1`): One step above inverse canvas.
- **Inverse Surface 2** (`--glaise-inverse-surface-2`): Two steps above inverse canvas.

### Text
- **Ink** (`--glaise-ink`): All headlines and emphasized body type — light gray.
- **Ink Muted** (`--glaise-ink-muted`): Secondary type — meta info on hero panels.
- **Ink Subtle** (`--glaise-ink-subtle`): Tertiary type — deselected pricing tabs, footer columns.
- **Ink Tertiary** (`--glaise-ink-tertiary`): Quaternary — disabled, footnotes.

### Semantic

Exactly two, and they are not accents — a semantic color is earned by meaning, never used to decorate. Their contrast floors differ because their **roles** differ.

- **Success Green** (`--glaise-success`): Status pills, success indicators. Only ever a dot or a pill, never a sentence — held to the 3:1 floor.
- **Danger Red** (`--glaise-danger`): Error states — field validation messages, the error state of a data view, destructive confirmation. It carries **body text**, so it is held to the **4.5:1** floor on both themes, against the canvas and the card surfaces. Use it for the message, the field's border, and the error icon; do not fill a button with it (a destructive action is a `button-secondary` with danger text — the system stays quiet).
- **Overlay** (`--glaise-overlay`): Pure black overlay scrim for modals.

> A pigment or brand may re-value `--glaise-danger`, and **must** when its accent lands within ~30° of the danger hue — otherwise an error reads as a CTA (and the two collapse onto each other under protanopia). Terracotta is the shipped example.

### Interactive State Fills

The surface ladder describes *containers*; these describe *interactive states* (hover / selected / pressed) on nav items, list rows, and menu options. They are neutral overlays — not surface steps — so they read on any surface and in both themes.

- **Fill Hover** (`--glaise-fill-hover`): Hovered nav item, row, or ghost icon button.
- **Fill Selected** (`--glaise-fill-selected`): The active/selected nav item — a perceptible neutral fill, stronger than hover. Selection is a fill, **never** a left-accent bar; the lavender accent is carried by the item's icon.
- **Fill Pressed** (`--glaise-fill-pressed`): Momentary pressed state.

## Typography

### Font Family

- **Inter** (`--glaise-font-sans`) — the system typeface; fallback `Inter, -apple-system, system-ui, Segoe UI, Roboto`. Carries everything from display-xl through captions and button labels.
- **JetBrains Mono** (`--glaise-font-mono`) — monospace cut; fallback `ui-monospace, SF Mono, Menlo`. Used for code snippets in product screenshots and for status / ID tokens.

The surface treats display and body sizes as one continuous voice; the size change is silent.

### Hierarchy

| Token | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|
| `--glaise-text-display-xl` | 600 | 1.05 | -3.0px | Largest hero headline |
| `--glaise-text-display-lg` | 600 | 1.10 | -1.8px | Section opener headlines |
| `--glaise-text-display-md` | 600 | 1.15 | -1.0px | Sub-section headlines |
| `--glaise-text-headline` | 600 | 1.20 | -0.6px | Pricing tier titles, CTA banner heading |
| `--glaise-text-card-title` | 500 | 1.25 | -0.4px | Feature card title |
| `--glaise-text-subhead` | 400 | 1.40 | -0.2px | Lead body, intro paragraphs |
| `--glaise-text-body-lg` | 400 | 1.50 | -0.1px | Hero subhead, lead paragraphs |
| `--glaise-text-body` | 400 | 1.50 | -0.05px | Default body |
| `--glaise-text-body-sm` | 400 | 1.50 | 0 | Card body, footer columns |
| `--glaise-text-caption` | 400 | 1.40 | 0 | Captions, meta, status |
| (button label) | 500 | 1.20 | 0 | All button labels |
| `--glaise-text-eyebrow` | 500 | 1.30 | 0.4px | Section eyebrow (slight positive tracking) |
| `--glaise-text-mono` | 400 | 1.50 | 0 | JetBrains Mono for code in product screenshots |

### Principles

- **Aggressive negative tracking on display** (-3.0px at 80px ≈ 4% of size).
- **Single voice from display to body.** Display-xl at 600 → body at 400 — same family (Inter), narrower weights.
- **Eyebrow uses positive tracking** (+0.4px) — contrast against the negative-tracked display marks the eyebrow as taxonomy.
- **Mono only in code contexts.** JetBrains Mono lives inside product screenshots — not on the chrome.

### Note on Fonts

**Inter** is the canonical Glaise typeface — free, variable, and widely available (Google Fonts / self-hosted). Use weights 500 / 600 / 700 for display and 400 for body. On macOS, `-apple-system, system-ui` is an acceptable fallback. For mono, **JetBrains Mono** at weight 400 is the standard; **Geist Mono** is a viable alternative.

## Layout

### Spacing System

- **Base unit**: 4px.
- **Tokens**: `--glaise-space-xxs` · `--glaise-space-xs` · `--glaise-space-sm` · `--glaise-space-md` · `--glaise-space-lg` · `--glaise-space-xl` · `--glaise-space-xxl` · `--glaise-space-section`.
- Card interior padding: `--glaise-space-lg` on feature/pricing cards; `--glaise-space-xl` on testimonial cards; `--glaise-space-xxl` on CTA banners.
- Pill button padding: `--glaise-space-xs` vertical · 14px horizontal — Glaise's compact button spec.
- Form input padding: `--glaise-space-xs` vertical · `--glaise-space-sm` horizontal.

### Grid & Container

- Max content width sits around 1280px.
- Card grids are 3-up at desktop, 2-up at tablet, 1-up at mobile.
- Pricing tier grid is 3-up; comparison strip below shows checkmarks per tier.
- Product screenshot panels span full content width — they're the protagonist.

### Whitespace Philosophy

The dark canvas IS the whitespace. Sections separate by lift onto surface-1 panels, not by gaps in white. Within a panel, generous `--glaise-space-lg` gaps between content blocks; `--glaise-space-section` between sections.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow, no border | Default for body type, hero text, footer |
| 1 (charcoal lift) | `--glaise-surface-1` background on canvas, 1px `--glaise-hairline` | Default cards, product panels |
| 2 (surface-2 lift) | `--glaise-surface-2` background, 1px `--glaise-hairline-strong` | Featured pricing card, hovered cards |
| 3 (surface-3 lift) | `--glaise-surface-3` background | Sub-nav, dropdown menus |
| 4 (focus ring) | 2px `--glaise-primary-focus` outline at 50% opacity | Focused input, focused button |

Glaise's depth is carried by surface ladder + hairline borders. The system resists drop shadows on dark almost entirely.

### Decorative Depth

- **Product UI screenshots** dominate as decorative depth.
- **No atmospheric gradients, no spotlight cards.**
- **Subtle white edge highlight** on the top edge of lifted panels — gives the dark surface a faint "pixel rendered" feel.

## Shapes

### Border Radius Scale

| Token | Use |
|---|---|
| `--glaise-radius-xs` | Small chips, status badges |
| `--glaise-radius-sm` | Inline tags |
| `--glaise-radius-md` | All buttons, form inputs |
| `--glaise-radius-lg` | Pricing cards, feature cards, testimonial cards |
| `--glaise-radius-xl` | Product screenshot panels |
| `--glaise-radius-xxl` | Oversized CTA banners (rare) |
| `--glaise-radius-pill` | Pricing tab toggles, status pills |
| `--glaise-radius-full` | Avatar circles |

### Photography & Illustration Geometry

- Product UI screenshots dominate; they sit in `--glaise-radius-xl` tiles with `--glaise-space-lg` outer padding.
- Customer logo tiles render at small sizes (~24px logo height) on `--glaise-canvas` with no border.
- Avatar circles in testimonial cards use `--glaise-radius-full` at 32–40px sizes.

## Components

### Buttons

**`button-primary`** — Lavender CTA. The default primary CTA across all pages.
- Background `--glaise-primary`, text `--glaise-on-primary`, button-label type, padding `--glaise-space-xs` 14px, rounded `--glaise-radius-md`.
- Pressed state shifts the background to `--glaise-primary-focus`.
- Hover state shifts the background to `--glaise-primary-hover` (lighter lavender).

**`button-secondary`** — Charcoal button. Used for secondary CTAs ("Sign in", "Read changelog").
- Background `--glaise-surface-1`, text `--glaise-ink`, button-label type, padding `--glaise-space-xs` 14px, rounded `--glaise-radius-md`. 1px `--glaise-hairline` border.

**`button-tertiary`** — Plain text button.
- Background `--glaise-canvas`, text `--glaise-ink`, button-label type, rounded `--glaise-radius-md`, padding `--glaise-space-xs` 14px.

**`button-inverse`** — White-on-dark inverse CTA.
- Background `--glaise-inverse-canvas`, text `--glaise-inverse-ink`, button-label type, rounded `--glaise-radius-md`, padding `--glaise-space-xs` 14px.

### Pricing Tabs

**`pricing-tab-default`** + **`pricing-tab-selected`** — Pill-toggle on `/pricing`.
- Default: `--glaise-canvas` background, `--glaise-ink-subtle` text, rounded `--glaise-radius-pill`, padding 6px 14px.
- Selected: `--glaise-surface-2` background, `--glaise-ink` text — selected = surface lift.

### Cards & Containers

**`pricing-card`** — Each tier on `/pricing`.
- Background `--glaise-surface-1`, text `--glaise-ink`, body type, rounded `--glaise-radius-lg`, padding `--glaise-space-lg`. 1px `--glaise-hairline` border.

**`pricing-card-featured`** — Recommended tier — surface lift to surface-2.
- Background `--glaise-surface-2`, otherwise identical structure.

**`feature-card`** — Generic feature highlight tile.
- Background `--glaise-surface-1`, text `--glaise-ink`, body type, rounded `--glaise-radius-lg`, padding `--glaise-space-lg`.

**`product-screenshot-card`** — The dominant card type — frames a high-fidelity Glaise app UI screenshot.
- Background `--glaise-surface-1`, text `--glaise-ink`, body type, rounded `--glaise-radius-xl`, padding `--glaise-space-lg`.

**`testimonial-card`** — Customer quote with avatar + name + role.
- Background `--glaise-surface-1`, text `--glaise-ink`, body-lg type, rounded `--glaise-radius-lg`, padding `--glaise-space-xl`.

**`customer-logo-tile`** — Small tile in the customer marquee.
- Background `--glaise-canvas`, text `--glaise-ink-subtle`, caption type, rounded `--glaise-radius-xs`, padding `--glaise-space-md`.

**`cta-banner`** — Closing CTA panel near page bottom.
- Background `--glaise-surface-1`, text `--glaise-ink`, headline type, rounded `--glaise-radius-lg`, padding `--glaise-space-xxl`.

### Inputs & Forms

**`text-input`** + **`text-input-focused`** — Form fields on `/contact/sales` and signup overlays.
- Background `--glaise-surface-1`, text `--glaise-ink`, body type, rounded `--glaise-radius-md`, padding `--glaise-space-xs` `--glaise-space-sm`.
- Focused state retains the same surface; the focus ring is a 2px `--glaise-primary-focus` outline at 50% opacity.

### Status & Build Page

**`changelog-row`** — Each row in `/build` (changelog page) listing version, date, and changes.
- Background `--glaise-canvas`, text `--glaise-ink`, body type, rounded `--glaise-radius-xs`, padding `--glaise-space-lg` 0. 1px `--glaise-hairline` bottom rule.

**`status-badge`** — Small status pill.
- Background `--glaise-surface-2`, text `--glaise-ink-muted`, caption type, rounded `--glaise-radius-pill`, padding 2px `--glaise-space-xs`.

### Navigation

**`top-nav`** — Sticky dark bar with the Glaise wordmark left, primary nav links centered, and a `button-secondary` ("Sign in") + `button-primary` ("Get started") pair right.
- Background `--glaise-canvas`, text `--glaise-ink`, body-sm type, height 56px.

**`app-sidebar`** — the product's left rail. Background `--glaise-chrome` (distinct from the workspace `--glaise-canvas` — never the same fill), 1px `--glaise-hairline` on its inner edge. Holds `nav-item`s.

**`nav-item`** (app sidebar) — a row in the product sidebar. Default / hover / selected are one component, not three improvised looks.
- **Default:** transparent background, `--glaise-ink-subtle` icon, `--glaise-ink-muted` label, `--glaise-radius-md`, ~34–38px height (≥44px touch), consistent horizontal inset so the fill has air from the sidebar edge.
- **Hover:** background `--glaise-fill-hover`, label brightens toward `--glaise-ink-muted`.
- **Selected:** background `--glaise-fill-selected`, label `--glaise-ink` at weight 500–600, icon `--glaise-primary`. Full radius on all four corners. **No side-stripe / left-accent bar** — the fill + weight + lavender icon carry the state.

**`app-topbar`** — the product's thin top band (Console / Workbench shells). Height ~56–60px, `--glaise-canvas` (optionally a translucent canvas with `backdrop-filter`), 1px `--glaise-hairline` bottom.
- Controls are **quiet**: the account/context switcher is a low-key `surface-1` pill (hairline, chevron, hover fill) — not a heavy bordered box. Icon actions are **ghost buttons** (transparent, fill with `--glaise-fill-hover` on hover), grouped at the right edge — never individually boxed with borders + shadows. Left content aligns to the page gutter.

### Footer

**`footer`** — Dense link grid on `--glaise-canvas` with the Glaise wordmark left.
- Background `--glaise-canvas`, text `--glaise-ink-subtle`, caption type, padding 64px `--glaise-space-xl`.

## Do's and Don'ts

### Do

- Reserve `--glaise-canvas` as the system's anchor surface — the faint blue tint is intentional.
- Use `--glaise-primary` lavender ONLY for: brand mark, primary CTA, focus ring, link emphasis.
- Use the four-step surface ladder for hierarchy. Avoid skipping levels.
- Pair display weight 600 with body weight 400 — Glaise resists 700+ display weights.
- Apply negative letter-spacing aggressively on display.
- Use product UI screenshots as the protagonist of every section.
- Compose CTAs as `--glaise-radius-md` corners.
- Keep the sidebar on `--glaise-chrome`, distinct from the workspace `--glaise-canvas` (sidebar a touch darker, workspace lighter).
- Let white/`surface-1` cards float on the workspace canvas — the soft edge (light card on the canvas) *is* the premium separation; don't repaint the whole workspace to force it.
- Give each card one elevation language — a hairline **or** a shadow token (in light, `--glaise-shadow-1` already carries a ring, so use the shadow alone).
- Express selection/active state as a `--glaise-fill-selected` fill + weight + lavender icon.

### Don't

- Don't use lavender as a section background or card fill.
- Don't introduce a second chromatic accent (orange, pink, green). `--glaise-success` / `--glaise-danger` are semantic, not accents — they're earned by meaning, never decorative.
- Don't invent a red for an error state, and don't ship a form without one — `--glaise-danger` exists precisely so neither happens.
- Don't add atmospheric gradients or spotlight cards.
- Don't pill-round CTAs.
- Don't use true black (`--glaise-overlay` is reserved for scrims, not the canvas) as the canvas.
- Don't combine multiple bright accents in product screenshot mockups.
- **Don't paint the sidebar the same fill as the workspace.** Use `--glaise-chrome` (a distinct tone — sidebar darker, workspace lighter in light); a same-color sidebar reads flat. Only override when the brief explicitly asks.
- **Don't use a side-stripe / left-accent bar** (`border-left` or an inset box-shadow bar) to mark selected nav items, rows, or callouts — it reads as unfinished. Use a fill, weight, and the lavender icon.
- **Don't stack a 1px border and a diffuse drop shadow** on the same card/button ("ghost card"). Pick one elevation language: a hairline **or** a defined shadow token.
- **Don't let muted text drop below contrast.** `--glaise-ink-subtle`/`-tertiary` on a tinted near-white must still clear WCAG AA (verify with `contrast.mjs`); nudge toward `--glaise-ink` if close.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Desktop-XL | 1440px | Default desktop layout |
| Desktop | 1280px | Card grid 3-up maintained |
| Tablet | 1024px | Card grid 3-up → 2-up |
| Mobile-Lg | 768px | Pricing comparison becomes accordion; nav hamburger |
| Mobile | 480px | Single-column; display-xl scales 80px → ~36px |

### Touch Targets

- CTAs hold ≥40px tap height across viewports.
- Pricing tab pills hold ≥36px tap height; touch viewports grow to ≥44px.
- Form inputs hold ≥44px tap target on touch.

### Collapsing Strategy

- **Top nav**: links collapse to hamburger below 768px.
- **Card grids**: 3-up → 2-up at 1024px → 1-up below 768px.
- **Pricing comparison**: per-tier accordion below 768px.
- **Display type**: `--glaise-text-display-xl` scales toward `--glaise-text-display-md` on mobile.

### Image Behavior

- Product UI screenshots maintain aspect ratio and never crop.
- Customer logos in the marquee may collapse from 6-up to 3-up below 768px.

## Light Theme

Glaise ships dark by default and a light counterpart as the *same skin inverted* — not a different identity. Same Inter, same lavender as the single accent, same surface-ladder + hairline model. Only surfaces, ink, hairlines, the accent value (for legibility), and the depth strategy change.

- **Activation:** `<html data-theme="light">`. No attribute = dark. Tokens are redefined under `:root[data-theme="light"]` in `tokens.css`; `theme.css` (Tailwind) inherits via the vars, no rebuild.
- **Surfaces invert:** `--glaise-canvas` becomes off-white (not pure white); cards lift toward white; `--glaise-ink` is dark in four levels; hairlines are light.
- **Accent stays lavender, value nudged:** the default `--glaise-primary` fails AA on light surfaces, so the light theme redefines `--glaise-primary` darker (hue preserved, ≥4.5:1 as text and as fill). The accent's identity is the hue; the value carries the function — the same way the system desaturates semantic colors per theme.
- **Depth inverts:** dark carries elevation through the surface ladder + hairlines, with almost no shadow. On light the ladder (white-on-off-white) is too subtle, so elevation adds **shadow** (`--glaise-shadow-1` / `--glaise-shadow-2`), which resolve to `none` in dark. The white edge-highlight on lifted panels is a dark-only trick; on light it is replaced by the shadow. The `--glaise-inverse-*` pill CTA is dark-only.

Light is a *state* of the fixed skin, chosen per project (dark / light / both) — never a per-product re-paint.

## Iteration Guide

1. Focus on ONE component at a time and reference it by its component name.
2. When introducing a section, decide first which surface lift it lives on.
3. Default body to `--glaise-text-body` at weight 400.
4. Run `node scripts/validate-skills.mjs` after edits.
5. Add new variants as separate component entries.
6. Treat lavender as scarce: brand mark, primary CTA, focus, link emphasis.
7. Lead every section with a product UI screenshot.

## Known Gaps

- The four-step surface ladder is Glaise's canonical surface spec (`bg-level-3`, `line-tint`, etc.) — treat its tokens as the base for any dashboard.
- Form-field error and validation now have their color (`--glaise-danger`), but not yet a canonical composition — the field/error recipe is still pending.
- Light mode is an official second state of the skin — see "Light Theme". Dark remains the default and the family's face.
- A richer color-tag palette (red, orange, yellow, green, blue, purple) for priorities and labels lives in the in-product surfaces shown in mockups, not on the marketing chrome.
- Inter and JetBrains Mono are the canonical, freely-distributed Glaise typefaces.
</content>
</invoke>
