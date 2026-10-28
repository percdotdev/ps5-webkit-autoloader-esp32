import { FILES, CHIP_OF, LAST, CONNECT, WRITE, state, session, serialOk } from "./state.js";
import { t, pickLang } from "./i18n.js";
import { setBar, clearLog, logLine, copyLog, fmtBytesLabel } from "./log.js";
import { dropSession, openSession, loadFirmware, writeImage } from "./flash.js";
import { getReleaseInfo, compare, normalize } from "./releases.js";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const stage = document.getElementById("stage");
const track = document.getElementById("track");
const caption = document.getElementById("caption");

function readUrl() {
  const q = new URLSearchParams(location.search);
  const lang = pickLang(q.get("lang"), navigator.language || "");
  let step = Math.min(LAST, Math.max(0, Number(q.get("step") || 0) || 0));
  const board = CHIP_OF[q.get("board")] ? q.get("board") : "s2";
  state.lang = lang;
  document.documentElement.lang = lang;
  state.board = board;
  state.flashed = sessionStorage.getItem("flashed") === "1";
  if (step >= WRITE && !state.connected && !state.flashed) step = CONNECT;
  if (step > WRITE && !state.flashed) step = WRITE;
  state.step = step;
}

function writeUrl() {
  const q = new URLSearchParams();
  q.set("lang", state.lang);
  q.set("step", String(state.step));
  q.set("board", state.board);
  history.replaceState(null, "", `?${q}`);
}

function canOpen(n) {
  if (n <= state.step) return true;
  if (n !== state.step + 1) return false;
  if (state.step === 0) return serialOk;
  if (state.step === CONNECT) return state.connected;
  if (state.step === WRITE) return state.flashed;
  return true;
}

function setLang(lang) {
  if (state.busy) return;
  state.lang = lang;
  document.documentElement.lang = lang;
  writeUrl();
  render();
}

function goto(n) {
  if (!canOpen(n) || state.busy) return;
  if (n < CONNECT) dropSession();
  state.step = n;
  writeUrl();
  render();
  stage.focus({ preventScroll: true });
}

function renderTrack() {
  const names = t("steps");
  track.replaceChildren();
  names.forEach((name, i) => {
    if (i) {
      const rail = document.createElement("span");
      rail.className = "rail";
      rail.setAttribute("aria-hidden", "true");
      track.append(rail);
    }
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tick";
    btn.textContent = String(i + 1);
    btn.title = name;
    btn.setAttribute("aria-label", `${i + 1}. ${name}`);
    if (i === state.step) btn.setAttribute("aria-current", "step");
    btn.disabled = !canOpen(i) || state.busy;
    btn.addEventListener("click", () => goto(i));
    li.append(btn);
    track.append(li);
  });
  caption.replaceChildren(
    document.createTextNode(`${state.step + 1} ${t("of")} ${names.length}`),
    document.createTextNode(" · "),
  );
  const bold = document.createElement("b");
  bold.textContent = names[state.step];
  caption.append(bold);
}

function navRow(opts = {}) {
  const { extra, next = true, nextLabel = t("next") } = opts;
  const row = document.createElement("div");
  row.className = "row";
  const left = document.createElement("div");
  left.className = "row-side";
  const right = document.createElement("div");
  right.className = "row-side";
  if (state.step > 0) {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "act ghost";
    back.textContent = t("back");
    back.disabled = state.busy;
    back.addEventListener("click", () => goto(state.step - 1));
    left.append(back);
  }
  if (extra) right.append(extra);
  if (next && state.step < LAST) {
    const go = document.createElement("button");
    go.type = "button";
    go.className = "act";
    go.id = "next-btn";
    const ahead = t("steps")[state.step + 1];
    go.textContent = nextLabel === t("next") && ahead ? `${t("next")}: ${ahead}` : nextLabel;
    go.disabled = state.busy || (state.step === 0 && !serialOk);
    go.addEventListener("click", () => goto(state.step + 1));
    right.append(go);
  }
  if (state.step === LAST) {
    const again = document.createElement("button");
    again.type = "button";
    again.className = "act ghost";
    again.textContent = t("again");
    again.addEventListener("click", async () => {
      sessionStorage.removeItem("flashed");
      state.flashed = false;
      await dropSession();
      state.step = 0;
      writeUrl();
      render();
    });
    right.append(again);
  }
  row.append(left, right);
  return row;
}

