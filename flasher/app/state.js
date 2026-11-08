// What the page is doing right now. Serial objects live in device/session.js.
// phase: idle | connecting | connected | installing | done | error
export const state = {
  lang: "en",
  board: "s2",
  phase: "idle",
  step: 0,     // open step: 0 board, 1 plug in, 2 install, 3 PS5
  reached: 0,  // furthest step unlocked
  busy: false,
  started: false, // the board rebooted into the new firmware on its own
  eraseAll: false,
  localFile: null, // { name, data }
  release: undefined, // undefined while loading, null when unknown
};
