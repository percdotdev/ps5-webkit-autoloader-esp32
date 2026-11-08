import { t } from "../language/language.js";
import { fmtBytes, fmtSec } from "../ui/format.js";

// esptool-js chatter that tells the user nothing.
const SKIP = /^(Writing at 0x|Compressed \d|Uploading stub|Running stub|Stub running|Changing baud|Hard resetting|Connecting\.\.\.|Detecting chip|Leaving\.\.\.|Staying in)/i;

// Turns a raw esptool-js line into { text, kind } or null to drop it.
export function formatLine(raw) {
  const s = String(raw).replace(/\r/g, "").replace(/\s+/g, " ").trim();
  if (!s || SKIP.test(s)) return null;
  const wrote = s.match(/^Wrote (\d+) bytes.*?in ([\d.]+) seconds/i);
  if (wrote) return { text: `${t("wrote")} ${fmtBytes(+wrote[1])} · ${fmtSec(+wrote[2])}`, kind: "hi" };
  if (/^Hash of data verified/i.test(s)) return { text: t("verified"), kind: "hi" };
  if (/^Chip is /i.test(s)) return { text: s.replace(/^Chip is /i, `${t("chip")}  `), kind: "hi" };
  if (/^MAC:/i.test(s)) return { text: s.replace(/^MAC:\s*/i, "MAC  ") };
  if (/^Features:/i.test(s)) return { text: s.replace(/^Features:\s*/i, "") };
  if (/^Crystal is /i.test(s)) return { text: s.replace(/^Crystal is /i, "") };
  return { text: s };
}
