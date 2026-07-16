---
name: glaise-discovery
description: Use at the start of building a new product UI with Glaise (greenfield), before any code, to capture the product's soul. Runs a short interview — user, task, domain, feel, signature, stack — and writes a glaise-brief.md to the project's docs/glaise/ folder. That brief is the input for building and the anchor that keeps each product distinct within the Glaise family.
---

# Glaise Discovery

The skin is fixed (Glaise). This skill captures the **soul** — what makes *this* product itself — so the build doesn't collapse into a generic template. Output: a `glaise-brief.md` in the project's `docs/glaise/` folder.

## When to run

- Greenfield: before building any UI, when there is no `glaise-brief.md` yet.
- The `glaise` hub invokes this at step 1. It can also be run directly.

**HARD GATE:** do not build, scaffold, or invoke `glaise-build` until the brief is written and confirmed. This applies to EVERY product regardless of perceived simplicity — *"this product is too simple to need an interview"* is the classic way the interview gets skipped, and simple products are where unexamined taste assumptions (theme, edges, signature) waste the most work. The brief can be short; it cannot be absent.

## How to interview

Keep it **short and respectful of the developer's time**. Don't ask twenty questions. Work one area at a time — **one question per message**: propose a sensible default or 2–4 options inferred from the product name and context (multiple choice is easier to answer than open-ended), then wait for the answer before the next question. A wall of ten questions is how half of them go unanswered. Stop as soon as you can write a confident brief — the `Feel` and `Signature` are the parts worth pushing on; the rest can often be inferred. Always confirm the draft before writing (see *Before writing*).

**Show, don't describe (just-in-time):** for questions of *visual taste* — the dark-card-edge choice, picking a pigment — offer to render a quick throwaway sample (a small HTML file with the tokens loaded, screenshotted or opened in the browser) instead of describing the options in words. Offer it only when the question is genuinely visual, never upfront; if the developer declines, continue in text.

