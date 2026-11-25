import { boardArt } from "../boards/art.js";

// The board drawing. Redrawn only when the board changes, so running animations keep going.
export function renderArt(root, board) {
  if (root.dataset.board === board) return;
  root.dataset.board = board;
  root.innerHTML = boardArt(board);
}
