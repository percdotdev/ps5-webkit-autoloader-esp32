import { state } from "../app/state.js";
import { t } from "../language/language.js";
import { el } from "../ui/dom.js";

// Stable or pre-release. Only shown while a pre-release newer than stable exists.
export function renderChannel(root, onPick) {
  const c = state.channels;
  root.hidden = !c?.pre;
  if (!c?.pre) {
    root.replaceChildren();
    return;
  }
  const option = (id, label) => el("button", {
    type: "button", class: "chan", role: "radio",
    "aria-checked": String(state.channel === id),
    disabled: state.busy,
    onclick: () => onPick(id),
  }, el("b", {}, label), el("small", { translate: "no" }, c[id].tag));
  root.replaceChildren(
    el("div", { class: "chans", role: "radiogroup", "aria-label": t("chLabel") },
      option("stable", t("chStable")), option("pre", t("chPre"))),
    state.channel === "pre" && el("p", { class: "chan-warn" }, t("chWarn")),
  );
}
