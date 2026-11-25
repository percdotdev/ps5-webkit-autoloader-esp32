import { INK, pcb, holes, chip, smd, button, microUsb, traceAntenna, text } from "./parts.js";

// ESP32 DevKit (DOIT V1 / "ESP-32S" clones): black, 28 x 51.5 mm, 2 x 15 pins,
// WROOM-32 module with its antenna at the top, micro-USB between EN and BOOT.
const W = 28, H = 51.5;
const PCB = "#141518";

const TRACE = "#2f3137";
// Copper under the solder mask: [what it carries, path, pulse delay in s].
const TRACES = [
  ["usb", "M13.6 47 V42.4 L13 41.8 V39"],
  ["usb", "M14.4 47 V42.4 L15 41.8 V39", 0.12],
  ["link", "M12.6 33.6 V30.8 L11.2 29.4 V26.1", 0.35],
  ["link", "M15.4 33.6 V30.8 L16.8 29.4 V26.1", 0.47],
  ["power", "M9.4 28.2 V26.1"],
  ["rf", "M14 7.4 V6.4"],
  ["boot", "M22.9 46.4 V43.6 L24.2 42.3 V29 L22.6 27.4 V26.1"],
  ["led", "M19.8 41.4 V36.6 L21.2 35.2 V26.1"],
  ["io", "M5 12 H2.4"], ["io", "M23 14.6 H25.6", 0.2], ["io", "M5 19.8 H2.4", 0.35], ["io", "M23 22.3 H25.6", 0.1],
];

export const devkit = {
  w: W, h: H,
  led: [19.8, 42.2],
  boot: [22.9, 47.8],
  usb: { cx: 14, y: 46.9, kind: "micro" },
  pcb: pcb(W, H, PCB, 1.4),
  traces: TRACES,
  trace: TRACE,
  body: [
    holes(1.5, 9.2, 15, INK.silver), holes(26.5, 9.2, 15, INK.silver),
    // WROOM-32: module PCB with the antenna, then the metal shield.
    `<rect x="5" y="0.5" width="18" height="25.6" rx="0.5" fill="#1f2126" stroke="#30323a" stroke-width="0.2"/>`,
    traceAntenna(6.4, 1.4, 15.2, 4.4, INK.gold),
    `<rect x="5.7" y="7.4" width="16.6" height="17.6" rx="0.5" fill="${INK.silver}" stroke="${INK.silverDark}" stroke-width="0.25"/>`,
    `<rect x="6.3" y="8" width="15.4" height="16.4" rx="0.35" fill="none" stroke="#e3e6ea" stroke-width="0.2"/>`,
    text(14, 11.6, "ESPRESSIF", 1.3, "#3a3d43", { weight: 700 }),
    text(14, 14, "ESP32-WROOM-32", 1.05, "#3a3d43"),
    text(14, 17.6, "Wi-Fi + BT", 0.85, "#5d6168"),
    text(9, 22.6, "CE", 1.1, "#3a3d43", { weight: 700 }),
    // Regulator and USB bridge.
    `<rect x="6.2" y="28.2" width="6.6" height="3.6" rx="0.25" fill="${INK.smdBlack}"/><rect x="7.4" y="27.5" width="4.2" height="0.9" fill="${INK.silverDark}"/>`,
    text(9.5, 30.6, "AMS1117", 0.6, "#8d939c"),
    chip(11.5, 33.8, 5, { label: "CP2102", fs: 0.6 }),
    smd(6.4, 34.2, 1.1, 0.55), smd(6.4, 35.8, 1.1, 0.55, INK.smdBlack), smd(18.4, 30.4, 0.55, 1.1),
    smd(20.6, 30.4, 0.55, 1.1, INK.smdBlack), smd(7.4, 38.4, 0.55, 1.1),
    // Red power LED on the left, blue GPIO 2 LED on the right.
    `<rect x="7.6" y="41.8" width="1.2" height="0.8" rx="0.15" fill="#e9e3d6"/><circle cx="8.2" cy="42.2" r="0.42" fill="#7a2a2a"/>`,
    `<rect x="19.2" y="41.8" width="1.2" height="0.8" rx="0.15" fill="#e9e3d6"/>`,
    button(3.4, 46.4), button(21.2, 46.4),
    text(5.1, 45.8, "EN", 0.85), text(22.9, 45.8, "BOOT", 0.85),
    microUsb(14, 46.9),
  ].join(""),
};