function rich(text) {
  const p = document.createElement("p");
  p.innerHTML = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("ESP32_PORTAL", "<code translate=\"no\">ESP32_PORTAL</code>")
    .replaceAll("12345678", "<code translate=\"no\">12345678</code>")
    .replaceAll("BOOT", "<kbd>BOOT</kbd>")
    .replaceAll("WebKit Autoloader", "<strong>WebKit Autoloader</strong>");
  return p;
}

function stepsList(items) {
  const ol = document.createElement("ol");
  ol.className = "list";
  items.forEach((text, i) => {
    const li = document.createElement("li");
    const n = document.createElement("span");
    n.textContent = String(i + 1);
    const body = rich(text);
    li.append(n, body);
    ol.append(li);
  });
  return ol;
}

function note(text) {
  const p = rich(text);
  p.classList.add("note");
  return p;
}

function deviceCard() {
  const box = document.createElement("div");
  box.className = "device";
  const name = document.createElement("b");
  name.textContent = session.chipName || CHIP_OF[state.board];
  const sub = document.createElement("span");
  const path = session.imageKey ? FILES[session.imageKey] : FILES[CHIP_OF[state.board]];
  sub.textContent = path.split("/").pop();
  box.append(name, sub);
  return box;
}

function consoleBox() {
  const box = document.createElement("div");
  box.className = "console";
  const hd = document.createElement("div");
  hd.className = "console-hd";
  const lab = document.createElement("span");
  lab.textContent = t("log");
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "act ghost";
  copy.id = "copy-log";
  copy.textContent = t("copy");
  copy.addEventListener("click", copyLog);
  hd.append(lab, copy);
  const log = document.createElement("div");
  log.className = "log";
  log.id = "log";
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");
  box.append(hd, log);
  return box;
}

function meterBox(statusText) {
  const meter = document.createElement("div");
  meter.className = "meter";
  meter.innerHTML =
    `<p class="status" id="flash-status">${statusText}</p>` +
    `<div class="pct" id="pct" aria-live="polite">0%</div>` +
    `<div class="bar" aria-hidden="true"><i id="bar"></i></div>`;
  return meter;
}

function releaseBox() {
  const box = document.createElement("div");
  box.className = "release";
  box.id = "release";
  box.textContent = t("releaseChecking");
  fillRelease(box);
  return box;
}

async function fillRelease(box) {
  let info = null;
  try { info = await getReleaseInfo(); } catch { info = null; }
  if (!box.isConnected) return;
  if (!info || (!info.bundled && !info.upstream)) {
    box.hidden = true;
    return;
  }

  const bundled = info.bundled && info.bundled.payload ? normalize(info.bundled.payload) : "";
  const upstream = info.upstream ? normalize(info.upstream.tag) : "";
  const notes = (info.ours && info.ours.url) || (info.upstream && info.upstream.url) || "";

  const line = document.createElement("div");
  line.className = "release-line";
  const baked = document.createElement("span");
  if (bundled) {
    baked.append(document.createTextNode(`${t("releaseBundled")} `));
    const version = document.createElement("b");
    version.textContent = bundled;
    baked.append(version);
  } else {
    baked.textContent = t("releaseChecking");
  }
  line.append(baked);

  if (bundled && upstream) {
    const stateText = document.createElement("span");
    if (compare(upstream, bundled) > 0) {
      stateText.textContent = t("releaseNew").replace("{v}", upstream);
    } else {
      stateText.textContent = t("releaseCurrent");
    }
    line.append(stateText);
  }

  box.replaceChildren(line);

  if (notes) {
    const link = document.createElement("a");
    link.href = notes;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = t("releaseNotes");
    box.append(link);
  }
}

