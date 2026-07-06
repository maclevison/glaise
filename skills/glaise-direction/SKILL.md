---
name: glaise-direction
description: Use when a Glaise product needs stronger visual character than a default build — to amplify boldness WITHIN the fixed skin. Direction here is not inventing a palette or typeface (those are the skin); it is deciding where to spend boldness inside the family — the signature, layout, motion, density, expressive use of the effective type (Inter by default) — and spending it in one place, hard.
---

# Glaise Direction

When a product needs more character than a default build would give it, this amplifies that character **within the fixed Glaise skin**. The skin never changes; the character grows in what's free.

## When to use

- The brief's **feel** asks for strong character (e.g. "living control room", "calm like a reading app") and a default build would read generic.
- The `glaise` hub invokes this at step 1–2, before or alongside the build. Skip it when the product doesn't need extra character.

## The inversion — read this first

Classic visual direction invents a palette, a typeface, a whole identity. In Glaise that's the **skin, and it's fixed**. So direction here is NOT about inventing a look. It's about deciding **where to spend boldness inside the family** — and spending it in one place, hard. The risk you're fighting isn't a generic SaaS template; it's *every Glaise product looking identical*. Character is the cure, and it comes from this product's world (the brief), never from "make it pop".

## Where character lives (the free levers)

- **The signature** — amplify the brief's signature into the one thing the product is remembered by. This is the primary lever; most of your boldness goes here.
- **Layout & composition** — expressive structure, deliberate asymmetry, a real focal moment; proportions that state a strong relationship.
- **Motion & micro-interaction** — atmosphere, a page-load sequence, a scroll reveal, the signature animating. One orchestrated moment lands harder than scattered effects. This is the one place springs and delight are licensed (see the "Springs & delight" section of `references/motion.md`) — everywhere else stays the family default: sub-300ms, the `ease-out` token, crisp.
- **Density & rhythm** — push tighter or airier *within the family range* to match the feel.
- **Expressive use of the fixed type** — dramatic scale jumps, tight tracking on large display, weight contrast — all using the effective type family (**Inter** by default) and the token type scale, never an off-token font.
- **Meaningful accent** — the accent and the status colors used with intent (status that *means* something), never decoratively.
- **Content & voice** — copy that carries the product's character, tuned to the brief's feel.

## What never changes — the skin

The effective tokens — palette, the type family (**Inter** by default), the accent — the surface ladder, the radius/spacing scales, **Lucide** icons, headless primitives. Direction *amplifies*; it never repaints. If your idea needs a new color, a new font, or a different icon set, it's wrong — find the version that lives in the family.

## Process: plan the character, critique, then build

1. **Read the brief** (`docs/glaise/glaise-brief.md`) — the feel and the signature are your brief for character.
2. **Draft a compact character plan:** the ONE bold move (usually the amplified signature), and how layout, motion, type, and density support it. Keep everything else quiet.
3. **Critique it:** if another Glaise product would plausibly do the same move, it's not specific enough — push it further or root it harder in *this* product's world (the brief's domain). Character must be earned from the subject, not bolted on.
4. **Hand the plan to `glaise-build`.** If the plan is worth keeping, write it to `docs/glaise/glaise-direction.md`.

## Restraint — spend boldness once

Chanel's rule: before you leave, take one thing off. Let the signature be the one memorable thing and keep everything around it disciplined. Not taking a risk is itself a risk — but two bold moves cancel each other out. One place, hard.

## Avoid

- Repainting the skin (new palette/font/icon set) — that's not direction, it's a violation.
- Spreading boldness across many elements — it dilutes to noise.
- Generic "make it modern / make it pop" — character comes from the brief's world.
- Decorative motion or color that doesn't serve the feel.

## Portability

Plain Markdown, works in Claude Code and OpenCode. No agent-specific tools, slash commands, or hardcoded paths; "if a render tool is available" stays conditional.
