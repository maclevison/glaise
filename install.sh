#!/usr/bin/env bash
#
# Glaise — installer for the Glaise design-system skills.
#
# Remote (the repo is public — no clone needed):
#   curl -fsSL https://raw.githubusercontent.com/maclevison/glaise/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/maclevison/glaise/main/install.sh | bash -s -- --project ./my-app
#
# Update to a specific release (or check first):
#   curl -fsSL https://raw.githubusercontent.com/maclevison/glaise/main/install.sh | bash -s -- --check
#   curl -fsSL https://raw.githubusercontent.com/maclevison/glaise/main/install.sh | bash -s -- --ref v1.3.0
#   (or, from Claude Code / OpenCode, ask the agent to use the "glaise-update" skill)
#
# From a local clone:
#   ./install.sh                 # installs globally into ~/.claude/skills
#   ./install.sh --project .     # installs into ./.claude/skills
#   ./install.sh --link          # symlink instead of copy (track the clone)
#
# Pick the destination layout with --target (default: claude):
#   ./install.sh --target opencode   # ~/.config/opencode/skills or ./.opencode/skills
#   ./install.sh --target agents     # ~/.agents/skills or ./.agents/skills
#
# Package for claude.ai (web/desktop) — one zip per skill, ready to upload:
#   ./install.sh --zip               # writes ./GlaiseSkills/<skill>.zip
#
# Installs every glaise* skill so it is available to Claude Code and OpenCode.
# Note: OpenCode also reads .claude/skills, so the default target already works there.

set -euo pipefail

REPO="maclevison/glaise"
REF="main"          # branch or tag to fetch in remote mode
MODE="global"       # global | project | zip
TARGET_DIR=""       # project mode target; defaults to the current directory
TARGET="claude"     # destination layout: claude | opencode | agents
USE_LINK=0
CHECK=0             # --check: report installed vs latest, then stop (scope stays global/project)

c_info='\033[0;36m'; c_ok='\033[0;32m'; c_warn='\033[0;33m'; c_err='\033[0;31m'; c_off='\033[0m'
info() { printf "${c_info}›${c_off} %s\n" "$1"; }
ok()   { printf "${c_ok}✓${c_off} %s\n" "$1"; }
warn() { printf "${c_warn}!${c_off} %s\n" "$1" >&2; }
die()  { printf "${c_err}✗${c_off} %s\n" "$1" >&2; exit 1; }

usage() {
  cat <<'EOF'
Glaise installer — installs the glaise* design-system skills.

Usage:
  install.sh [--global | --project [DIR]] [--target NAME] [--link] [--ref REF]

Options:
  --global         Install into the global skills dir (default; available everywhere).
  --project [DIR]  Install into DIR's project skills dir (DIR defaults to the current dir).
  --target NAME    Destination layout: claude (default), opencode, or agents.
                   claude   → ~/.claude/skills          | DIR/.claude/skills
                   opencode → ~/.config/opencode/skills | DIR/.opencode/skills
                   agents   → ~/.agents/skills          | DIR/.agents/skills
                   (OpenCode also reads .claude/skills, so claude works there too.)
  --zip            Package each skill as ./GlaiseSkills/<skill>.zip for claude.ai upload.
  --check          Compare the installed version against the latest release, then stop.
  --link           Symlink the skills instead of copying (local clone only).
  --ref REF        Branch or tag to fetch in remote mode (default: main).
  -h, --help       Show this help.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --global)  MODE="global"; shift ;;
    --project)
      MODE="project"
      if [ $# -ge 2 ] && [ "${2#-}" = "$2" ]; then TARGET_DIR="$2"; shift 2; else shift; fi ;;
    --target)  TARGET="${2:?--target needs a value}"; shift 2 ;;
    --zip)     MODE="zip"; shift ;;
    --check)   CHECK=1; shift ;;
    --link)    USE_LINK=1; shift ;;
    --ref)     REF="${2:?--ref needs a value}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *)         die "unknown option: $1 (try --help)" ;;
  esac
done

# Destination — resolve the skills dir for the chosen target layout (not needed for --zip).
if [ "$MODE" != "zip" ]; then
  case "$TARGET" in
    claude)   GLOBAL_DIR="${HOME}/.claude/skills";          PROJECT_SUBDIR=".claude/skills" ;;
    opencode) GLOBAL_DIR="${HOME}/.config/opencode/skills"; PROJECT_SUBDIR=".opencode/skills" ;;
    agents)   GLOBAL_DIR="${HOME}/.agents/skills";          PROJECT_SUBDIR=".agents/skills" ;;
    *)        die "unknown --target: $TARGET (use claude, opencode, or agents)" ;;
  esac

  if [ "$MODE" = "global" ]; then
    DEST="$GLOBAL_DIR"
  else
    DEST="${TARGET_DIR:-$PWD}/${PROJECT_SUBDIR}"
  fi
fi

# Resolve the latest published release tag (git first — no API rate limit; curl fallback).
latest_release() {
  local tag=""
  if command -v git >/dev/null 2>&1; then
    tag="$(git ls-remote --tags --refs "https://github.com/${REPO}.git" 'v*' 2>/dev/null \
      | awk -F/ '{print $NF}' | sort -V | tail -1)"
  fi
  if [ -z "$tag" ] && command -v curl >/dev/null 2>&1; then
    tag="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" 2>/dev/null \
      | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -1)"
  fi
  printf '%s' "$tag"
}

