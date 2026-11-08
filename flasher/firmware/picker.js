import { state } from "../app/state.js";
import { session } from "../device/session.js";
import { t } from "../language/language.js";
import { el } from "../ui/dom.js";
import { BOARDS } from "./catalog.js";
import { payloadLabel } from "./release.js";

function card(id, onPick, locked) {
  const b = BOARDS[id];
  const on = state.board === id;
  const found = session.imageKey === b.chip;
  const [w, h] = b.size;
  return el("button", {
    type: "button", class: "board plate", role: "radio",
    "aria-checked": String(on),
    disabled: locked && !on,
    onclick: () => onPick(id),
  },
    el("span", { class: "board-photo" },
      el("img", { src: b.photo, width: w, height: h, alt: "", loading: "lazy", decoding: "async" })),
    el("span", { class: "board-cap" },
      el("b", { translate: "no" }, b.name),
      el("span", { class: "code", translate: "no" }, b.chip),
      found && el("span", { class: "board-found" }, t("detected"))),
  );
}

// Once a chip answers, the choice is locked to what was detected.
export function renderBoards(root, onPick) {
  const locked = Boolean(session.chipName) || state.busy;
  root.replaceChildren(...Object.keys(BOARDS).map((id) => card(id, onPick, locked)));
}

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat(state.lang, { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "";
  }
}

function row(label, value) {
  return el("div", {}, el("dt", {}, label), el("dd", { translate: "no" }, value));
}

export function renderRelease(root) {
  const rel = state.release;
  if (rel === undefined) {
    root.replaceChildren(row(t("relVersion"), t("relLoading")));
    return;
  }
  const file = BOARDS[state.board].image;
  const download = el("a", { href: file, download: file.split("/").pop() }, t("download"));
  root.replaceChildren(...[
    row(t("relVersion"), rel?.tag || t("relLatest")),
    rel?.date && row(t("relDate"), fmtDate(rel.date)),
    rel?.name && row(t("relPayload"), payloadLabel(rel.name)),
    row(t("relFile"), download),
  ].filter(Boolean));
}
