// Inline SVG of a generic dev board. Colours come from device.css via
// the panel's data-state, so the LED reflects the connection.
export function boardArt(label) {
  const holes = Array.from({ length: 8 }, (_, i) => 44 + i * 14)
    .map((y) => `<circle cx="34" cy="${y}" r="3"/><circle cx="126" cy="${y}" r="3"/>`)
    .join("");
  return `<svg class="art" viewBox="0 0 160 170" aria-hidden="true">
    <rect class="art-usb" x="64" y="4" width="32" height="18" rx="4"/>
    <rect class="art-pcb" x="22" y="18" width="116" height="146" rx="10"/>
    <g class="art-pin">${holes}</g>
    <rect class="art-can" x="50" y="40" width="60" height="70" rx="4"/>
    <text class="art-txt" x="80" y="80" text-anchor="middle">${label}</text>
    <rect class="art-btn" x="48" y="128" width="20" height="12" rx="3"/>
    <rect class="art-btn" x="92" y="128" width="20" height="12" rx="3"/>
    <text class="art-cap" x="58" y="152" text-anchor="middle">BOOT</text>
    <text class="art-cap" x="102" y="152" text-anchor="middle">RST</text>
    <circle class="art-led" cx="80" cy="124" r="4"/>
  </svg>`;
}