function renderStage() {
  const h = document.createElement("h1");
  h.textContent = t(`t${state.step}`);
  const frag = document.createDocumentFragment();
  frag.append(h);

  if (state.step === 0) {
    const lead = rich(t("p0"));
    lead.classList.add("lead");
    const s = document.createElement("p");
    s.className = "status " + (serialOk ? "ok" : "bad");
    s.textContent = serialOk ? t("ok0") : t("no0");
    frag.append(lead, s, releaseBox(), navRow());
  }

  if (state.step === 1) {
    frag.append(rich(t("p1")));
    const box = document.createElement("div");
    box.className = "boards";
    box.setAttribute("role", "radiogroup");
    box.setAttribute("aria-label", t("t1"));
    for (const [id, chip] of Object.entries(CHIP_OF)) {
      const lab = document.createElement("label");
      const inp = document.createElement("input");
      inp.type = "radio";
      inp.name = "board";
      inp.value = id;
      inp.checked = state.board === id;
      inp.addEventListener("change", async () => {
        if (state.board !== id) await dropSession();
        state.board = id;
        writeUrl();
      });
      lab.append(inp, document.createTextNode(chip));
      box.append(lab);
    }
    frag.append(box, navRow());
  }

  if (state.step === 2) {
    frag.append(rich(t("p2")), stepsList(t("s2")), note(t("n2")), navRow());
  }

  if (state.step === CONNECT) {
    frag.append(rich(t("p3")), note(t("n3")));
    if (state.connected && session.chipName) frag.append(deviceCard());
    const st = document.createElement("p");
    st.className = "status";
    st.id = "flash-status";
    st.textContent = state.connected ? t("linked") : t("idle");
    const go = document.createElement("button");
    go.type = "button";
    go.className = "act";
    go.id = "flash-btn";
    go.textContent = state.connected ? t("reconnect") : t("connect");
    if (state.connected) go.classList.add("ghost");
    go.disabled = !serialOk || state.busy;
    go.addEventListener("click", () => connect(true));
    const extras = document.createDocumentFragment();
    extras.append(go);
    if (state.connected) {
      const cont = document.createElement("button");
      cont.type = "button";
      cont.className = "act";
      cont.textContent = `${t("next")}: ${t("steps")[WRITE]}`;
      cont.addEventListener("click", () => goto(WRITE));
      extras.append(cont);
    }
    frag.append(st, navRow({ extra: extras, next: false }));
  }

  if (state.step === WRITE) {
    frag.append(rich(t("p4")), note(t("n4")));
    if (session.chipName) frag.append(deviceCard());
    const go = document.createElement("button");
    go.type = "button";
    go.className = "act";
    go.id = "flash-btn";
    go.textContent = t("write");
    go.disabled = !serialOk || state.busy;
    go.addEventListener("click", writeFirmware);
    frag.append(meterBox(t("ready")), consoleBox(), navRow({ extra: go, next: false }));
  }

  if (state.step === 5) {
    frag.append(rich(t("p5")), stepsList(t("s5")), note(t("n5")), navRow());
  }

  if (state.step === LAST) {
    frag.append(rich(t("p6")), stepsList(t("s6")), note(t("n6b")), navRow({ next: false }));
  }

  stage.replaceChildren(frag);
}

function render() {
  document.documentElement.lang = state.lang;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t("meta"));
  document.querySelector("[data-i18n=skip]").textContent = t("skip");
  document.querySelector("[data-i18n=source]").textContent = t("source");
  document.querySelector("[data-i18n=bins]").textContent = t("bins");
  const trouble = document.querySelector("[data-i18n=trouble]");
  if (trouble) trouble.textContent = t("trouble");
  document.getElementById("stepnav").setAttribute("aria-label", t("stepsNav"));
  document.querySelectorAll("[data-set-lang]").forEach((b) => {
    b.setAttribute("aria-pressed", b.dataset.setLang === state.lang ? "true" : "false");
    b.disabled = state.busy;
  });
  renderTrack();
  renderStage();
}

function setBusy(on, label) {
  state.busy = on;
  const btn = document.getElementById("flash-btn");
  if (btn) {
    btn.disabled = on || !serialOk;
    if (label) btn.textContent = label;
  }
  document.querySelectorAll("[data-set-lang]").forEach((b) => { b.disabled = on; });
  renderTrack();
}

function setStatus(text, kind) {
  const st = document.getElementById("flash-status");
  if (!st) return;
  st.className = "status" + (kind ? ` ${kind}` : "");
  st.textContent = text;
}

async function connect(force) {
  if (state.busy) return;
  setBusy(true, t("connecting"));
  setStatus(t("connecting"));
  try {
    setStatus(t("sync"));
    await openSession(force);
    setStatus(t("linked"), "ok");
    setBusy(false, t("reconnect"));
    await sleep(700);
    state.step = WRITE;
    writeUrl();
    render();
    stage.focus({ preventScroll: true });
  } catch (err) {
    await dropSession();
    const aborted = err?.abort || err?.name === "NotFoundError";
    setStatus(aborted ? t("abort") : t("fail"), "bad");
    logLine(String(err?.message || err), "bad");
    setBusy(false, t("connect"));
  }
}

