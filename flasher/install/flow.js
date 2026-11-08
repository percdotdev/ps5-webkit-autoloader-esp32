import { state } from "../app/state.js";
import { session, openSession, dropSession } from "../device/session.js";
import { IMAGE_OF, boardOf } from "../firmware/catalog.js";
import { fetchImage } from "../firmware/image.js";
import { t } from "../language/language.js";
import { clearLog, logLine } from "../log/log.js";
import { fmtBytes } from "../ui/format.js";
import { showProgress, endProgress, hideProgress } from "./progress.js";
import { holdAwake, releaseAwake } from "./wake-lock.js";
import { writeImage, startFirmware } from "./write.js";
import { advance } from "../steps/stepper.js";

// " · 40 s left", once there is enough data to guess.
function timeLeft(started, f) {
  const spent = (Date.now() - started) / 1000;
  if (f < 0.05 || spent < 2) return "";
  const left = Math.max(1, Math.round((spent / f) * (1 - f)));
  return ` · ${t("left").replace("{s}", left)}`;
}

function isAbort(err) {
  return Boolean(err?.abort) || err?.name === "NotFoundError";
}

function errorText(err) {
  if (isAbort(err)) return t("noport");
  if (err?.name === "InvalidStateError" || err?.name === "NetworkError") return t("busyPort");
  return t("fail");
}

function openFold(id) {
  document.getElementById(id).open = true;
}

// Connect, install, disconnect. `render` repaints the page after each phase change.
export function createFlow(render) {
  async function attach() {
    state.phase = "connecting";
    render();
    await openSession();
    state.board = boardOf(session.imageKey);
    state.phase = "connected";
    render();
  }

  async function fail(err) {
    await dropSession();
    state.phase = isAbort(err) ? "idle" : "error";
    endProgress(errorText(err), "bad");
    logLine(String(err?.message || err), "bad");
    if (!isAbort(err)) openFold("logs-box");
  }

  async function run(task) {
    if (state.busy) return;
    state.busy = true;
    try {
      await task();
    } catch (err) {
      await fail(err);
    } finally {
      state.busy = false;
      render();
    }
  }

  async function write() {
    let data = state.localFile?.data;
    const name = state.localFile?.name || IMAGE_OF[session.imageKey].split("/").pop();
    if (!data) {
      showProgress(t("phFetch"), null);
      data = await fetchImage(IMAGE_OF[session.imageKey]);
    }
    logLine(`${name} · ${fmtBytes(data.byteLength)}`);

    showProgress(state.eraseAll ? t("phErase") : `${t("phWrite")}…`, state.eraseAll ? null : 0);
    let started = 0;
    await writeImage(data, {
      eraseAll: state.eraseAll,
      onProgress: (f) => {
        started ||= Date.now();
        showProgress(`${t("phWrite")}${timeLeft(started, f)}`, f * 100);
      },
    });
  }

  const connect = () => run(async () => {
    clearLog();
    hideProgress();
    await attach();
  });

  const install = () => run(async () => {
    await holdAwake();
    try {
      if (!session.loader) {
        clearLog();
        showProgress(t("phConnect"), null);
        await attach();
      }
      state.phase = "installing";
      render();
      await write();
      state.started = await startFirmware();
      const done = state.started ? t("phDone") : t("phDonePress");
      logLine(done, "hi");
      endProgress(done, "ok");
      state.phase = "done";
      advance();
      await dropSession();
    } finally {
      await releaseAwake();
    }
  });

  const disconnect = () => run(async () => {
    await dropSession();
    state.phase = "idle";
    hideProgress();
  });

  function reset() {
    state.phase = "idle";
    hideProgress();
    render();
  }

  // The board vanished (unplugged or rebooted) while sitting idle.
  async function lost(port) {
    if (state.busy || port !== session.port) return;
    await dropSession();
    if (state.phase === "connected") state.phase = "idle";
    render();
  }

  return { connect, install, disconnect, reset, lost };
}
