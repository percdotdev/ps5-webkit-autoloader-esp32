import { t } from "../language/language.js";
import { state } from "./state.js";

// Static copy in index.html: element id -> string key.
const TEXT = {
  "skip": "skip",
  "title": "title",
  "lead": "lead",
  "fw-title": "fw",
  "install-title": "installTitle",
  "erase-label": "erase",
  "erase-hint": "eraseHint",
  "or-file": "orFile",
  "logs-title": "logs",
  "copy-log": "copy",
  "guide-title": "guide",
  "foot-note": "footNote",
  "foot-src": "source",
  "foot-rel": "releases",
  "foot-photos": "footPhotos",
};

export function renderPageText() {
  document.documentElement.lang = state.lang;
  for (const [id, key] of Object.entries(TEXT)) {
    document.getElementById(id).textContent = t(key);
  }
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta"));
}
