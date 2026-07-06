# Glaise Motion

The motion layer of the family skin. Like `design.md` is the "why" behind color and type, this is the "why" behind movement; the values live as tokens in `tokens.css` (`--glaise-ease-*`, `--glaise-duration-*`). Load this when a build or review needs an exact curve, duration, or rule.

Motion in Glaise lives in **two layers**, and they must not blur together:

- **The family default (skin).** Crisp, quiet, sub-300ms, consistent everywhere. That is everything below — it is fixed, like the palette.
- **Delight & signature (soul).** Springs, a page-load sequence, a celebration, the signature animating. That is **boldness**, and it belongs to `glaise-direction` — spent in one place, hard, never sprayed into the default.

Distilled from Emil Kowalski's design engineering philosophy ([animations.dev](https://animations.dev/)).

## Should it animate at all? (decide before how)

The first question is never "how do I animate this" — it's "should this move." Match motion to how often the user sees it.

| Frequency | Decision |
| --- | --- |
| 100+/day (keyboard shortcuts, command-palette toggle) | **No animation. Ever.** |
| Tens/day (hover effects, list navigation) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, feedback, celebration) | Can add delight (→ `glaise-direction`) |

**Never animate keyboard-initiated actions** — they repeat hundreds of times daily; animation makes them feel slow and disconnected (Raycast has no open/close animation, correct for something used hundreds of times a day).

Every animation must answer **"why does this move?"** — valid purposes are: spatial consistency, state indication, explanation, feedback, preventing a jarring change. "It looks cool" on a frequently-seen element is not a purpose. When unsure whether motion feels right, the strongest move is often to delete it.

## Easing (use the family tokens)

Decision order:

- Entering or exiting → **`var(--glaise-ease-out)`** (starts fast, feels responsive)
- Moving / morphing on screen → **`var(--glaise-ease-in-out)`**
- Drawer / sheet → **`var(--glaise-ease-drawer)`**
- Hover / color change → **`ease`**
- Constant motion (marquee, progress) → **`linear`**
- Default → **`var(--glaise-ease-out)`**

**Never `ease-in` on UI.** It starts slow, delaying the exact moment the user is watching — `ease-out` at 200ms *feels* faster than `ease-in` at 200ms. The built-in CSS easings are too weak; that is why the family ships strong custom curves as tokens. On Tailwind, the `ease-out` / `ease-in-out` utilities already resolve to these curves; `ease-drawer` is also available.

## Duration (the family ladder)

| Element | Token | Value |
| --- | --- | --- |
| Button press feedback, small tooltips/popovers | `--glaise-duration-fast` | 120ms |
| Dropdowns, selects, default UI | `--glaise-duration-base` | 200ms |
| Heavier UI (still under 300) | `--glaise-duration-slow` | 280ms |
| Drawers, modals (the physical exception) | `--glaise-duration-drawer` | 400ms |

**Rule: UI animations stay under 300ms** — only drawers/modals earn `--duration-drawer`, because they travel a real distance. A 180ms dropdown feels more responsive than a 400ms one. Faster spinners make load *feel* faster at the same actual time.

## Physicality

- **Never `scale(0)`.** Start from `scale(0.95)` (range 0.9–0.97) + `opacity: 0`. Nothing in the real world appears from nothing.
- **Origin-aware popovers.** Dropdowns, selects, tooltips, popovers scale from their **trigger**, not center:
  ```css
  .popover { transform-origin: var(--radix-popover-content-transform-origin); } /* Radix */
  .popover { transform-origin: var(--transform-origin); }                       /* Base UI */
  ```
  **Modals are exempt** — they appear centered in the viewport, keep `transform-origin: center`.
- **Button press feedback.** `transform: scale(0.97)` on `:active` with `transition: transform var(--glaise-duration-fast) var(--glaise-ease-out)`. Subtle (0.95–0.98); applies to any pressable element. `scale()` also scales children (font, icons) — a feature for press feedback.

## Interruptibility

CSS **transitions** can be interrupted and retargeted mid-flight; **keyframes** restart from zero. For anything triggered rapidly (toasts being added, toggles, anything a user can re-fire) use transitions, not keyframes.

