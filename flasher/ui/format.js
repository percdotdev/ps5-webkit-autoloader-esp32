export function fmtBytes(n) {
  if (n >= 1048576) {
    const mb = n / 1048576;
    return (Number.isInteger(mb) ? String(mb) : mb.toFixed(2)) + " MB";
  }
  if (n >= 1024) {
    const kb = n / 1024;
    return (Number.isInteger(kb) ? String(kb) : kb.toFixed(1)) + " KB";
  }
  return n + " B";
}

export function fmtSec(n) {
  return (n >= 10 ? String(Math.round(n)) : n.toFixed(1)) + " s";
}
