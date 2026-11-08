const API = "https://api.github.com/repos/percdotdev/ps5-webkit-autoloader-esp32/releases/latest";
const KEY = "release:v1";

// GitHub allows 60 anonymous calls an hour, so reuse one answer per tab.
export async function loadRelease() {
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

// "itsPLK 0.7.1(f4fab6b)" -> "itsPLK 0.7.1 (f4fab6b)"
export function payloadLabel(name) {
  return String(name || "").replace(/\s*\(/, " (").trim();
}
