import { session, serialOk } from "../device/session.js";
import { t } from "../language/language.js";
import { ICON } from "../ui/icons.js";
import { state } from "./state.js";
import { currentTheme } from "./theme.js";

export function renderTopbar() {
  const key = serialOk ? state.phase : "unsupported";
  const pill = document.getElementById("pill");
  pill.dataset.state = key;
  document.getElementById("pill-text").textContent =
    key === "connected" && session.chipName ? session.chipName : t("pill")[key];

  document.querySelectorAll("[data-set-lang]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.setLang === state.lang));
    b.disabled = state.busy;
  });
  document.getElementById("theme").innerHTML = currentTheme() === "dark" ? ICON.sun : ICON.moon;
}
