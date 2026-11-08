import SparkMD5 from "https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/+esm";

// MD5 of the image as esptool-js hands it over (padded Uint8Array), in hex.
// esptool-js compares it with the MD5 the chip computes over the written flash
// and throws when they differ, so "Installed" means verified, not just sent.
export function md5Hex(image) {
  const bytes = image instanceof Uint8Array ? image : new Uint8Array(image);
  return SparkMD5.ArrayBuffer.hash(bytes.slice().buffer);
}
