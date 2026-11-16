// Board id -> chip name, and chip name -> image published by the pages workflow.
export const CHIP_OF = { s2: "ESP32-S2", s3: "ESP32-S3", c3: "ESP32-C3", pico: "ESP32" };

// What the board is usually sold as.
export const BOARD_NAME = { s2: "ESP32-S2 Mini", s3: "ESP32-S3 DevKitC", c3: "ESP32-C3 Super Mini", pico: "ESP32 PICO-KIT" };

export const IMAGE_OF = {
  "ESP32": "esp32-arduino.pico.merged.bin",
  "ESP32-S2": "esp32-arduino.s2.merged.bin",
  "ESP32-S3": "esp32-arduino.s3.merged.bin",
  "ESP32-C3": "esp32-arduino.c3.merged.bin",
};

// Stable images sit in bin/, the pre-release ones in bin/pre/.
export function imagePath(chip, channel) {
  return `bin/${channel === "pre" ? "pre/" : ""}${IMAGE_OF[chip]}`;
}

export function boardOf(chip) {
  return Object.keys(CHIP_OF).find((id) => CHIP_OF[id] === chip) || "s2";
}

export function isBoard(id) {
  return Object.hasOwn(CHIP_OF, id ?? "");
}
