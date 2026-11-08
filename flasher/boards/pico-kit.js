import { INK, pcb, holes, chip, smd, button, microUsb, text } from "./parts.js";

// Espressif ESP32-PICO-KIT v4.1: 20.3 x 52 mm, drawn upright with micro-USB at the bottom.
const W = 20.3, H = 52;
const PCB = "#131416";

const TRACE = "#303238";
// Copper under the solder mask: [what it carries, path, pulse delay in s].
const TRACES = [
  ["usb", "M9.7 48.2 V42 L9.2 41.5 V34.1"],
  ["usb", "M10.6 48.2 V42 L11.1 41.5 V34.1", 0.12],
  ["link", "M8.4 29.3 V27.6 L5.6 24.8 V18.8 L6.6 17.8 V17", 0.35],
  ["link", "M12 29.3 V27.6 L14.6 25 V18.6 L13.6 17.6 V17", 0.47],
  ["rf", "M10.1 9.2 V6.3"],
  ["boot", "M14.9 37.1 V35.2 L16.6 33.5 V19.4 L14 16.9"],
  ["io", "M5.2 37.1 V35.4 L3.8 34 V19.6 L6.3 17.1"],
  ["led", "M12.5 31.6 H15.6 L17 33 V43.4"],
  ["io", "M6.3 11 H2.3"], ["io", "M13.9 12.5 H18", 0.2], ["io", "M6.3 14 H2.3", 0.35],
];

export const picoKit = {
  w: W, h: H,
  led: [16.4, 44.2],
  boot: [14.9, 38.6],
  usb: { cx: 10.15, y: 48.3, kind: "micro" },
  pcb: pcb(W, H, PCB, 1.2),
  traces: TRACES,
  trace: TRACE,
  body: [
    holes(1.5, 7.6, 17, (i) => (i < 3 ? INK.gold : INK.silver)),
    holes(18.8, 7.6, 17, (i) => (i < 3 ? INK.gold : INK.silver)),
    `<rect x="4.0" y="1.0" width="12.3" height="5.2" rx="0.4" fill="${INK.silver}" stroke="${INK.silverDark}" stroke-width="0.2"/>`,
    `<path d="M5.4 2.2 h9.4 v2.8 h-2.4 v-1.4 h-4.6 v1.4 h-2.4 z" fill="#9aa0a8"/>`,
    text(10.15, 5.6, "Proant 440", 0.7, "#5d6168"),
    text(10.15, 8.2, "WiFi", 0.85),
    chip(6.3, 9.3, 7.6, { label: "PICO-D4", fs: 0.75 }),
    `<circle cx="10.1" cy="11.9" r="1.1" fill="none" stroke="${INK.gold}" stroke-width="0.35"/>`,
    smd(6.2, 17.6, 1.1, 0.55), smd(7.8, 17.6, 1.1, 0.55), smd(9.4, 17.6, 1.1, 0.55, INK.smdBlack), smd(11.0, 17.6, 1.1, 0.55),
    text(10.15, 20.6, "POWER", 0.85),
    `<rect x="6.6" y="21.6" width="7" height="4.6" rx="0.3" fill="${INK.smdBlack}"/><rect x="7.6" y="20.9" width="5" height="1" fill="${INK.silverDark}"/>`,
    text(10.15, 24.4, "AMS1117", 0.6, "#8d939c"),
    text(10.15, 28.4, "USB Bridge", 0.85),
    chip(7.85, 29.4, 4.6, { label: "CP2102N", fs: 0.5 }),
    smd(4.6, 30.2, 0.55, 1.1), smd(15.2, 30.2, 0.55, 1.1, INK.smdBlack), smd(4.6, 32.4, 0.55, 1.1),
    button(3.5, 37.2), button(13.2, 37.2),
    text(5.2, 36.4, "EN", 0.85), text(14.9, 36.4, "BOOT", 0.85),
    `<rect x="15.8" y="43.8" width="1.2" height="0.8" rx="0.15" fill="#e9e3d6"/>`,
    microUsb(10.15, 48.3),
  ].join(""),
};
