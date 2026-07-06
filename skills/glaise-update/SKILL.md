---
name: glaise-update
description: Use to update the installed Glaise design-system skills on this machine to the latest release. Detects the install (Claude Code / OpenCode, global / project / symlink), compares the installed version against the latest GitHub release, shows the exact command, confirms, and runs the installer. Defaults to the latest stable release; accepts `main` or a `vX.Y.Z` to pin.
---

# Glaise Update

Updates the person's installed `glaise*` skills. The engine is the repo's `install.sh` (copy-overwrite); this skill wraps it with **detection + a version check + a confirmation** so updating is one step from inside Claude Code or OpenCode.

Repo: **`maclevison/glaise`** (public). Default: the latest published **release** (stable).

## Argument

- *(none)* / `latest` / `release` → latest published release (default).
- `main` → the tip of `main` (may be ahead of the last release).
- `vX.Y.Z` → pin a specific version.

## Steps

Run them in order; stop and report if a step can't complete.

### 1. Detect the install target
Find the installed hub skill dir (first that exists; prefer a project dir when inside one):
- Claude Code — global `~/.claude/skills/glaise`, project `./.claude/skills/glaise`
- OpenCode — global `~/.config/opencode/skills/glaise`, project `./.opencode/skills/glaise`

Record the matching **target** (`claude` / `opencode`), **scope** (global / project + its dir), and whether the dir is a **symlink** (`test -L <dir>`).

### 2. Check the version
Fastest path — let the installer do it (it prints installed vs latest and exits):
```
curl -fsSL https://raw.githubusercontent.com/maclevison/glaise/main/install.sh | bash -s -- --check
```
Add `--target opencode` / `--project <dir>` to match the detected target. Or check by hand:
- **installed:** `cat <dir>/VERSION` (absent on installs predating this skill → treat as unknown/old).
- **latest release:** `git ls-remote --tags --refs https://github.com/maclevison/glaise.git 'v*' | awk -F/ '{print $NF}' | sort -V | tail -1` (fallback: `curl -fsSL https://api.github.com/repos/maclevison/glaise/releases/latest`).

Report `installed → latest`. If they match and the user didn't force a ref, say **up to date** and stop.

### 3. Symlink installs — don't re-copy
If `<dir>` is a symlink, the install tracks a clone. Find it with `readlink <dir>`, and update by pulling that clone: `git -C <clone-root> pull --ff-only`. Show the command, confirm, run it, then stop — no installer needed.

### 4. Show the command and confirm
Build the exact command for the detected target and the chosen ref (default = latest release tag from step 2):
```
curl -fsSL https://raw.githubusercontent.com/maclevison/glaise/main/install.sh | bash -s -- --ref <ref>
```
Append `--target opencode` for OpenCode, and `--project <dir>` for a project install (the dir that contains `.claude`/`.opencode`).
**This fetches and runs a script over the network** — always print the full command and wait for an explicit yes before running it.

### 5. Run it, then confirm
Execute the confirmed command. Then re-read `<dir>/VERSION` and report the new version. On failure, show the error and the manual fallback (the same command in a terminal).

## Notes

- **Overwrite:** copy installs replace the installed skills wholesale — local edits to the *installed* copy are lost. The source of truth is the repo; warn if the user has hand-edited the installed skills.
- **Bootstrap:** installs that predate this skill won't have `glaise-update` — the person runs the `install.sh` one-liner once, and every later update is `/glaise-update`.
- **Pinning:** to stay on a fixed version, pass `vX.Y.Z`; to ride the edge, pass `main`.

## Portability

Plain Markdown. Uses only `curl` / `git` / `bash` that the installer already needs — no agent-specific tools, slash commands, or hardcoded paths beyond the public repo URL.
