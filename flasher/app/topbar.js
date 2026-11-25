import { t } from "../language/language.js";
import { ICON } from "../ui/icons.js";
import { state } from "./state.js";
import { currentTheme } from "./theme.js";

export function renderTopbar() {
  document.querySelectorAll("[data-set-lang]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.setLang === state.lang));
    b.disabled = state.busy;
  });
  const theme = document.getElementById("theme");
  theme.innerHTML = currentTheme() === "dark" ? ICON.sun : ICON.moon;
  theme.setAttribute("aria-label", t("theme"));
}
