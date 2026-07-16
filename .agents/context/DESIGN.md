# Design

> Source of truth: `skills/glaise/references/design.md` (semantic doc) and
> `skills/glaise/references/tokens.css` (canonical values). This file is a pointer +
> summary for impeccable; never duplicate literals that tokens.css owns.

## Theme

Light is the default face (`:root`); dark is the second state (`data-theme="dark"`).
Canvas is off-white "whitespace"; dark canvas is a soft dark gray, never near-black.

## Color

- Monochrome primary: `--glaise-primary` (washed near-black light / washed white dark).
  Functional ink, not a color. Chroma only via pigment/brand packs.
- Exactly two semantics: `--glaise-success` (dots/pills, 3:1 floor), `--glaise-danger`
  (carries body text, 4.5:1 floor). No warning, no info.
- Neutrals: 4-step ink ramp, 4-step surface ladder, 3 hairlines, chrome.

## Elevation

Cards carry `box-shadow: var(--glaise-shadow-1)` and nothing else — resolves to none on
light (separation by value alone) and to a hairline ring on dark. `--glaise-shadow-2` is
overlays-only. Never stack a border on a card (ghost-card ban).

## Typography

Inter only (JetBrains Mono for code/IDs). Scale, weights, and tracking are fixed in
design.md (display 600 negative tracking → body 400). Tabular numerals for data.

## Layout

Floating Console is the family default: sidebar and content panels are detached surface-1
cards with one consistent canvas gutter (`--glaise-space-sm`); breadcrumb/actions sit on
the canvas. Radius: cards `--glaise-radius-lg` (16px), panels `--glaise-radius-xl` (20px).
Spacing binds to the 4px-base `--glaise-space-*` scale.

## Components

Headless primitives (Base UI / Reka UI) styled to the skin; Lucide icons only
(stroke ~1.75, currentColor). Selected nav = `--glaise-fill-selected` fill + weight +
primary icon; never a side-stripe. Buttons: primary fill / secondary surface+hairline /
tertiary ghost. Motion: `--glaise-ease-out`, sub-300ms, state-conveying only.
