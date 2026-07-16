# Glaise Shell Archetypes

The **app shell** is the navigation frame around the product's surfaces: sidebar, top bar, page shape. The structure of a shell is a *solved problem* — these five archetypes are proven starting points so no one reinvents the frame each time. Pick one in `glaise-discovery`, record it in the brief, and build it in `glaise-build`.

> **An archetype is the frame, not the product.** It decides the navigation structure only. The signature, content, hierarchy, density, and domain still come from the brief — **two Console apps should not look alike.** If they do, the soul is missing, not the shell. Archetypes fight wasted effort, never differentiation.

All measurements bind to the skin. The sidebar has two treatments: **floating (the family default)** — a detached `surface-1` card with `--glaise-radius-xl` corners, elevation from the shadow token alone (`--glaise-shadow-1` — resolves to **none** on light, the card separates by value; a hairline ring on dark; **no border on top**), and a visible `canvas` gutter on all sides, floating on the workspace like every other panel; or **docked** — a full-bleed column on **`--glaise-chrome`**, a tone kept **distinct from the workspace `canvas`** (never the same fill) with a `hairline` between them; a same-fill docked sidebar reads flat and is only acceptable when the brief explicitly asks. The content workspace is the `canvas`; structure there comes from white/`surface-1` cards that **float** on it (soft edges, because a light card on the canvas has gentle border contrast), not from repainting the whole content. The active nav item is a **perceptible neutral fill** (`--glaise-fill-selected`) + weight, at full radius, with the accent carried by the item's **icon** — **never a side-stripe / left-accent bar** (that reads as unfinished; it is a banned pattern). Hover uses `--glaise-fill-hover`. Bars are thin bands with a hairline edge; top-bar controls are quiet (ghost icon buttons that fill on hover, not individually boxed), grouped at the edges. Cards and lifted surfaces carry **one elevation language — the shadow token, never a border stacked on it** (`--glaise-shadow-1` resolves to **none** on light — the card separates by value alone — and to a hairline ring on dark, so one `box-shadow` declaration covers both themes; `--glaise-shadow-2` is reserved for overlays). Bare hairline borders remain for inputs, dividers, and docked seams. Mix or deviate when the brief asks — name the deviation in the brief.

## Console — sidebar + top bar, full-width

**For:** dashboards, admin, monitoring, anything with many sections.
**Frame:** left sidebar (~240–280px, sections, collapsible) + a thin top bar (breadcrumb/context left; search, primary action, profile, theme toggle right).
**Floating mode (default):** the sidebar, any sub-nav column, and the main content are each detached `surface-1` panels with a canvas gutter (~8–16px) between them and the viewport edges — the canvas shows through everywhere. The breadcrumb and top-bar actions sit directly **on the canvas** above the panels (no boxed bar); page titles live inside the content panel.
**Docked mode:** the classic edge-to-edge frame (sidebar on `chrome`, hairline seams, full-width content with consistent gutters) — for briefs that ask for maximum density.
**Watch:** the top bar must not compete with the page's focal point; the sidebar serves the content (width says so), it isn't a peer. In floating mode, keep ONE gutter width everywhere — mixed gaps between panels read as misalignment.

## Focused — top bar only, contained

**For:** single-purpose tools, wizards, forms, checkout, onboarding.
**Frame:** minimal top bar (wordmark + exit/progress), no sidebar. One centered column at a narrow max-width (~560–720px). Everything points at the single task.
**Watch:** resist adding nav "just in case" — the absence of chrome *is* the design.

## Workbench — split (list + detail)

**For:** inbox, CRM, triage, editors — navigate items, then work one.
**Frame:** a list column (~320–400px) beside a detail panel; an optional thin sidebar for sections/filters. Selection persists; the detail panel is the focus. Higher density than Console.
**Watch:** one clear selected state in the list; the detail leads, the list supports.

## Reader — centered, minimal chrome

**For:** docs, long-form content, articles, simple settings.
**Frame:** a single reading measure (~680–760px), generous type and whitespace, no sidebar (an unobtrusive TOC at most), little-to-no top bar.
**Watch:** typography and rhythm carry this one; quiet is the point, not emptiness — still give it a focal point and a signature.

## Canvas — full-bleed with floating panels

**For:** visual editors, maps, boards, diagram/design tools.
**Frame:** the work surface fills the viewport; floating panels (toolbar, inspector, layers) sit over it with a surface lift + shadow. Optional thin top bar. The canvas is the product.
**Watch:** panels float without crowding the work; depth (shadow tokens) separates them from the canvas, not heavy borders.