# --check: compare the installed version marker against the latest release, then stop.
if [ "$CHECK" = "1" ]; then
  installed="not installed"
  if [ -L "$DEST/glaise" ]; then
    installed="symlinked clone ($(readlink "$DEST/glaise" 2>/dev/null)) — 'git pull' there to update"
  elif [ -f "$DEST/glaise/VERSION" ]; then
    installed="$(cat "$DEST/glaise/VERSION")"
  fi
  latest="$(latest_release)"
  [ -n "$latest" ] || die "could not determine the latest release (need network + git or curl)"
  info "Target dir: $DEST"
  info "Installed:  $installed"
  info "Latest:     $latest"
  if [ "$installed" = "$latest" ]; then
    ok "Up to date."
  else
    warn "Update available. Re-run:"
    warn "  curl -fsSL https://raw.githubusercontent.com/${REPO}/main/install.sh | bash -s -- --ref ${latest}"
  fi
  exit 0
fi

# Locate the skills source: a local clone if we're inside one, else download a tarball.
SRC=""
SELF="${BASH_SOURCE[0]:-}"
if [ -n "$SELF" ] && [ -f "$SELF" ]; then
  SCRIPT_DIR="$(cd "$(dirname "$SELF")" && pwd)"
  [ -d "$SCRIPT_DIR/skills" ] && SRC="$SCRIPT_DIR/skills"
fi

if [ -z "$SRC" ]; then
  [ "$USE_LINK" = "1" ] && die "--link needs a local clone; drop it for a remote install"
  command -v curl >/dev/null 2>&1 || die "curl is required for the remote install"
  command -v tar  >/dev/null 2>&1 || die "tar is required for the remote install"
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  info "Downloading ${REPO}@${REF}…"
  curl -fsSL "https://codeload.github.com/${REPO}/tar.gz/refs/heads/${REF}" -o "$TMP/v.tar.gz" 2>/dev/null \
    || curl -fsSL "https://codeload.github.com/${REPO}/tar.gz/refs/tags/${REF}" -o "$TMP/v.tar.gz" 2>/dev/null \
    || die "download failed for ref '${REF}'"
  tar -xzf "$TMP/v.tar.gz" -C "$TMP"
  EXTRACTED="$(find "$TMP" -maxdepth 1 -type d -name "${REPO##*/}-*" | head -1)"
  [ -n "$EXTRACTED" ] && [ -d "$EXTRACTED/skills" ] || die "skills not found in the downloaded archive"
  SRC="$EXTRACTED/skills"
fi

# Version marker to stamp on the install: a tag from the local clone, else the fetched ref.
VERSION_STR="$REF"
if [ -n "${SCRIPT_DIR:-}" ] && command -v git >/dev/null 2>&1 \
   && git -C "$SCRIPT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  VERSION_STR="$(git -C "$SCRIPT_DIR" describe --tags --always 2>/dev/null || printf '%s' "$REF")"
fi

# --zip: package each skill as GlaiseSkills/<skill>.zip for claude.ai upload, then stop.
if [ "$MODE" = "zip" ]; then
  command -v zip >/dev/null 2>&1 || die "zip is required for --zip"
  OUT="$PWD/GlaiseSkills"
  mkdir -p "$OUT"
  count=0
  for d in "$SRC"/glaise*; do
    [ -d "$d" ] || continue
    name="$(basename "$d")"
    rm -f "$OUT/$name.zip"
    ( cd "$SRC" && zip -qr "$OUT/$name.zip" "$name" )
    count=$((count + 1))
    ok "$name.zip"
  done
  [ "$count" -gt 0 ] || die "no glaise* skills found in $SRC"
  echo
  ok "Wrote $count zip(s) → $OUT"
  info "Upload each .zip in claude.ai → Settings → Skills."
  exit 0
fi

# Install every glaise* skill.
mkdir -p "$DEST"
count=0
for d in "$SRC"/glaise*; do
  [ -d "$d" ] || continue
  name="$(basename "$d")"
  rm -rf "$DEST/$name"
  if [ "$USE_LINK" = "1" ]; then
    ln -s "$d" "$DEST/$name"
  else
    cp -R "$d" "$DEST/$name"
  fi
  count=$((count + 1))
  ok "$name"
done
[ "$count" -gt 0 ] || die "no glaise* skills found in $SRC"

# Stamp the installed version (copy installs only; symlinks track the clone's git).
if [ "$USE_LINK" != "1" ] && [ -d "$DEST/glaise" ]; then
  printf '%s\n' "$VERSION_STR" > "$DEST/glaise/VERSION"
fi

echo
ok "Installed $count skill(s) → $DEST  (version: ${VERSION_STR})"
[ "$USE_LINK" = "1" ] && info "Symlinked — pull the clone to update."
info "Run \"$0 --check\" (or ask your agent to use the glaise-update skill) to check for updates."
info "Ask your agent to \"use the glaise skill\" to build product UI."
