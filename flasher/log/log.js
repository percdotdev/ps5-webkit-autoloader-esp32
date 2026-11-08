import { t } from "../language/language.js";
import { el } from "../ui/dom.js";
import { formatLine } from "./format-line.js";

let startedAt = 0;
let lines = [];

function stamp() {
  const s = Math.max(0, Math.floor((Date.now() - (startedAt || Date.now())) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function clearLog() {
  startedAt = Date.now();
  lines = [];
  document.getElementById("log")?.replaceChildren();
}

// kind: "" | "hi" (worth reading) | "bad" (error)
export function logLine(raw, kind) {
  const row = formatLine(raw);
  if (!row) return;
  const time = stamp();
  lines.push(`${time}  ${row.text}`);
  const box = document.getElementById("log");
  if (!box) return;
  const k = kind || row.kind || "";
  box.append(el("div", { class: `log-row ${k}`.trim() }, el("time", {}, time), el("span", {}, row.text)));
  box.scrollTop = box.scrollHeight;
}

export async function copyLog(btn) {
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    btn.textContent = t("copied");
  } catch {
    btn.textContent = t("copyFail");
  }
  setTimeout(() => { btn.textContent = t("copy"); }, 1400);
}
