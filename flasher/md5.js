// Small MD5 implementation for flash verification. Web Crypto has no MD5, and
// the ESP32 computes MD5 on its side, so both ends need the same digest.

const SHIFT = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const TABLE = new Uint32Array(64);
for (let i = 0; i < 64; i++) {
  TABLE[i] = (Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
}

function wordHex(value) {
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += ((value >>> (i * 8)) & 0xff).toString(16).padStart(2, "0");
  }
  return out;
}

export async function md5Hex(data, onProgress) {
  const length = data.length;
  const total = (length + 9 + 63) & ~63;
  const buffer = new Uint8Array(total);
  buffer.set(data);
  buffer[length] = 0x80;

  const view = new DataView(buffer.buffer);
  const bits = length * 8;
  view.setUint32(total - 8, bits >>> 0, true);
  view.setUint32(total - 4, Math.floor(bits / 4294967296) >>> 0, true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const block = new Uint32Array(16);

  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  let yielded = now();

  for (let offset = 0; offset < total; offset += 64) {
    for (let i = 0; i < 16; i++) {
      block[i] = view.getUint32(offset + i * 4, true);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f;
      let g;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      f = (f + a + TABLE[i] + block[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + ((f << SHIFT[i]) | (f >>> (32 - SHIFT[i])))) >>> 0;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;

    if (onProgress && offset && offset % 1048576 === 0 && now() - yielded > 12) {
      onProgress(offset / total);
      yielded = now();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return wordHex(a0) + wordHex(b0) + wordHex(c0) + wordHex(d0);
}
