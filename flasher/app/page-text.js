import { t } from "../language/language.js";
import { state } from "./state.js";

// Static copy in index.html: element id -> string key.
const TEXT = {
  "skip": "skip",
  "open-adv": "adv",
  "adv-title": "adv",
  "ver-title": "verTitle",
  "board-title": "boardTitle",
  "board-hint": "boardHint",
  "write-title": "writeOpts",
  "erase-label": "erase",
  "erase-hint": "eraseHint",
  "logs-title": "logs",
  "copy-log": "copy",
  "foot-note": "footNote",
  "foot-src": "source",
};

export function renderPageText() {
  document.documentElement.lang = state.lang;
  for (const [id, key] of Object.entries(TEXT)) {
    document.getElementById(id).textContent = t(key);
  }
  document.getElementById("close-adv").setAttribute("aria-label", t("close"));
  document.title = t("pageTitle");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta"));
}
