// The four boards: chip name, the image the pages workflow publishes, and a photo.
export const BOARDS = {
  s2: { name: "S2 Mini", chip: "ESP32-S2", image: "bin/esp32-arduino.s2.merged.bin", photo: "photos/s2-mini.webp", size: [340, 448] },
  s3: { name: "S3 DevKitC-1", chip: "ESP32-S3", image: "bin/esp32-arduino.s3.merged.bin", photo: "photos/s3-devkitc-1.webp", size: [664, 565] },
  c3: { name: "C3 Super Mini", chip: "ESP32-C3", image: "bin/esp32-arduino.c3.merged.bin", photo: "photos/c3-super-mini.webp", size: [461, 632] },
  pico: { name: "PICO-KIT", chip: "ESP32", image: "bin/esp32-arduino.pico.merged.bin", photo: "photos/pico-kit.webp", size: [720, 275] },
};

// Board id -> chip name, and chip name -> image.
export const CHIP_OF = Object.fromEntries(Object.entries(BOARDS).map(([id, b]) => [id, b.chip]));
export const IMAGE_OF = Object.fromEntries(Object.values(BOARDS).map((b) => [b.chip, b.image]));

export function boardOf(chip) {
  return Object.keys(BOARDS).find((id) => BOARDS[id].chip === chip) || "s2";
}

export function isBoard(id) {
  return Object.hasOwn(BOARDS, id ?? "");
}
