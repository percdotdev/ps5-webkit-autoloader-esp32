import { t } from "../language/language.js";
import { el, rich } from "../ui/dom.js";

const DRIVERS = [
  ["CP210x", "https://www.silabs.com/developer-tools/usb-to-uart-bridge-vcp-drivers"],
  ["CH340", "https://www.wch-ic.com/downloads/CH341SER_EXE.html"],
];

// "Board not showing up?": the fixes that solve almost every case, then drivers.
export function helpContent() {
  const [a, b] = DRIVERS.map(([name, href]) => el("a", { href, target: "_blank", rel: "noopener" }, name));
  return [
    el("ul", {}, t("helpItems").map((s) => el("li", { html: rich(s) }))),
    el("p", {}, t("drivers"), " ", a, ", ", b),
  ];
}
