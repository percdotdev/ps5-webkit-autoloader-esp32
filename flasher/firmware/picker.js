import { state } from "../app/state.js";
import { session } from "../device/session.js";
import { t } from "../language/language.js";
import { el } from "../ui/dom.js";
import { ICON } from "../ui/icons.js";
import { CHIP_OF, IMAGE_OF } from "./catalog.js";
import { payloadLabel } from "./release.js";

// Once a chip answers, the choice is locked to what was detected.
export function renderBoards(root, onPick) {
  const locked = Boolean(session.chipName) || state.busy;
  root.setAttribute("aria-label", t("fw"));
  root.replaceChildren(...Object.keys(CHIP_OF).map((id) => {
    const [name, sub] = t("boards")[id];
    const on = state.board === id;
    return el("button", {
      type: "button", class: "board", role: "radio",
      "aria-checked": String(on),
      disabled: locked && !on,
      onclick: () => onPick(id),
    },
      el("b", { translate: "no" }, name),
      el("small", {}, session.imageKey === CHIP_OF[id] ? t("detected") : sub),
    );
  }));
}

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat(state.lang, { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function renderRelease(root) {
  const rel = state.release;
  if (rel === undefined) {
    root.replaceChildren(el("span", { class: "muted" }, t("relLoading")));
    return;
  }
  const file = IMAGE_OF[CHIP_OF[state.board]];
  const head = rel
    ? el("span", {}, el("b", { translate: "no" }, rel.tag), rel.date && el("span", { class: "muted" }, ` · ${fmtDate(rel.date)}`))
    : el("b", {}, t("relLatest"));
  const sub = rel?.name && el("small", { class: "muted", translate: "no" }, `${t("relPayload")} ${payloadLabel(rel.name)}`);
  const download = el("a", {
    class: "icon-btn", href: file, download: file.split("/").pop(),
    title: t("download"), "aria-label": t("download"), html: ICON.download,
  });
  root.replaceChildren(el("div", { class: "release-tx" }, head, sub), download);
}
