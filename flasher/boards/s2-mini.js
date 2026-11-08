import { INK, pcb, holes, chip, smd, crystal, button, usbC, traceAntenna, text } from "./parts.js";

// Lolin / TENSTAR S2 Mini: purple, 25.4 x 34.3 mm, two pin rows per side.
const W = 25.4, H = 34.3;
const PCB = "#5a2a72";

const TRACE = "#7b429a";
// Copper under the solder mask: [what it carries, path, pulse delay in s].
const TRACES = [
  ["usb", "M12.1 29.8 V24 L11.4 23.3 V19.3"],
  ["usb", "M13.3 29.8 V24 L14.0 23.3 V19.3", 0.12],
  ["power", "M9.8 29.8 V27.4 L8 25.6 V24.6"],
  ["power", "M8 22.2 V20.6 L9.3 19.3"],
  ["rf", "M10.6 12.3 V9.2 L7.6 6.2 L6.4 5.8"],
  ["io", "M15.6 12.3 V9.9"],
  ["led", "M16.2 17.6 H17.6 L18.6 18.6 V25.9"],
  ["boot", "M16.2 18.8 H17.2 L19.6 21.2 V27.6 L20.6 28.6"],
  ["io", "M9.2 14 H6.6 L5.1 12.5 V11.6"],
  ["io", "M9.2 16.3 H5.1", 0.3],
  ["io", "M16.2 14 H20.3"],
  ["io", "M16.2 15.4 H19 L19.8 16.2 H20.3", 0.2],
];

export const s2Mini = {
  w: W, h: H,
  led: [18.6, 26.6],
  boot: [21.95, 30.1],
  usb: { cx: 12.7, y: 29.9, kind: "c" },
  pcb: pcb(W, H, PCB, 2.6),
  traces: TRACES,
  trace: TRACE,
  body: [
    `<circle cx="2.7" cy="2.7" r="1.25" fill="${INK.white}"/><circle cx="2.7" cy="2.7" r="0.75" fill="${INK.hole}"/>`,
    `<circle cx="22.7" cy="2.7" r="1.25" fill="${INK.white}"/><circle cx="22.7" cy="2.7" r="0.75" fill="${INK.hole}"/>`,
    traceAntenna(6.4, 1.3, 12.6, 4.4, "#7f4d98"),
    holes(1.75, 8.6, 8, INK.gold), holes(4.3, 8.6, 8, INK.gold),
    holes(21.1, 8.6, 8, INK.gold), holes(23.65, 8.6, 8, INK.gold),
    crystal(14.3, 7.7, 3.4, 2.1),
    chip(9.3, 12.4, 6.8, { label: "ESP32-S2", fs: 0.7 }),
    smd(7.2, 10.2, 1, 0.5), smd(7.2, 11.2, 1, 0.5), smd(17.2, 12.6, 0.5, 1), smd(17.2, 14.2, 0.5, 1),
    smd(9.6, 20.2, 1, 0.5, INK.smdBlack), smd(11.4, 20.2, 1, 0.5), smd(14.6, 20.2, 1, 0.5),
    `<rect x="6.6" y="22.2" width="2.8" height="2.3" rx="0.2" fill="${INK.smdBlack}"/>`,
    text(19.6, 18.6, "S2 Mini", 1.35, INK.white, { rotate: -90 }),
    `<circle cx="18.6" cy="26.6" r="0.55" fill="#e9e3d6"/>`,
    text(17.2, 30.3, "15", 0.9), text(21.9, 28.2, "0", 0.9), text(3.6, 28.2, "RST", 0.85),
    button(1.9, 28.9), button(20.25, 28.7),
    usbC(12.7, 29.9),
  ].join(""),
};
