import { isBoard } from "../firmware/catalog.js";
import { pickLang } from "../language/language.js";
import { state } from "./state.js";

// ?lang=es&board=s3 makes a link that opens on the right language and board.
// The last board picked is also remembered for the next visit.
export function readUrl() {
  const q = new URLSearchParams(location.search);
  let saved = null;
  try { saved = localStorage.getItem("board"); } catch { /* storage blocked */ }
  state.lang = pickLang(q.get("lang"), navigator.language);
  state.board = [q.get("board"), saved].find(isBoard) || "s2";
}

export function writeUrl() {
  const q = new URLSearchParams({ lang: state.lang, board: state.board });
  history.replaceState(null, "", `?${q}`);
  try { localStorage.setItem("board", state.board); } catch { /* storage blocked */ }
}
