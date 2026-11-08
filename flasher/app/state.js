// What the page is doing right now. Serial objects live in device/session.js.
// phase: idle | connecting | connected | installing | done | error
export const state = {
  lang: "en",
  board: "s2",
  phase: "idle",
  busy: false,
  eraseAll: false,
  localFile: null, // { name, data }
  release: undefined, // undefined while loading, null when unknown
};
