// Drawing pieces for the boards. Units are millimetres, every board is drawn
// top-down with its USB port at the bottom edge.

export const INK = {
  gold: "#d6a84a", goldDark: "#9c7428", silver: "#cfd3d9", silverDark: "#8d939c",
  chip: "#26272b", chipEdge: "#3b3d43", smdTan: "#b9925a", smdBlack: "#18191c",
  white: "#f2f2f0", hole: "#0b0b0c",
};

const r2 = (n) => Math.round(n * 100) / 100;

export function pcb(w, h, fill, radius = 1.4) {
  return `<rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="${fill}"/>` +
    `<rect x="0.35" y="0.35" width="${r2(w - 0.7)}" height="${r2(h - 0.7)}" rx="${radius}" fill="none" stroke="#ffffff" stroke-opacity="0.07" stroke-width="0.35"/>`;
}

// A plated through-hole: metal ring with a dark centre.
export function hole(x, y, ring = INK.gold, r = 0.8) {
  return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${ring}"/><circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r * 0.5)}" fill="${INK.hole}"/>`;
}

export function holes(x, y0, count, ring, pitch = 2.54) {
  return Array.from({ length: count }, (_, i) => hole(x, y0 + i * pitch, typeof ring === "function" ? ring(i) : ring)).join("");
}

// Castellated edge pad (C3 Super Mini).
export function edgePad(x, y, side) {
  const w = 2.3, h = 1.8;
  const px = side === "left" ? x : x - w;
  return `<rect x="${r2(px)}" y="${r2(y - h / 2)}" width="${w}" height="${h}" rx="0.5" fill="${INK.gold}"/>` +
    `<circle cx="${r2(x + (side === "left" ? 0.2 : -0.2))}" cy="${r2(y)}" r="0.55" fill="${INK.hole}"/>`;
}

// A QFN chip with its pads peeking out on all four sides.
export function chip(x, y, s, { label = "", fs = 0.8, rotate = 0, dot = true } = {}) {
  const pads = [];
  const n = Math.max(4, Math.round(s * 1.4));
  const step = (s - 1) / (n - 1);
  for (let i = 0; i < n; i++) {
    const o = 0.5 + i * step;
    pads.push(`<rect x="${r2(x + o - 0.12)}" y="${r2(y - 0.25)}" width="0.24" height="0.35" fill="${INK.silverDark}"/>`);
    pads.push(`<rect x="${r2(x + o - 0.12)}" y="${r2(y + s - 0.1)}" width="0.24" height="0.35" fill="${INK.silverDark}"/>`);
    pads.push(`<rect x="${r2(x - 0.25)}" y="${r2(y + o - 0.12)}" width="0.35" height="0.24" fill="${INK.silverDark}"/>`);
    pads.push(`<rect x="${r2(x + s - 0.1)}" y="${r2(y + o - 0.12)}" width="0.35" height="0.24" fill="${INK.silverDark}"/>`);
  }
  const cx = x + s / 2, cy = y + s / 2;
  const body = pads.join("") +
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="0.35" fill="${INK.chip}" stroke="${INK.chipEdge}" stroke-width="0.15"/>` +
    (dot ? `<circle cx="${r2(x + 0.8)}" cy="${r2(y + 0.8)}" r="0.3" fill="${INK.chipEdge}"/>` : "") +
    (label ? text(cx, cy + fs * 0.35, label, fs, "#9a9ca3") : "");
  return rotate ? `<g transform="rotate(${rotate} ${r2(cx)} ${r2(cy)})">${body}</g>` : body;
}

export function smd(x, y, w, h, fill = INK.smdTan, ends = INK.silver) {
  const e = Math.min(w, h) * 0.35;
  const horizontal = w >= h;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.12" fill="${fill}"/>` +
    (horizontal
      ? `<rect x="${x}" y="${y}" width="${r2(e)}" height="${h}" fill="${ends}"/><rect x="${r2(x + w - e)}" y="${y}" width="${r2(e)}" height="${h}" fill="${ends}"/>`
      : `<rect x="${x}" y="${y}" width="${w}" height="${r2(e)}" fill="${ends}"/><rect x="${x}" y="${r2(y + h - e)}" width="${w}" height="${r2(e)}" fill="${ends}"/>`);
}

export function crystal(x, y, w, h, label = "") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.35" fill="${INK.silver}" stroke="${INK.silverDark}" stroke-width="0.15"/>` +
    (label ? text(x + w / 2, y + h / 2 + 0.2, label, 0.55, "#5d6168") : "");
}

// Tactile switch seen from above: metal body, dark round plunger.
export function button(x, y, w = 3.4, h = 2.8) {
  return `<g class="btn-switch"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.4" fill="${INK.silver}" stroke="${INK.silverDark}" stroke-width="0.15"/>` +
    `<circle class="btn-cap" cx="${r2(x + w / 2)}" cy="${r2(y + h / 2)}" r="${r2(Math.min(w, h) * 0.3)}" fill="#3a3c41"/></g>`;
}

export function usbC(cx, y) {
  const w = 9, h = 5;
  return `<rect x="${r2(cx - w / 2)}" y="${y}" width="${w}" height="${h}" rx="1.6" fill="${INK.silver}" stroke="${INK.silverDark}" stroke-width="0.2"/>` +
    `<rect x="${r2(cx - 3.2)}" y="${r2(y + h - 1.6)}" width="6.4" height="0.9" rx="0.45" fill="#2a2c30"/>`;
}

export function microUsb(cx, y) {
  const w = 7.6, h = 4.6;
  return `<path d="M${r2(cx - w / 2)} ${y} h${w} v${r2(h - 1)} l-0.8 1 h${r2(-w + 1.6)} l-0.8 -1 z" fill="${INK.silver}" stroke="${INK.silverDark}" stroke-width="0.2"/>` +
    `<rect x="${r2(cx - 2.6)}" y="${r2(y + h - 1.5)}" width="5.2" height="0.7" rx="0.3" fill="#2a2c30"/>`;
}

// PCB trace antenna: a meander inside the given box.
export function traceAntenna(x, y, w, h, color) {
  const steps = 7;
  const dx = w / steps;
  let d = `M${x} ${r2(y + h)}`;
  for (let i = 0; i < steps; i++) d += ` V${i % 2 ? r2(y + h) : y} h${r2(dx)}`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="0.45" stroke-linejoin="round"/>`;
}

export function text(x, y, value, size, fill = INK.white, { anchor = "middle", rotate = 0, weight = 600 } = {}) {
  const t = rotate ? ` transform="rotate(${rotate} ${r2(x)} ${r2(y)})"` : "";
  return `<text x="${r2(x)}" y="${r2(y)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" font-family="ui-monospace, Menlo, Consolas, monospace"${t}>${value}</text>`;
}
