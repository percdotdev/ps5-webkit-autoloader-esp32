import { state } from "../app/state.js";
import { CHIP_OF } from "../firmware/catalog.js";
import { t } from "../language/language.js";
import { el, rich } from "../ui/dom.js";
import { session, serialOk } from "./session.js";
import { boardArt } from "./board-art.js";

const DRIVERS = [
  ["CP210x", "https://www.silabs.com/developer-tools/usb-to-uart-bridge-vcp-drivers"],
  ["CH340", "https://www.wch-ic.com/downloads/CH341SER_EXE.html"],
];

// Which face the panel shows: { key, title, body }.
function view() {
  if (!serialOk) return { key: "unsupported", title: t("devUnsupported"), body: t("devUnsupportedBody") };
  const p = state.phase;
  if (p === "connecting") return { key: p, title: t("devConnecting"), body: t("devConnectingBody") };
  if (p === "done") return { key: p, title: t("devDone"), body: t("devDoneBody") };
  if (p === "error") return { key: p, title: t("devError"), body: t("devErrorBody") };
  if (p === "connected" || p === "installing") return { key: "connected", title: session.chipName, body: "" };
  return { key: "idle", title: t("devIdle"), body: t("devIdleBody") };
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

function help() {
  const [a, b] = DRIVERS.map(([name, href]) => el("a", { href, target: "_blank", rel: "noopener" }, name));
  return el("details", { class: "help" },
    el("summary", {}, t("help")),
    el("ul", {}, t("helpItems").map((s) => el("li", { html: rich(s) }))),
    el("p", {}, t("drivers"), " ", a, " · ", b),
  );
}

function action(key, actions) {
  if (key === "unsupported") {
    return el("button", { type: "button", class: "btn", onclick: actions.copyLink }, t("copyLink"));
  }
  if (key === "connected") {
    return el("button", { type: "button", class: "btn ghost", onclick: actions.disconnect, disabled: state.busy }, t("disconnect"));
  }
  if (key === "done") {
    return el("button", { type: "button", class: "btn ghost", onclick: actions.reset }, t("again"));
  }
  return el("button", { type: "button", class: "btn", onclick: actions.connect, disabled: state.busy },
    key === "error" ? t("retry") : t("connect"),
    el("kbd", { class: "hint" }, "Ctrl ⏎"));
}

export function renderDevice(root, actions) {
  const v = view();
  const live = v.key === "connected";
  root.dataset.state = v.key;
  const parts = [
    el("div", { class: "device-art", html: boardArt(session.chipName || CHIP_OF[state.board]) }),
    el("h2", { class: "device-title", id: "dev-title", translate: live ? "no" : null }, v.title),
    v.body && el("p", { class: "device-body", html: rich(v.body) }),
    live && facts(),
    el("div", { class: "device-actions" }, action(v.key, actions)),
    (v.key === "idle" || v.key === "error") && help(),
  ];
  root.replaceChildren(...parts.filter(Boolean));
}
