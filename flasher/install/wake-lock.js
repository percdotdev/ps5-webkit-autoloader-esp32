// Keeps the screen on during a write so the laptop does not sleep mid-flash.
let lock = null;

export async function holdAwake() {
  try {
    if ("wakeLock" in navigator) lock = await navigator.wakeLock.request("screen");
  } catch { /* not allowed here; the write still works */ }
}

export async function releaseAwake() {
  try { await lock?.release(); } catch { /* already released */ }
  lock = null;
}
