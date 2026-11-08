import { state } from "../app/state.js";
import { t } from "../language/language.js";
import { logLine } from "../log/log.js";
import { fmtBytes } from "../ui/format.js";
import { checkImage } from "./image.js";

const $ = (id) => document.getElementById(id);

async function take(file, render) {
  if (!file || state.busy) return;
  const data = new Uint8Array(await file.arrayBuffer());
  try {
    checkImage(data);
  } catch (err) {
    logLine(err.message, "bad");
    return;
  }
  state.localFile = { name: file.name, data };
  render();
}

export function renderFileDrop() {
  const f = state.localFile;
  $("drop").dataset.loaded = String(Boolean(f));
  $("drop-title").textContent = f ? f.name : t("drop");
  $("drop-hint").textContent = f ? fmtBytes(f.data.byteLength) : t("dropHint");
  $("file").disabled = state.busy;
  $("file-clear").hidden = !f;
  $("file-clear").textContent = t("remove");
}

export function wireFileDrop(render) {
  const drop = $("drop");
  const input = $("file");
  const over = (on) => { drop.dataset.over = String(on); };

  input.addEventListener("change", () => {
    take(input.files[0], render);
    input.value = "";
  });
  $("file-clear").addEventListener("click", (e) => {
    e.preventDefault();
    state.localFile = null;
    render();
  });
  drop.addEventListener("dragover", (e) => { e.preventDefault(); over(true); });
  drop.addEventListener("dragleave", () => over(false));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    over(false);
    take(e.dataTransfer.files[0], render);
  });
}
