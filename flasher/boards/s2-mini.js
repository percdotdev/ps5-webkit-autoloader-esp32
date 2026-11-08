import { INK, pcb, holes, chip, smd, crystal, button, usbC, traceAntenna, text } from "./parts.js";

// Lolin / TENSTAR S2 Mini: purple, 25.4 x 34.3 mm, two pin rows per side.
const W = 25.4, H = 34.3;
const PCB = "#5a2a72";

export const s2Mini = {
  w: W, h: H,
  led: [18.6, 26.6],
  boot: [21.95, 30.1],
  usb: { cx: 12.7, y: 29.9, kind: "c" },
  body: [
    pcb(W, H, PCB, 2.6),
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
