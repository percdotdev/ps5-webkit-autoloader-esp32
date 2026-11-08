import { s2Mini } from "./s2-mini.js";
import { s3DevKitC } from "./s3-devkitc.js";
import { c3SuperMini } from "./c3-super-mini.js";
import { picoKit } from "./pico-kit.js";

const BOARDS = { s2: s2Mini, s3: s3DevKitC, c3: c3SuperMini, pico: picoKit };

// USB plug and cable hanging below the port. Slides up into the port when plugged.
function cable(b) {
  const { cx, y, kind } = b.usb;
  const pw = kind === "c" ? 10.6 : 9.4;
  const top = y + (kind === "c" ? 3.4 : 3.2);
  const bottom = b.h + 46;
  const path = `M${cx} ${top + 11} C ${cx} ${top + 22}, ${cx + 10} ${top + 24}, ${cx + 10} ${bottom}`;
  return `<g class="cable">` +
    `<path d="${path}" fill="none" stroke="#2c2f36" stroke-width="3.4" stroke-linecap="round"/>` +
    `<path class="flow" d="${path}" fill="none" stroke-width="1.1" stroke-linecap="round"/>` +
    `<rect x="${cx - pw / 2}" y="${top}" width="${pw}" height="9" rx="1.8" fill="#3a3e47"/>` +
    `<rect x="${cx - pw / 2 + 0.6}" y="${top + 0.6}" width="${pw - 1.2}" height="1.6" rx="0.8" fill="#4d525d"/>` +
    `<rect x="${cx - 2.4}" y="${top + 9}" width="4.8" height="3.2" rx="1" fill="#2c2f36"/>` +
    `</g>`;
}

function wifi(b) {
  const cx = b.w / 2, y = -3;
  return `<g class="wifi">` + [5, 9, 13].map((r, i) =>
    `<path class="wave" style="--i:${i}" d="M${cx - r * 0.86} ${y - r * 0.5 + r * 0.5} A ${r} ${r} 0 0 1 ${cx + r * 0.86} ${y}" fill="none" stroke-width="1.3" stroke-linecap="round"/>`,
  ).join("") + `</g>`;
}

// The big drawing: board, status LED, BOOT hint, cable and Wi-Fi waves.
export function boardArt(id) {
  const b = BOARDS[id] || s2Mini;
  const [lx, ly] = b.led;
  const [bx, by] = b.boot;
  const pad = 16;
  return `<svg class="art" viewBox="${-pad} ${-pad - 4} ${b.w + pad * 2} ${b.h + pad + 22}" aria-hidden="true">` +
    `<ellipse class="art-shadow" cx="${b.w / 2}" cy="${b.h + 5}" rx="${b.w * 0.55}" ry="2.4"/>` +
    wifi(b) +
    cable(b) +
    `<g class="art-board">${b.body}` +
    `<circle class="led" cx="${lx}" cy="${ly}" r="0.95"/>` +
    `<circle class="boot-ring" cx="${bx}" cy="${by}" r="3.2"/>` +
    `</g></svg>`;
}

// The small drawing in the board picker.
export function boardThumb(id) {
  const b = BOARDS[id] || s2Mini;
  return `<svg class="thumb" viewBox="-1 -1 ${b.w + 2} ${b.h + 2}" aria-hidden="true">${b.body}</svg>`;
}
