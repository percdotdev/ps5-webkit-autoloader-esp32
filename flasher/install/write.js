import { session } from "../device/session.js";

// Writes a merged image at 0x0 through the open esptool-js session.
export async function writeImage(data, { eraseAll, onProgress }) {
  await session.loader.writeFlash({
    fileArray: [{ data: new Uint8Array(data), address: 0 }],
    flashSize: "4MB",
    flashMode: "keep",
    flashFreq: "keep",
    eraseAll,
    compress: false, // pako deflate of a 4 MB image throws "offset is out of bounds"
    reportProgress(_i, written, total) {
      onProgress(written / total);
    },
  });
}

// Restarts the chip into the new firmware so nobody has to replug it.
// - S2 native USB (USB-OTG CDC): the RTS line does nothing, so trip the RTC watchdog,
//   the same trick esptool.py uses for this mode.
// - C3/S3 USB-Serial/JTAG and USB-UART bridges: a hard reset through RTS.
// The board drops off USB as it reboots, so a lost link after the request counts as success.
// Returns true when the reset was sent, false when the user has to press RST.
export async function startFirmware() {
  const { loader } = session;
  try {
    const otg = await loader.usesUsbOtg();
    if (otg && typeof loader.chip.watchdogReset === "function") {
      await loader.chip.watchdogReset(loader);
    } else {
      await loader.after("hard_reset", otg);
    }
    return true;
  } catch (err) {
    return /lost|disconnect|closed|NetworkError|read/i.test(String(err?.message || err));
  }
}
