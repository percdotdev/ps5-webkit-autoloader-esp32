import { ESPLoader, Transport } from "https://unpkg.com/esptool-js@0.7.0/bundle.js";
import { state } from "../app/state.js";
import { CHIP_OF, IMAGE_OF } from "../firmware/catalog.js";
import { t } from "../language/language.js";
import { logLine } from "../log/log.js";

const USB_VENDORS = [0x303a, 0x10c4, 0x1a86, 0x0403]; // Espressif, CP210x, CH34x, FTDI

export const serialOk = typeof navigator !== "undefined" && "serial" in navigator;

export const session = {
  port: null,
  transport: null,
  loader: null,
  nativeUsb: false,
  chipName: "",
  chipDesc: "",
  mac: "",
  imageKey: "",
};

// Native USB boards reject DTR/RTS; that is not an error for us.
function ignoreMissingSignals(transport) {
  const wrap = (fn) => async function (...args) {
    try { return await fn.apply(this, args); }
    catch (err) {
      if (String(err).includes("control signals")) return;
      throw err;
    }
  };
  transport.setRTS = wrap(transport.setRTS);
  transport.setDTR = wrap(transport.setDTR);
  transport.setSignals = wrap(transport.setSignals);
}

// esptool-js reports chip details only as log lines.
function capture(line) {
  const s = String(line).trim();
  const chip = s.match(/^Chip is (.+)$/i);
  if (chip) session.chipDesc = chip[1];
  const mac = s.match(/^MAC:\s*([0-9a-f:]+)/i);
  if (mac) session.mac = mac[1].toUpperCase();
}

async function requestPort() {
  try {
    return await navigator.serial.requestPort({
      filters: USB_VENDORS.map((usbVendorId) => ({ usbVendorId })),
    });
  } catch (err) {
    if (err?.name === "NotFoundError") throw Object.assign(new Error(t("noport")), { abort: true });
    throw err;
  }
}

export async function dropSession() {
  try { await session.transport?.disconnect(); } catch { /* already gone */ }
  Object.assign(session, {
    port: null, transport: null, loader: null, nativeUsb: false,
    chipName: "", chipDesc: "", mac: "", imageKey: "",
  });
}

export async function openSession() {
  await dropSession();
  const port = await requestPort();
  session.port = port;
  session.nativeUsb = port.getInfo().usbVendorId === 0x303a;
  session.transport = new Transport(port, false);
  ignoreMissingSignals(session.transport);
  session.loader = new ESPLoader({
    transport: session.transport,
    baudrate: 115200,
    romBaudrate: 115200,
    terminal: {
      clean() {},
      writeLine: (d) => { capture(d); logLine(d); },
      write() {},
    },
  });

  if (session.nativeUsb) logLine(t("native"));
  let chip;
  try {
    chip = await session.loader.main(session.nativeUsb ? "no_reset" : "default_reset");
  } catch (err) {
    if (!String(err).includes("control signals")) throw err;
    logLine(t("native"));
    try { await session.transport.disconnect(); } catch { /* already closed */ }
    chip = await session.loader.main("no_reset");
  }
  const name = session.loader.chip?.CHIP_NAME || chip || CHIP_OF[state.board];
  session.chipName = name;
  session.imageKey = IMAGE_OF[name] ? name : CHIP_OF[state.board];
  if (CHIP_OF[state.board] !== session.imageKey) logLine(t("mismatch"));
}
