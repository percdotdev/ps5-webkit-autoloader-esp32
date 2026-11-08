// Board id -> chip name, and chip name -> image published by the pages workflow.
export const CHIP_OF = { s2: "ESP32-S2", s3: "ESP32-S3", c3: "ESP32-C3", pico: "ESP32" };

export const IMAGE_OF = {
  "ESP32": "bin/esp32-arduino.pico.merged.bin",
  "ESP32-S2": "bin/esp32-arduino.s2.merged.bin",
  "ESP32-S3": "bin/esp32-arduino.s3.merged.bin",
  "ESP32-C3": "bin/esp32-arduino.c3.merged.bin",
};

export function boardOf(chip) {
  return Object.keys(CHIP_OF).find((id) => CHIP_OF[id] === chip) || "s2";
}

export function isBoard(id) {
  return Object.hasOwn(CHIP_OF, id ?? "");
}
