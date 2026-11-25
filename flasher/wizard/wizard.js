import { state } from "../app/state.js";
import { renderArt } from "../device/art.js";
import { el, rich } from "../ui/dom.js";
import { VIEWS, step } from "./steps.js";

const $ = (id) => document.getElementById(id);
let shown = "";

function leds() {
  const at = VIEWS.indexOf(state.view);
  $("leds").replaceChildren(...VIEWS.map((_, i) =>
    el("li", { "data-state": i < at ? "done" : i === at ? "now" : "" })));
  $("leds").setAttribute("aria-label", `${at + 1} / ${VIEWS.length}`);
}

function actions(s) {
  const kids = [];
  if (s.primary) {
    kids.push(el("button", { type: "button", class: "btn primary", disabled: state.busy, onclick: s.primary.run }, s.primary.label));
  }
  const links = (s.links || []).map((l) => l.href
    ? el("a", { class: "link", href: l.href, target: "_blank", rel: "noopener" }, l.label)
    : el("button", { type: "button", class: "link", disabled: state.busy, onclick: l.run }, l.label));
  if (links.length) kids.push(el("div", { class: "wiz-links" }, links));
  $("wiz-actions").replaceChildren(...kids);
}

export function renderWizard(go) {
  const s = step(go);
  const wiz = $("wiz");
  wiz.dataset.scene = s.scene;
  renderArt($("art"), state.board);
  leds();
  $("wiz-title").textContent = s.title;
  $("wiz-body").innerHTML = rich(s.body);
  actions(s);
  $("meter").hidden = !(state.phase === "installing" || state.phase === "connecting") || state.view !== "install";

  // Replay the entrance only when the screen itself changes.
  const key = `${state.view}:${s.scene}:${s.title}`;
  if (key !== shown) {
    shown = key;
    wiz.removeAttribute("data-enter");
    void wiz.offsetWidth;
    wiz.setAttribute("data-enter", "");
  }
}

// "Board not showing up?": opens under the button, closes on the next screen.
export function toggleExtra(content) {
  const box = $("wiz-extra");
  const open = box.hidden;
  box.hidden = !open;
  if (open) box.replaceChildren(...content);
}

export function closeExtra() {
  $("wiz-extra").hidden = true;
}
