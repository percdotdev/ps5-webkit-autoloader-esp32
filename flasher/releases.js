// Release check: what payload is baked into this installer, what upstream
// itsPLK ships today, and where the release notes are.

const CACHE_KEY = "release-check-v1";
const TTL = 30 * 60 * 1000;

let cached = null;
let pending = null;

function signal(ms) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function getJson(url) {
  const res = await fetch(url, {
    signal: signal(8000),
    cache: "no-store",
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`${url} (${res.status})`);
  return res.json();
}

function summary(release) {
  return {
    tag: release.tag_name || "",
    name: release.name || release.tag_name || "",
    url: release.html_url || "",
    published: release.published_at || "",
  };
}

export function normalize(version) {
  return String(version || "").replace(/^v/i, "").split("-")[0].trim();
}

export function compare(a, b) {
  const left = normalize(a).split(".").map((n) => Number(n) || 0);
  const right = normalize(b).split(".").map((n) => Number(n) || 0);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff) return diff;
  }
  return 0;
}

export async function getReleaseInfo() {
  if (cached) return cached;
  if (pending) return pending;

  pending = (async () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (stored && Date.now() - stored.at < TTL) {
        cached = stored.data;
        return cached;
      }
    } catch { /* ignore a broken cache entry */ }

    const data = { bundled: null, upstream: null, ours: null };

    const bundled = fetch("./payload.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);

    const [upstream, ours] = await Promise.allSettled([
      getJson("https://api.github.com/repos/itsPLK/ps5-webkit-autoloader/releases/latest"),
      getJson("https://api.github.com/repos/percdotdev/ps5-webkit-autoloader-esp32/releases/latest"),
    ]);

    data.bundled = await bundled;
    if (upstream.status === "fulfilled") data.upstream = summary(upstream.value);
    if (ours.status === "fulfilled") data.ours = summary(ours.value);

    if (data.bundled || data.upstream || data.ours) {
      cached = data;
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
      } catch { /* private mode */ }
    }
    return data;
  })().finally(() => { pending = null; });

  return pending;
}
