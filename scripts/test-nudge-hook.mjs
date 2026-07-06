#!/usr/bin/env node
// Drives hooks/nudge-review.sh with fake Stop stdin. Zero deps. Run: node scripts/test-nudge-hook.mjs
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const HOOK = "hooks/nudge-review.sh";
let failed = 0;
const ok = (name, cond) => { console.log(`${cond ? "✓" : "✗"} ${name}`); if (!cond) failed++; };

// Run the hook with a JSON stdin payload and an isolated CLAUDE_PLUGIN_DATA dir.
function runHook(payload, dataDir) {
  const env = { ...process.env, CLAUDE_PLUGIN_DATA: dataDir };
  try {
    const stdout = execFileSync("bash", [HOOK], { input: JSON.stringify(payload), env, encoding: "utf8" });
    return { code: 0, stdout, stderr: "" };
  } catch (e) {
    return { code: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

// Make a throwaway git repo; optionally mark it as a Glaise project (docs/glaise/)
// and optionally leave an uncommitted UI file in it.
function makeRepo({ withUiChange, glaise = true }) {
  const dir = mkdtempSync(join(tmpdir(), "gnudge-repo-"));
  execFileSync("git", ["init", "-q"], { cwd: dir });
  execFileSync("git", ["config", "user.email", "t@t.t"], { cwd: dir });
  execFileSync("git", ["config", "user.name", "t"], { cwd: dir });
  writeFileSync(join(dir, "README.md"), "seed\n");
  if (glaise) { mkdirSync(join(dir, "docs", "glaise"), { recursive: true }); writeFileSync(join(dir, "docs", "glaise", "glaise-brief.md"), "# brief\n"); }
  execFileSync("git", ["add", "."], { cwd: dir });
  execFileSync("git", ["commit", "-qm", "seed"], { cwd: dir });
  if (withUiChange) writeFileSync(join(dir, "App.tsx"), "export const A = () => null;\n"); // untracked UI file
  return dir;
}
const newDataDir = () => mkdtempSync(join(tmpdir(), "gnudge-data-"));
const cleanup = (...dirs) => dirs.forEach((d) => rmSync(d, { recursive: true, force: true }));

// 1. stop_hook_active:true → quiet (recursion guard, checked first).
{
  const data = newDataDir(), repo = makeRepo({ withUiChange: true });
  const r = runHook({ hook_event_name: "Stop", session_id: "s1", cwd: repo, stop_hook_active: true }, data);
  ok("stop_hook_active=true → exit 0", r.code === 0);
  ok("stop_hook_active=true → no marker written", readdirSync(data).length === 0);
  cleanup(data, repo);
}

// 2. cwd not a git repo → quiet.
{
  const data = newDataDir(), notRepo = mkdtempSync(join(tmpdir(), "gnudge-plain-"));
  const r = runHook({ hook_event_name: "Stop", session_id: "s2", cwd: notRepo, stop_hook_active: false }, data);
  ok("non-git cwd → exit 0", r.code === 0);
  cleanup(data, notRepo);
}

// 3. git repo, no UI change → quiet.
{
  const data = newDataDir(), repo = makeRepo({ withUiChange: false });
  const r = runHook({ hook_event_name: "Stop", session_id: "s3", cwd: repo, stop_hook_active: false }, data);
  ok("no UI diff → exit 0", r.code === 0);
  cleanup(data, repo);
}

// 3b. non-Glaise project (no docs/glaise/), UI change → quiet (project-scope gate).
{
  const data = newDataDir(), repo = makeRepo({ withUiChange: true, glaise: false });
  const r = runHook({ hook_event_name: "Stop", session_id: "s3b", cwd: repo, stop_hook_active: false }, data);
  ok("UI diff but not a Glaise project → exit 0", r.code === 0);
  cleanup(data, repo);
}

// 4. Glaise project, UI change, first fire → re-wake (exit 2), file on stderr, marker created.
{
  const data = newDataDir(), repo = makeRepo({ withUiChange: true });
  const r = runHook({ hook_event_name: "Stop", session_id: "s4", cwd: repo, stop_hook_active: false }, data);
  ok("UI diff, first fire → exit 2", r.code === 2);
  ok("changed file listed on stderr", /App\.tsx/.test(r.stderr));
  ok("nudge instruction on stderr", /glaise-review/.test(r.stderr));
  ok("marker file created for the session", existsSync(join(data, "glaise-nudge-s4")));
  // 5. second fire, same session → quiet (once-per-session dedupe).
  const r2 = runHook({ hook_event_name: "Stop", session_id: "s4", cwd: repo, stop_hook_active: false }, data);
  ok("second fire same session → exit 0", r2.code === 0);
  cleanup(data, repo);
}

// 6. hooks.json is well-formed and wires the Stop hook to our script (durable guard).
{
  let hj = null;
  try { hj = JSON.parse(readFileSync("hooks/hooks.json", "utf8")); } catch { /* stays null */ }
  ok("hooks.json is valid JSON", hj !== null);
  const cmd = hj?.hooks?.Stop?.[0]?.hooks?.[0];
  ok("hooks.json Stop hook command references nudge-review.sh", /nudge-review\.sh/.test(cmd?.command || ""));
  ok("hooks.json Stop hook sets asyncRewake:true", cmd?.asyncRewake === true);
}

process.exit(failed ? 1 : 0);
