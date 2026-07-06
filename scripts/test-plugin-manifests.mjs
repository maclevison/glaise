#!/usr/bin/env node
// Validates the plugin + marketplace manifests. Zero deps. Run: node scripts/test-plugin-manifests.mjs
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

let failed = 0;
const ok = (name, cond) => { console.log(`${cond ? "✓" : "✗"} ${name}`); if (!cond) failed++; };

function readJson(path) {
  try { return { json: JSON.parse(readFileSync(path, "utf8")), err: null }; }
  catch (e) { return { json: null, err: e }; }
}

// --- plugin.json ---
const p = readJson(".claude-plugin/plugin.json");
ok("plugin.json is valid JSON", p.err === null);
const plugin = p.json || {};
ok("plugin.name === 'glaise'", plugin.name === "glaise");
ok("plugin.version is a bare semver", /^\d+\.\d+\.\d+$/.test(plugin.version || ""));
ok("plugin.hooks === './hooks/hooks.json'", plugin.hooks === "./hooks/hooks.json");
ok("plugin declares NO skills field (auto-discovered)", !("skills" in plugin));

// --- marketplace.json ---
const m = readJson(".claude-plugin/marketplace.json");
ok("marketplace.json is valid JSON", m.err === null);
const mkt = m.json || {};
ok("marketplace.name is a non-empty string", typeof mkt.name === "string" && mkt.name.length > 0);
ok("marketplace.owner.name is present", !!(mkt.owner && mkt.owner.name));
ok("marketplace.plugins is a non-empty array", Array.isArray(mkt.plugins) && mkt.plugins.length === 1);
const entry = (mkt.plugins && mkt.plugins[0]) || {};
ok("plugin entry name === 'glaise'", entry.name === "glaise");
ok("plugin entry source === './'", entry.source === "./");
ok("plugin entry is metadata-only (no skills field)", !("skills" in entry));
ok("plugin entry is metadata-only (no hooks field)", !("hooks" in entry));

// --- version invariant: plugin.json === marketplace entry === git tag (bare) ---
ok("plugin.json version === marketplace entry version", plugin.version === entry.version);
// Version invariant enforced only on release commits: if HEAD is tagged vX.Y.Z,
// the manifest version must match it. Non-release commits skip cleanly (avoids a
// false failure during the bump-before-tag window). No tag / no git → skip.
let tag = null;
try {
  tag = execFileSync("git", ["tag", "--points-at", "HEAD"], { encoding: "utf8" })
    .split("\n").map((s) => s.trim()).find((s) => /^v?\d+\.\d+\.\d+$/.test(s)) || null;
} catch { /* not a repo / no git — skip */ }
if (tag) {
  const bare = tag.replace(/^v/, "");
  ok(`manifest version matches the release tag on HEAD (${tag})`, plugin.version === bare);
} else {
  console.log("• skipped release-tag version check (HEAD is not a release commit)");
}

process.exit(failed ? 1 : 0);
