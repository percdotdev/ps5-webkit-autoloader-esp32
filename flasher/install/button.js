import { state } from "../app/state.js";
import { serialOk } from "../device/session.js";
import { t } from "../language/language.js";

function label() {
  if (state.busy) return t("installing");
  if (state.localFile) return t("installFile");
  const ver = state.release?.tag ? ` ${state.release.tag}` : "";
  return `${t("install")}${ver}`;
}

export function renderInstall() {
  const go = document.getElementById("install");
  go.textContent = label();
  go.disabled = !serialOk || state.busy;
  document.getElementById("erase").disabled = state.busy;
}
