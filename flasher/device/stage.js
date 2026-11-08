import { state } from "../app/state.js";
import { boardArt } from "../boards/art.js";
import { BOARD_NAME } from "../firmware/catalog.js";
import { t } from "../language/language.js";
import { el, rich } from "../ui/dom.js";
import { session, serialOk } from "./session.js";

// What the drawing acts out, from the open step and the connection phase.
function scene() {
  if (!serialOk) return "pick";
  if (state.step === 0) return "pick";
  if (state.step === 1) return "prepare";
  if (state.step === 3) return "portal";
  const p = state.phase;
  if (p === "installing") return "writing";
  if (p === "connecting" || p === "connected" || p === "done" || p === "error") return p;
  return "plugged";
}

function caption(key) {
  if (!serialOk) return [t("devUnsupported"), t("devUnsupportedBody")];
  if (key === "pick") return [BOARD_NAME[state.board], t("capPick")];
  if (key === "connected" || key === "writing") return [session.chipName || BOARD_NAME[state.board], t(key === "writing" ? "capWriting" : "capConnected")];
  return [t(`cap_${key}_title`), t(`cap_${key}`)];
}

function facts() {
  const rows = [
    [t("rowChip"), session.chipDesc || session.chipName],
    [t("rowMac"), session.mac],
    [t("rowUsb"), session.nativeUsb ? t("usbNative") : t("usbBridge")],
  ].filter(([, v]) => v);
  return el("dl", { class: "facts" },
    rows.map(([k, v]) => el("div", {}, el("dt", {}, k), el("dd", { translate: "no" }, v))));
}

export function renderStage(root, actions) {
  const key = scene();
  root.dataset.scene = key;

  // Redraw the board only when it changes, so running animations keep going.
  let art = root.querySelector(".stage-art");
  if (!art || art.dataset.board !== state.board) {
    art = el("div", { class: "stage-art", "data-board": state.board, html: boardArt(state.board) });
    root.querySelector(".stage-art")?.remove();
    root.prepend(art);
  }

  const [title, body] = caption(key);
  const live = key === "connected" || key === "writing";
  const action = !serialOk
    ? el("button", { type: "button", class: "btn ghost", onclick: actions.copyLink }, t("copyLink"))
    : key === "connected" && !state.busy
      ? el("button", { type: "button", class: "btn ghost sm", onclick: actions.disconnect }, t("disconnect"))
      : null;

  const info = el("div", { class: "stage-info" },
    el("h2", { class: "stage-title", id: "dev-title", translate: live ? "no" : null }, title),
    el("p", { class: "stage-body", html: rich(body) }),
    live && facts(),
    action,
  );
  root.querySelector(".stage-info")?.remove();
  root.append(info);
}
