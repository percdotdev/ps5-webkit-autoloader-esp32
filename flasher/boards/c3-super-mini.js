import { INK, pcb, edgePad, chip, smd, crystal, button, usbC, text } from "./parts.js";

// ESP32-C3 Super Mini: black, 18 x 22.5 mm, gold castellated pads, ceramic antenna.
const W = 18, H = 22.5;
const PCB = "#16171a";

const TRACE = "#303239";
// Copper under the solder mask: [what it carries, path, pulse delay in s].
const TRACES = [
  ["usb", "M8.6 18.2 V13.4 L9.6 12.4 V10.7"],
  ["usb", "M9.6 18.2 V13.8 L10.4 13 V10.7", 0.12],
  ["rf", "M10.4 4.1 V3.3 L9.6 2.6"],
  ["io", "M7.2 7.3 L7.3 6.1"],
  ["boot", "M8.6 9.3 L6.4 11.5 V14.5"],
  ["led", "M8.1 8.7 L4.0 12.8"],
  ["io", "M13.7 7.3 H15.8"],
  ["io", "M12.5 9.3 L13.1 9.9 H15.8", 0.2],
  ["io", "M12.4 5.3 L13.1 4.7 H15.8", 0.35],
];
const LEFT = ["21", "20", "10", "9", "8", "7", "6", "5"];
const RIGHT = ["0", "1", "2", "3", "4", "3.3", "G", "5V"];

export const c3SuperMini = {
  w: W, h: H,
  led: [3.9, 13.3],
  boot: [4.9, 16.0],
  usb: { cx: 9, y: 18.3, kind: "c" },
  pcb: pcb(W, H, PCB, 1.2),
  traces: TRACES,
  trace: TRACE,
  body: [
    ...LEFT.map((_, i) => edgePad(0, 2.2 + i * 2.54, "left")),
    ...RIGHT.map((_, i) => edgePad(W, 2.2 + i * 2.54, "right")),
    ...LEFT.map((l, i) => text(3.0, 2.5 + i * 2.54, l, 0.75, INK.white, { anchor: "start" })),
    ...RIGHT.map((l, i) => text(15.0, 2.5 + i * 2.54, l, 0.75, INK.white, { anchor: "end" })),
    `<rect x="6.3" y="0.7" width="5.4" height="1.9" rx="0.25" fill="${INK.white}"/>`,
    `<rect x="7.4" y="0.95" width="3.2" height="1.4" rx="0.15" fill="#c2352b"/>`,
    crystal(4.3, 4.0, 3, 2, "40.000"),
    chip(8.1, 5.0, 4.6, { rotate: 45, label: "C3", fs: 0.8 }),
    smd(12.2, 4.2, 0.5, 1), smd(12.9, 4.2, 0.5, 1, INK.smdBlack), smd(5.0, 10.8, 1, 0.5), smd(11.8, 11.4, 1, 0.5),
    `<rect x="3.4" y="12.9" width="1" height="0.8" rx="0.15" fill="#e9e3d6"/>`,
    text(3.9, 12.4, "PW", 0.6),
    button(3.2, 14.6, 3.4, 2.8), button(11.4, 14.6, 3.4, 2.8),
    text(2.4, 16.0, "BOOT", 0.6, INK.white, { rotate: -90 }),
    text(15.6, 16.0, "RST", 0.6, INK.white, { rotate: 90 }),
    usbC(9, 18.3),
  ].join(""),
};