```css
/* Interruptible — good for dynamic UI */
.toast { transition: transform var(--glaise-duration-drawer) var(--glaise-ease-out); }
```

Use `@starting-style` for entry without JS (fallback: a `data-mounted` attribute set in `useEffect`):

```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity var(--glaise-duration-drawer) var(--glaise-ease-out),
              transform var(--glaise-duration-drawer) var(--glaise-ease-out);
  @starting-style { opacity: 0; transform: translateY(100%); }
}
```

`translate` percentages are relative to the element's own size — `translateY(100%)` moves by the element's height regardless of dimensions (how Sonner/Vaul position toasts/drawers). Prefer over hardcoded px.

## Asymmetric timing

Slow where the user is deciding, fast where the system responds. Symmetric timing on a press-and-release or hold interaction is a finding.

```css
.overlay { transition: clip-path var(--glaise-duration-base) var(--glaise-ease-out); } /* release: fast */
.button:active .overlay { transition: clip-path 2s linear; }                            /* press: slow, deliberate */
```

## Performance

- **Only animate `transform` and `opacity`** — they skip layout/paint and run on the GPU. `width`/`height`/`margin`/`padding`/`top`/`left` trigger all three rendering steps. Never `transition: all`.
- **Don't drive a child transform via a CSS variable on the parent** — it recalcs styles for every child. Set `transform` directly on the element.
- **Framer Motion shorthands (`x`/`y`/`scale`) are NOT hardware-accelerated** — they run on the main thread via rAF and drop frames under load. Use the full string: `animate={{ transform: "translateX(100px)" }}`.
- **CSS beats JS under load** — CSS animations run off the main thread and stay smooth while the browser loads/scripts/paints. Use CSS for predetermined motion, JS/springs for dynamic/interruptible. **WAAPI** gives JS control at CSS performance (hardware-accelerated, interruptible, no library).

## Masking imperfect crossfades

When a crossfade shows two overlapping states despite tuning easing/duration, add subtle `filter: blur(2px)` during the transition to blend them into one perceived transformation. Keep blur < 20px (heavy blur is expensive, especially in Safari).

## Stagger

Stagger group entrances; **30–80ms** between items. Longer delays feel slow. Stagger is decorative — never block interaction while it plays.

```css
.item { opacity: 0; transform: translateY(8px); animation: fadeIn var(--glaise-duration-slow) var(--glaise-ease-out) forwards; }
.item:nth-child(2) { animation-delay: 50ms; }
@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
```

## Springs & delight (→ glaise-direction)

Springs simulate physics, so they feel alive — but they are **soul, not default**. Reach for them only inside a deliberate `glaise-direction` moment: drag with momentum, an "alive" element, interruptible gestures, decorative mouse-tracking. Keep them out of routine UI.

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }   // Apple-style, easier to reason about
```

Keep bounce subtle (0.1–0.3); avoid bounce in routine UI. Springs maintain velocity when interrupted (keyframes restart from zero), so they're ideal for gestures users may reverse mid-motion. For mouse interactions, interpolate with `useSpring` rather than tying value directly to position (direct = artificial). For gestures: momentum dismissal (dismiss if velocity `> ~0.11`, not on distance alone), damping/friction at boundaries, pointer capture once dragging starts, ignore extra touch points after the drag begins.

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* keep opacity/color, drop transform-based motion */
}
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); } /* gate hover motion — touch fires false hovers on tap */
}
```

Reduced motion means **fewer and gentler**, not zero — keep transitions that aid comprehension, remove movement/position changes.

## Cohesion

Match motion to the component's personality and the rest of the product — a Glaise dashboard stays crisp and fast; a celebration can be softer. Sonner feels right partly because easing, duration, design, and even the name are in harmony. Entering/exiting lists (opacity + height) are trial and error — there's no formula, adjust until it feels right.

## Debugging (recommend in review when feel is uncertain)

- **Slow motion** — bump duration 2–5× or use the DevTools animation inspector; check that colors crossfade cleanly, easing doesn't stop abruptly, `transform-origin` is right, coordinated properties stay in sync.
- **Frame-by-frame** — Chrome DevTools Animations panel reveals timing drift between coordinated properties.
- **Real devices** for gestures (drawers, swipe).
- **Fresh eyes next day** — imperfections invisible during development surface later.
