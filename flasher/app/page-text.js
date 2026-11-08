import { t } from "../language/language.js";
import { state } from "./state.js";

// Static copy in index.html: element id -> string key.
const TEXT = {
  "skip": "skip",
  "title": "title",
  "lead": "lead",
  "s0-title": "s0Title",
  "s0-lead": "s0Lead",
  "s0-next": "s0Next",
  "s1-title": "s1Title",
  "s1-lead": "s1Lead",
  "s1-next": "s1Next",
  "s2-title": "s2Title",
  "more-title": "more",
  "s3-again": "again",
  "erase-label": "erase",
  "erase-hint": "eraseHint",
  "or-file": "orFile",
  "logs-title": "logs",
  "copy-log": "copy",
  "guide-title": "guide",
  "foot-note": "footNote",
  "foot-src": "source",
  "foot-rel": "releases",
};

export function renderPageText() {
  document.documentElement.lang = state.lang;
  for (const [id, key] of Object.entries(TEXT)) {
    document.getElementById(id).textContent = t(key);
  }
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta"));
}
