import { session, serialOk, dropSession } from "../device/session.js";
import { renderStage } from "../device/stage.js";
import { renderPrepare } from "../device/prepare.js";
import { renderSteps, goTo, advance } from "../steps/stepper.js";
import { renderBoards, renderRelease } from "../firmware/picker.js";
import { renderFileDrop, wireFileDrop } from "../firmware/file-drop.js";
import { loadRelease } from "../firmware/release.js";
import { renderGuide } from "../guide/guide.js";
import { renderInstall } from "../install/button.js";
import { createFlow } from "../install/flow.js";
import { t } from "../language/language.js";
import { copyLog } from "../log/log.js";
import { ICON } from "../ui/icons.js";
import { renderPageText } from "./page-text.js";
import { state } from "./state.js";
import { toggleTheme } from "./theme.js";
import { renderTopbar } from "./topbar.js";
import { showStars } from "./stars.js";
import { readUrl, writeUrl } from "./url.js";

const $ = (id) => document.getElementById(id);
const flow = createFlow(render);

const deviceActions = {
  disconnect: flow.disconnect,
  async copyLink(e) {
    try {
      await navigator.clipboard.writeText(location.href);
      e.currentTarget.textContent = t("linkCopied");
    } catch { /* clipboard blocked */ }
  },
};

function pickBoard(id) {
  if (state.busy || session.chipName) return;
  state.board = id;
  render();
}

function render() {
  writeUrl();
  renderPageText();
  renderTopbar();
  renderSteps();
  renderStage($("device"), deviceActions);
  renderPrepare($("prepare"));
  renderBoards($("boards"), pickBoard);
  renderRelease($("release"));
  renderInstall();
  renderFileDrop();
  renderGuide($("guide"));
}

function onShortcut(e) {
  if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter" || state.busy || !serialOk) return;
  e.preventDefault();
  if (state.step === 2) flow.install();
}

function wire() {
  document.querySelectorAll("[data-set-lang]").forEach((b) => {
    b.addEventListener("click", () => {
      if (state.busy) return;
      state.lang = b.dataset.setLang;
      render();
    });
  });
  $("theme").addEventListener("click", () => { toggleTheme(); renderTopbar(); });
  $("gh-ic").innerHTML = ICON.github;
  $("drop-icon").innerHTML = ICON.upload;
  $("install").addEventListener("click", flow.install);
  document.querySelectorAll("[data-goto]").forEach((b) => {
    b.addEventListener("click", () => { if (goTo(Number(b.dataset.goto))) render(); });
  });
  $("s0-next").addEventListener("click", () => { advance(); render(); });
  $("s1-next").addEventListener("click", () => { advance(); render(); });
  $("s3-again").addEventListener("click", async () => {
    await flow.disconnect();
    state.phase = "idle";
    state.step = 0;
    state.reached = 0;
    render();
  });
  $("erase").addEventListener("change", (e) => { state.eraseAll = e.target.checked; });
  $("copy-log").addEventListener("click", (e) => { e.preventDefault(); copyLog(e.currentTarget); });
  wireFileDrop(render);

  document.addEventListener("keydown", onShortcut);
  window.addEventListener("beforeunload", (e) => { if (state.busy) e.preventDefault(); });
  window.addEventListener("pagehide", () => { dropSession(); });
  if (serialOk) navigator.serial.addEventListener("disconnect", (e) => flow.lost(e.target));
}

readUrl();
wire();
render();
showStars($("gh"), state.lang);
loadRelease().then((rel) => {
  state.release = rel;
  render();
});
