const BASE_TITLE = document.title;

function $(id) {
  return document.getElementById(id);
}

export function showProgress(label, pct) {
  const meter = $("meter");
  meter.hidden = false;
  meter.dataset.tone = "";
  $("phase").textContent = label;
  if (pct == null) {
    meter.dataset.indeterminate = "true";
    $("pct").textContent = "";
    return;
  }
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  meter.dataset.indeterminate = "false";
  $("bar").style.width = v + "%";
  $("pct").textContent = v + "%";
  document.title = `${v}% · ${BASE_TITLE}`;
}

export function endProgress(label, tone) {
  const meter = $("meter");
  meter.hidden = false;
  meter.dataset.indeterminate = "false";
  meter.dataset.tone = tone;
  $("phase").textContent = label;
  if (tone === "ok") {
    $("bar").style.width = "100%";
    $("pct").textContent = "100%";
  } else {
    $("pct").textContent = "";
  }
  document.title = BASE_TITLE;
}

export function hideProgress() {
  $("meter").hidden = true;
  $("bar").style.width = "0";
  document.title = BASE_TITLE;
}
