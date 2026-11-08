const API = "https://api.github.com/repos/percdotdev/ps5-webkit-autoloader-esp32";
const KEY = "stars:v1";

// GitHub allows 60 anonymous calls an hour, so ask once per tab.
async function loadStars() {
  try {
    const hit = sessionStorage.getItem(KEY);
    if (hit !== null) return Number(hit);
  } catch { /* storage blocked */ }
  try {
    const res = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) return null;
    const n = (await res.json()).stargazers_count;
    try { sessionStorage.setItem(KEY, String(n)); } catch { /* storage blocked */ }
    return n;
  } catch {
    return null;
  }
}

function compact(n, lang) {
  try {
    return new Intl.NumberFormat(lang, { notation: "compact", maximumFractionDigits: 1 }).format(n);
  } catch {
    return String(n);
  }
}

// Fills the count next to the GitHub icon; leaves the icon alone when GitHub is unreachable.
export async function showStars(link, lang) {
  const n = await loadStars();
  if (n == null) return;
  const count = link.querySelector(".gh-count") || link.appendChild(document.createElement("span"));
  count.className = "gh-count";
  count.textContent = compact(n, lang);
  link.setAttribute("aria-label", `GitHub, ${n} stars`);
}
