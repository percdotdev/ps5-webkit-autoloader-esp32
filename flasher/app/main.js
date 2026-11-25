import { wireSheet, openSheet } from "../advanced/sheet.js";
import { session, serialOk, dropSession } from "../device/session.js";
import { renderBoards, renderRelease } from "../firmware/picker.js";
import { CHIP_OF } from "../firmware/catalog.js";
import { renderFileDrop, wireFileDrop } from "../firmware/file-drop.js";
import { renderChannel } from "../firmware/channel.js";
import { loadChannels } from "../firmware/release.js";
import { helpContent } from "../install/help.js";
import { createFlow } from "../install/flow.js";
import { t } from "../language/language.js";
import { copyLog } from "../log/log.js";
import { ICON } from "../ui/icons.js";
import { VIEWS } from "../wizard/steps.js";
import { renderWizard, toggleExtra, closeExtra } from "../wizard/wizard.js";
import { renderPageText } from "./page-text.js";
import { state } from "./state.js";
import { toggleTheme } from "./theme.js";
import { renderTopbar } from "./topbar.js";
import { showStars } from "./stars.js";
import { readUrl, writeUrl } from "./url.js";

const $ = (id) => document.getElementById(id);
const flow = createFlow(render);

function goView(delta) {
  const i = VIEWS.indexOf(state.view) + delta;
  if (state.busy || i < 2 || i >= VIEWS.length) return;
  state.view = VIEWS[i];
  closeExtra();
  render();
}

// What the buttons on each screen do (see wizard/steps.js).
const go = {
  install: () => { closeExtra(); flow.install(); },
  next: () => goView(1),
  back: () => goView(-1),
  again: () => { closeExtra(); flow.reset(); },
  help: () => toggleExtra(helpContent()),
  log: () => openSheet(),
  async copyLink(e) {
    try {
      await navigator.clipboard.writeText(location.href);
      e.currentTarget.textContent = t("linkCopied");
    } catch { /* clipboard blocked */ }
  },
};

function pickBoard(id) {
  if (state.busy || (session.chip && CHIP_OF[id] !== session.chip)) return;
  state.board = id;
  render();
}

function pickChannel(id) {
  if (state.busy) return;
  state.channel = id;
  render();
}

function render() {
  writeUrl();
  renderPageText();
  renderTopbar();
  renderWizard(go);
  renderBoards($("boards"), pickBoard);
  renderChannel($("channel"), pickChannel);
  renderRelease($("release"));
  renderFileDrop();
  $("erase").disabled = state.busy;
}

function onShortcut(e) {
  if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter" || state.busy || !serialOk) return;
  if (state.view !== "plug" && state.phase !== "error") return;
  e.preventDefault();
  go.install();
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
  $("erase").addEventListener("change", (e) => { state.eraseAll = e.target.checked; render(); });
  $("copy-log").addEventListener("click", (e) => { e.preventDefault(); copyLog(e.currentTarget); });
  wireFileDrop(render);
  wireSheet();

  document.addEventListener("keydown", onShortcut);
  window.addEventListener("beforeunload", (e) => { if (state.busy) e.preventDefault(); });
  window.addEventListener("pagehide", () => { dropSession(); });
  if (serialOk) navigator.serial.addEventListener("disconnect", (e) => flow.lost(e.target));
}

readUrl();
wire();
render();
showStars($("gh"), state.lang);
loadChannels().then((channels) => {
  state.channels = channels;
  if (!channels?.pre) state.channel = "stable";
  render();
});
