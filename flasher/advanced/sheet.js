import { ICON } from "../ui/icons.js";

const $ = (id) => document.getElementById(id);

// The Advanced sheet: a native <dialog>, so Esc, focus and the backdrop come for free.
export function wireSheet() {
  const sheet = $("adv");
  $("close-adv").innerHTML = ICON.close;
  $("open-adv").addEventListener("click", () => sheet.showModal());
  $("close-adv").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
}

export function openSheet() {
  $("adv").showModal();
}
