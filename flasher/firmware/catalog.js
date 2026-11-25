// Board id -> chip it carries. Two boards can share a chip (DevKit and PICO-KIT are both ESP32).
// Picker order: the most common boards first.
export const CHIP_OF = { s2: "ESP32-S2", devkit: "ESP32", s3: "ESP32-S3", c3: "ESP32-C3", pico: "ESP32" };

// What the board is usually sold as.
export const BOARD_NAME = {
  s2: "ESP32-S2 Mini", s3: "ESP32-S3 DevKitC", c3: "ESP32-C3 Super Mini",
  devkit: "ESP32 DevKit", pico: "ESP32 PICO-KIT",
};

// Board id -> image published by the pages workflow.
export const IMAGE_OF = {
  s2: "esp32-arduino.s2.merged.bin",
  s3: "esp32-arduino.s3.merged.bin",
  c3: "esp32-arduino.c3.merged.bin",
  devkit: "esp32-arduino.devkit.merged.bin",
  pico: "esp32-arduino.pico.merged.bin",
};

// Stable images sit in bin/, the pre-release ones in bin/pre/.
export function imagePath(board, channel) {
  return `bin/${channel === "pre" ? "pre/" : ""}${IMAGE_OF[board]}`;
}

export function isChip(name) {
  return Object.values(CHIP_OF).includes(name);
}

// The board to use for a detected chip: keep the picked one if it carries that chip.
export function boardOf(chip, picked) {
  if (CHIP_OF[picked] === chip) return picked;
  return Object.keys(CHIP_OF).find((id) => CHIP_OF[id] === chip) || "s2";
}

export function isBoard(id) {
  return Object.hasOwn(CHIP_OF, id ?? "");
}
