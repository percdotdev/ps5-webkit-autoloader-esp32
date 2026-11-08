import { t } from "../language/language.js";
import { el, rich } from "../ui/dom.js";

const DRIVERS = [
  ["CP210x", "https://www.silabs.com/developer-tools/usb-to-uart-bridge-vcp-drivers"],
  ["CH340", "https://www.wch-ic.com/downloads/CH341SER_EXE.html"],
];

// Step 2: put the board in download mode, plus help when it does not show up.
export function renderPrepare(root) {
  const [a, b] = DRIVERS.map(([name, href]) => el("a", { href, target: "_blank", rel: "noopener" }, name));
  root.replaceChildren(
    el("ol", { class: "prep" }, t("prepItems").map((s) => el("li", {}, el("span", { html: rich(s) })))),
    el("details", { class: "more" },
      el("summary", {}, t("help")),
      el("ul", { class: "help-list" }, t("helpItems").map((s) => el("li", { html: rich(s) }))),
      el("p", { class: "help-drivers" }, t("drivers"), " ", a, ", ", b),
    ),
  );
}
