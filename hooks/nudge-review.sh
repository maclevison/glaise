#!/usr/bin/env bash
# Glaise review nudge — a soft, once-per-session Stop hook.
# Detects an uncommitted UI git-diff and re-wakes the model (asyncRewake) to run
# the glaise-review skill. It NEVER runs the review itself. Fail-open everywhere:
# a nudge is never worth breaking a turn.
#
# Contract (pinned from hooks.md + security-guidance): exit 2 = re-wake, exit 0 = quiet;
# the model-facing body goes to stderr; stdout carries an optional JSON telemetry line.
set -u

# UI file extensions + paths that count as "UI changed" (tune here only).
UI_RE='\.(tsx|jsx|vue|svelte|astro|css|scss|html|mdx)$|(^|/)docs/glaise/'

# --- read stdin JSON (single scalar fields only; zero-dependency) ---
input="$(cat)"
str_field()  { printf '%s' "$input" | grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed 's/.*:[[:space:]]*"\(.*\)"$/\1/'; }
bool_field() { printf '%s' "$input" | grep -oE "\"$1\"[[:space:]]*:[[:space:]]*(true|false)" | head -1 | grep -oE 'true|false'; }

stop_hook_active="$(bool_field stop_hook_active)"
session_id="$(str_field session_id)"
cwd="$(str_field cwd)"

# 1. Recursion guard (primary): CC sets this while an async Stop is in flight.
[ "$stop_hook_active" = "true" ] && exit 0

# 2. Once-per-session dedupe.
data_dir="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}}"
sid_safe="$(printf '%s' "${session_id:-default}" | tr -c 'A-Za-z0-9._-' '_')"
marker="$data_dir/glaise-nudge-$sid_safe"
[ -f "$marker" ] && exit 0

# 3. Git scope.
[ -n "$cwd" ] || exit 0
git -C "$cwd" rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# 3b. Glaise-project scope: only nudge inside a Glaise project (has docs/glaise/).
# Checked on disk so it works even where docs/ is gitignored. Tune the marker here.
[ -d "$cwd/docs/glaise" ] || exit 0

# 4. UI scope: staged + unstaged + untracked, filtered by the UI regex.
changed="$(
  {
    git -C "$cwd" diff --name-only 2>/dev/null
    git -C "$cwd" diff --cached --name-only 2>/dev/null
    git -C "$cwd" ls-files --others --exclude-standard 2>/dev/null
  } | grep -Ei "$UI_RE" | sort -u
)"
[ -n "$changed" ] || exit 0

# 5. Nudge (re-wake). Write the marker BEFORE exiting so re-entry can't re-fire.
mkdir -p "$data_dir" 2>/dev/null || true
: > "$marker" 2>/dev/null || true

# Model-facing body on stderr (short instruction + the changed-file list).
{
  printf 'Glaise: UI files changed this session:\n'
  printf '%s\n' "$changed" | sed 's/^/  - /'
  printf '\nBefore finalizing, run the glaise-review skill (craft, family conformance, soul). '
  printf 'If this was a trivial change (typo, copy, config), you may finalize without running it.\n'
} >&2

# Optional telemetry line on stdout.
count="$(printf '%s\n' "$changed" | grep -c .)"
printf '{"metrics":{"findings":%s},"rewakeSummary":"Glaise review nudge — UI changed"}\n' "$count"

exit 2
