---
name: glaise-design-sync
description: Use to publish the project's effective Glaise skin (default tokens + the client's brand.css, if any) as a design-system project in Claude Design (claude.ai/design). Generates a bundle of self-contained @dsCard preview HTMLs — foundations (colors, typography, spacing/radii, surface ladder) and core components — via references/build-design-bundle.mjs, then uploads it (Claude Code) or hands it to GitHub import/upload (other harnesses). One Claude Design project per brand.
---

# Glaise Design Sync

Publishes the **effective skin** — `tokens.css` merged with the project's `docs/glaise/brand.css`, when present — as preview cards a Claude Design design-system project consumes. From then on, designs made in claude.ai/design carry the Glaise family (or the client's brand of it).

The generator is deterministic; run it again after any brand change and re-upload — the cards re-derive from the tokens.

## Steps

### 1. Generate the bundle

```bash
node <skills-dir>/glaise-design-sync/references/build-design-bundle.mjs --project <project-root>
```

Writes `docs/glaise/design-bundle/` in the project: `foundations/` (Colors, Typography, SpacingRadii, Surfaces) + `components/` (Button, Input, Card, Badge, Table). Each card's first line is `<!-- @dsCard group="…" viewport="WxH" -->` — Claude Design builds its card index from that marker. Both themes render side by side inside each card.

If the project has `docs/glaise/brand.css`, the generator merges it over the default tokens automatically — the bundle is the *client's* skin.

### 2. Review

Open 2–3 cards in a browser (or render tool, if available) and sanity-check: both themes legible, tokens applied, no broken layout. Fix only via tokens/brand.css — never by editing generated cards.

### 3. Upload

**Claude Code** — use the DesignSync tool flow, incremental, never a wholesale replace:
1. `list_projects` → pick the brand's project, or `create_project` named after the brand (one project per brand: "Glaise" for the default skin, "Glaise — <client>" for a branded one).
2. Confirm the target is `type: PROJECT_TYPE_DESIGN_SYSTEM` via `get_project`.
3. `finalize_plan` with the bundle paths (writes; deletes only for cards being retired), `localDir` = the bundle dir.
4. `write_files` with `localPath` per card.

**Other harnesses (Codex, Cursor, OpenCode)** — no upload tool; commit the bundle and import it in claude.ai/design (GitHub repo import or file upload). The bundle is plain HTML — nothing harness-specific.

### 4. Handoff

Tell the user the project name and that new Claude Design work should start from it. After a `glaise-brand` run or token change, repeat steps 1–3.

## Notes

- Fonts: cards reference the effective `--glaise-font-sans`; the preview pane falls back through the token's own stack (Inter → system) since the bundle ships no webfonts.
- The generated cards live in `docs/glaise/design-bundle/` (the Glaise docs convention) and are disposable build artifacts — regenerate, don't hand-edit.

## Portability

Plain Markdown, works in any Agent Skills harness (Claude Code, Codex, Cursor, OpenCode). The generator needs only Node. Upload via the DesignSync tool is Claude Code-only; elsewhere the bundle is committed and imported through claude.ai/design.