Cover these dimensions (they are the brief's sections):

1. **Product** — what is it, in one line.
2. **User** — the real person (not "users"): who, where they are, what they did 5 minutes before and will do 5 minutes after.
3. **Task** — the verb; the one thing they come to do.
4. **Domain** — 5+ concepts, metaphors, and vocabulary from this product's world.
5. **Feel** — in words that mean something. Reject "clean/modern". Push for "calm like a reading app", "dense like a trading floor", "warm like a notebook".
6. **Signature** — the one element (visual, structural, or interaction) that could only exist for THIS product. If you can't name one, keep probing.
7. **Density** — tight / balanced / airy, within the family range.
8. **Key surfaces** — the main screens/areas that exist.
9. **Shell & navigation** — the app frame around those surfaces. Offer a **shell archetype** as the starting point (full catalog in the hub's `references/shells.md`): **Console** (sidebar + top bar — dashboards/admin; **floating panels by default** — sidebar and content as detached cards with a canvas gutter; docked full-bleed only on request), **Focused** (top bar only, contained — wizards/forms), **Workbench** (split list + detail — inbox/CRM/editors), **Reader** (centered, minimal chrome — docs/content), or **Canvas** (full-bleed + floating panels — visual editors). Suggest one from the product type, then confirm the details (sidebar sections/collapsible, what the top bar holds, page shape) — or go custom. The archetype is the frame only; the soul still comes from the rest of the brief.
10. **Stack** — framework (React or Vue), Tailwind (yes/no), then **Skin** and **Theme**:
    - **Skin** — three doors, asked before Theme:
      1. **Default** (recommended) — the Glaise skin, the family's face. No `brand.css`.
      2. **Pigment** — a curated pre-made pack. Offer the table from `glaise-brand`'s
         *Pigments* section (Celadon · Terracotta · Verdigris · Tyrian · Cobalt) with each one-line
         character. On pick, copy `../glaise-brand/references/pigments/<name>.css`
         (sibling skill folder) to the project's `docs/glaise/brand.css`, appending one
         provenance line to its header comment: `pigment: <name> · glaise <version>`,
         where `<version>` comes from the sibling `../glaise/VERSION` file if present
         (copy installs stamp it); if absent (symlink/dev installs), omit it — the line
         reads `pigment: <name>`.
      3. **Custom** — this client has their own identity: finish the brief normally,
         then the hub runs the `glaise-brand` interview before build.
      **Never overwrite silently:** if `docs/glaise/brand.css` already exists, show
      what is there (its header line) and ask before replacing it.
      **Broken install:** if the chosen pigment file is missing (a broken or partial
      install), report the install problem and point at `glaise-update` — never
      fabricate the file.
    - **Theme** — Light (the family default) / Dark / Both (a toggle). If a pigment was
      chosen, propose its primary theme as the default answer.
    - **Dark card edges** (only if the theme includes dark — pure taste, so ask):
      **value-only (the family default)** — cards separate from the canvas by tone alone,
      edge-free like light — or **hairline ring** — outlined cards, for people who like a
      drawn edge. Ring re-values `--glaise-shadow-1` to `0 0 0 1px var(--glaise-hairline)`
      in the project's dark block; the single `box-shadow` declaration model is unchanged.
    Primitives follow the framework (Base UI for React, Reka UI for Vue); icons are
    always Lucide.

## Before writing

Show the developer a draft of the brief and get a confirmation or edits. Only then write the file.

## New project (greenfield)

If the target directory is not yet a git repository, **ask the developer whether to run `git init`** before writing anything — don't assume.

## Where to write

Write the brief to **`docs/glaise/glaise-brief.md`** in the target project (the product's repo) — create the `docs/glaise/` folder if needed. Every document generated by Glaise skills lives in `docs/glaise/`, never scattered in the project root. If the current directory is the Glaise skill repo itself (it contains `skills/glaise/SKILL.md` and no product code), do NOT write a stray file — say there is no target product here, and offer to print the brief as an example or take a path.

## The brief template

Write exactly this structure (fill every section; keep it concise — it's an anchor, not an essay):

```markdown
# Glaise Brief — <Product Name>

> The soul of this product, captured by glaise-discovery. The skin is fixed (Glaise); this brief is what makes this product itself. Build and review read from here.

## Product
<one line: what it is>

## User
<the real person — who, where, what they did 5 min before / will do 5 min after>

## Task
<the verb — the one thing they come to do>

## Domain
<5+ concepts, metaphors, vocabulary from this product's world>

## Feel
<words that mean something — not "clean/modern">

## Signature
<the one element that could only exist for THIS product>

## Density
<tight | balanced | airy>

## Key surfaces
<the main screens/areas that exist>

## Shell & navigation
- Archetype: <Console | Focused | Workbench | Reader | Canvas | custom>
- Mode: <floating (default — detached panels on the canvas) | docked (full-bleed)>
- Sidebar: <none | collapsible left nav with sections: …>
- Top bar: <none | what it holds: wordmark, search, primary actions, profile, theme toggle>
- Page shape: <full-width app shell | centered/contained | split (list + detail)>

## Stack
- Framework: <React | Vue>
- Tailwind: <yes | no>
- Primitives: <Base UI (React) | Reka UI (Vue)>
- Icons: Lucide
- Theme: <light | dark | both>
- Dark card edges: <value-only (default) | hairline ring> (omit if light-only)
- Skin: <default Glaise | pigment: <name> | custom brand.css via glaise-brand>
```

## Brief self-review

After writing the file, look at it with fresh eyes and fix inline (no re-confirmation needed):

1. **Placeholder scan** — any `<...>` left unfilled, "TBD", or empty section? Fill or ask.
2. **Generic-feel check** — if `Feel` could describe any product ("clean", "modern", "simple"), it failed; push once more for words that mean something.
3. **Signature check** — if `Signature` could exist in another product unchanged, it isn't one yet.
4. **Consistency** — do sections contradict (a "dense trading floor" feel with an "airy" density; a Reader archetype with five key surfaces)? Resolve.
5. **Ambiguity** — could any line be read two ways by `glaise-build`? Pick one and make it explicit.

## Handoff

After writing `glaise-brief.md`, return to the flow: the `glaise` hub continues to the build step (`glaise-build`), now guided by the brief.

## Portability

Plain Markdown, works in Claude Code and OpenCode. No agent-specific tools, slash commands, or hardcoded paths.
