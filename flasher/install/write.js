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
  try { await session.loader.after("no_reset"); } catch { /* S2 CDC cannot leave download mode over USB */ }
}