async function writeFirmware() {
  if (state.busy) return;
  clearLog();
  setBar(0);
  setBusy(true, t("writing"));
  setStatus(t("sync"));
  try {
    if (!session.loader) {
      setStatus(t("connecting"));
      await openSession(false);
    }
    const path = FILES[session.imageKey];
    setStatus(t("fetch"));
    const data = await loadFirmware(path, setBar);
    logLine(fmtBytesLabel(data.byteLength));
    setStatus(t("writing"));
    const result = await writeImage(data, setBar);
    setBar(100);
    if (result && result.md5) logLine(`${t("verified")}  ${result.md5}`, "hi");
    state.flashed = true;
    sessionStorage.setItem("flashed", "1");
    setStatus(t("done"), "ok");
    logLine(t("done"), "hi");
    await dropSession();
    setBusy(false, t("write"));
    await sleep(800);
    state.step = 5;
    writeUrl();
    render();
    stage.focus({ preventScroll: true });
  } catch (err) {
    await dropSession();
    const aborted = err?.abort || err?.name === "NotFoundError";
    setStatus(aborted ? t("abort") : t("fail"), "bad");
    logLine(String(err?.message || err), "bad");
    setBusy(false, t("write"));
  }
}

let recovery = null;

function recoveryAction(kind) {
  if (recovery) recovery.close();

  if (kind === "connect") {
    state.step = CONNECT;
    writeUrl();
    render();
    connect(true);
    return;
  }

  if (kind === "reflash") {
    state.step = WRITE;
    writeUrl();
    render();
    document.getElementById("flash-btn")?.focus();
    return;
  }

  if (kind === "status" || kind === "selftest") {
    const page = kind === "status" ? "status.html" : "selftest.html";
    window.open(`http://192.168.4.1/${page}`, "_blank", "noopener");
    return;
  }

  if (kind === "copy") {
    copyLog();
    return;
  }

  if (kind === "restart") {
    sessionStorage.removeItem("flashed");
    state.flashed = false;
    dropSession();
    state.step = 0;
    writeUrl();
    render();
    stage.focus({ preventScroll: true });
  }
}

function buildRecovery() {
  const dialog = document.createElement("dialog");
  dialog.className = "recovery";
  dialog.setAttribute("aria-labelledby", "recovery-title");

  const title = document.createElement("h2");
  title.id = "recovery-title";
  title.textContent = t("recTitle");

  const lead = document.createElement("p");
  lead.textContent = t("recLead");

  const list = document.createElement("div");
  for (const section of t("recSections")) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = section.title;

    const body = document.createElement("div");
    body.className = "recovery-body";
    const text = document.createElement("p");
    text.textContent = section.body;
    body.append(text);

    if (section.steps && section.steps.length) {
      const ol = document.createElement("ol");
      ol.className = "list";
      section.steps.forEach((step, i) => {
        const li = document.createElement("li");
        const n = document.createElement("span");
        n.textContent = String(i + 1);
        const p = document.createElement("p");
        p.textContent = step;
        li.append(n, p);
        ol.append(li);
      });
      body.append(ol);
    }

    if (section.action) {
      const row = document.createElement("div");
      row.className = "row";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "act ghost";
      button.textContent = section.label;
      button.addEventListener("click", () => recoveryAction(section.action));
      row.append(button);
      body.append(row);
    }

    details.append(summary, body);
    list.append(details);
  }

  const foot = document.createElement("div");
  foot.className = "row";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "act";
  close.textContent = t("recClose");
  close.addEventListener("click", () => dialog.close());
  foot.append(close);

  dialog.append(title, lead, list, foot);
  return dialog;
}

function openRecovery() {
  if (recovery) recovery.remove();
  recovery = buildRecovery();
  document.body.append(recovery);
  recovery.showModal();
}

document.querySelectorAll("[data-set-lang]").forEach((b) => {
  b.addEventListener("click", () => setLang(b.dataset.setLang));
});
document.getElementById("recovery-btn")?.addEventListener("click", openRecovery);
window.addEventListener("popstate", () => { readUrl(); render(); });

readUrl();
writeUrl();
render();
