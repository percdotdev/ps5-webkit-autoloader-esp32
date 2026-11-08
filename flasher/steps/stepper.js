import { state } from "../app/state.js";
import { session } from "../device/session.js";
import { BOARD_NAME } from "../firmware/catalog.js";
import { t } from "../language/language.js";
import { ICON } from "../ui/icons.js";

const LAST_STEP = 3;

// Opens a step the visitor has already reached. Steps ahead stay locked.
export function goTo(i) {
  if (state.busy || i > state.reached || i < 0 || i > LAST_STEP) return false;
  state.step = i;
  return true;
}

export function advance() {
  const next = Math.min(LAST_STEP, state.step + 1);
  state.reached = Math.max(state.reached, next);
  state.step = next;
}

function summary(i) {
  if (i === state.step || i >= state.reached) return "";
  if (i === 0) return BOARD_NAME[state.board];
  if (i === 1) return t("sumReady");
  if (i === 2) return state.phase === "done" ? t("sumInstalled") : session.chipName || "";
  return "";
}

export function renderSteps() {
  document.querySelectorAll("#steps .step").forEach((li) => {
    const i = Number(li.dataset.step);
    const kind = i === state.step ? "open" : i < state.reached ? "done" : i === state.reached ? "ready" : "locked";
    li.dataset.state = kind;
    const head = li.querySelector(".step-head");
    head.setAttribute("aria-expanded", String(i === state.step));
    head.disabled = state.busy || i > state.reached;
    const n = li.querySelector(".step-n");
    if (kind === "done") n.innerHTML = ICON.check;
    else n.textContent = String(i + 1);
    const sum = li.querySelector(".step-sum");
    if (sum) sum.textContent = summary(i);
  });
}
