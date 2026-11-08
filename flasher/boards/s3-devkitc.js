import { INK, pcb, holes, chip, smd, button, microUsb, traceAntenna, text } from "./parts.js";

// Espressif ESP32-S3-DevKitC-1: 25.4 x 62.7 mm, WROOM-1 module, two USB ports.
const W = 25.4, H = 62.7;
const PCB = "#1d1f23";

function qr(x, y, s) {
  const cells = [];
  const n = 7, c = s / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if ((i * 7 + j * 3 + i * j) % 3 === 0 || i === 0 || j === 0 || i === n - 1) {
      cells.push(`<rect x="${(x + j * c).toFixed(2)}" y="${(y + i * c).toFixed(2)}" width="${c.toFixed(2)}" height="${c.toFixed(2)}" fill="#2b2d31"/>`);
    }
  }
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${INK.white}"/>` + cells.join("");
}

export const s3DevKitC = {
  w: W, h: H,
  led: [10.4, 30.9],
  boot: [6.9, 52.2],
  usb: { cx: 7.8, y: 58.6, kind: "micro" },
  body: [
    pcb(W, H, PCB, 1.6),
    holes(1.6, 4.8, 22, INK.silver), holes(23.8, 4.8, 22, INK.silver),
    `<rect x="3.7" y="0.6" width="18" height="25.5" rx="0.6" fill="#24262b" stroke="#34363c" stroke-width="0.2"/>`,
    traceAntenna(5.2, 1.6, 15, 4.4, INK.gold),
    `<rect x="4.4" y="7.3" width="16.6" height="18" rx="0.6" fill="${INK.silver}" stroke="${INK.silverDark}" stroke-width="0.25"/>`,
    `<rect x="5.0" y="7.9" width="15.4" height="16.8" rx="0.4" fill="none" stroke="#e3e6ea" stroke-width="0.2"/>`,
    text(12.7, 10.9, "ESPRESSIF", 1.3, "#3a3d43", { weight: 700 }),
    text(12.7, 13.2, "ESP32-S3-WROOM-1", 0.95, "#3a3d43"),
    qr(13.6, 15.2, 5.6),
    text(7.6, 17.4, "CE", 1.1, "#3a3d43", { weight: 700 }),
    text(8.4, 22.6, "E1N8", 0.8, "#3a3d43"),
    `<rect x="9.4" y="29.9" width="2" height="2" rx="0.3" fill="${INK.white}"/>`,
    text(7.4, 31.4, "RGB", 0.75),
    `<rect x="12.2" y="27.6" width="5.2" height="3.2" rx="0.25" fill="${INK.smdBlack}"/><rect x="13.2" y="26.8" width="3.2" height="0.9" fill="${INK.silverDark}"/>`,
    chip(12.2, 37.6, 4.6, { label: "CP2102N", fs: 0.55 }),
    smd(6.0, 35.2, 1.1, 0.55), smd(6.0, 36.6, 1.1, 0.55, INK.smdBlack), smd(18.2, 34.4, 0.55, 1.1), smd(18.2, 40.4, 0.55, 1.1),
    smd(9.2, 44.6, 1.1, 0.55), smd(15.6, 45.4, 1.1, 0.55, INK.smdBlack),
    button(5.2, 50.8), button(16.8, 47.4),
    text(6.9, 50.1, "BOOT", 0.8), text(18.5, 46.7, "RST", 0.8),
    text(7.8, 57.8, "UART", 0.8), text(17.6, 57.8, "USB", 0.8),
    microUsb(7.8, 58.6), microUsb(17.6, 58.6),
  ].join(""),
};
