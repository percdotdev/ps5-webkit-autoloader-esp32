export function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2).toLowerCase(), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) {
    if (c == null || c === false) continue;
    n.append(c instanceof Node ? c : String(c));
  }
  return n;
}

function esc(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

// Copy text with a few product words styled.
export function rich(text) {
  return esc(text)
    .replaceAll("ESP32_PORTAL", "<code translate=\"no\">ESP32_PORTAL</code>")
    .replaceAll("12345678", "<code translate=\"no\">12345678</code>")
    .replaceAll("BOOT", "<kbd>BOOT</kbd>")
    .replaceAll("autoload.txt", "<code translate=\"no\">autoload.txt</code>");
}
