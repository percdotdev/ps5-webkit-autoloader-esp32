import { state } from "../app/state.js";

// The pages workflow writes bin/channels.json next to the images:
//   { "stable": { tag, name, date, url }, "pre": { ... } | null }
// pre is only set while the newest pre-release is newer than stable.
const CHANNELS = "bin/channels.json";
const API = "https://api.github.com/repos/percdotdev/ps5-webkit-autoloader-esp32/releases/latest";
const KEY = "release:v1";

function pickFields(j) {
  return j?.tag ? { tag: j.tag, name: j.name, date: j.date, url: j.url } : null;
}

// Fallback for a local preview without channels.json: stable only, from the API.
// GitHub allows 60 anonymous calls an hour, so reuse one answer per tab.
async function loadLatest() {
  try {
    const hit = sessionStorage.getItem(KEY);
    if (hit) return JSON.parse(hit);
  } catch { /* storage blocked */ }
  try {
    const res = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) return null;
    const j = await res.json();
    const rel = { tag: j.tag_name, name: j.name, date: j.published_at, url: j.html_url };
    try { sessionStorage.setItem(KEY, JSON.stringify(rel)); } catch { /* storage blocked */ }
    return rel;
  } catch {
    return null;
  }
}

export async function loadChannels() {
  try {
    const res = await fetch(`${CHANNELS}?v=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      const stable = pickFields(j?.stable);
      if (stable) return { stable, pre: pickFields(j?.pre) };
    }
  } catch { /* missing or not JSON */ }
  const stable = await loadLatest();
  return stable ? { stable, pre: null } : null;
}

// The release the Install button writes: undefined while loading, null when unknown.
export function selected() {
  const c = state.channels;
  if (c === undefined) return undefined;
  return c?.[state.channel] ?? c?.stable ?? null;
}

// "itsPLK 0.7.1(f4fab6b)" -> "itsPLK 0.7.1 (f4fab6b)"
export function payloadLabel(name) {
  return String(name || "").replace(/\s*\(/, " (").trim();
}
