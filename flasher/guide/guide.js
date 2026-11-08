import { t } from "../language/language.js";
import { el, rich } from "../ui/dom.js";

function group(title, items) {
  return el("section", { class: "g-step" },
    el("h3", {}, title),
    el("ol", {}, items.map((s) => el("li", {}, el("span", { html: rich(s) })))),
  );
}

// What to do on the PS5 once the board is flashed.
export function renderGuide(root) {
  root.replaceChildren(
    group(t("gWifi"), t("gWifiItems")),
    group(t("gGuide"), t("gGuideItems")),
    el("p", { class: "g-note", html: rich(t("gNote")) }),
  );
}
