// Key constants matching hal/key_driver.h EnumKeys
export const KEY_MAP: Record<string, number> = {
  KEY_MENU: 0,
  KEY_EXIT: 1,
  KEY_ENTER: 2,
  KEY_PAGEUP: 3,
  KEY_PAGEDN: 4,
  KEY_UP: 5,
  KEY_DOWN: 6,
  KEY_LEFT: 7,
  KEY_RIGHT: 8,
  KEY_PLUS: 9,
  KEY_MINUS: 10,
  KEY_MODEL: 11,
  KEY_TELE: 12,
  KEY_SYS: 13,
  KEY_SHIFT: 14,
  KEY_BIND: 15,
};

export const KEYBOARD_MAP: Record<string, string> = {
  Escape: "KEY_EXIT",
  Enter: "KEY_ENTER",
  ArrowLeft: "KEY_LEFT",
  ArrowRight: "KEY_RIGHT",
  PageUp: "KEY_PAGEUP",
  PageDown: "KEY_PAGEDN",
  "+": "KEY_PLUS",
  "-": "KEY_MINUS",
  m: "KEY_MENU",
  s: "KEY_SYS",
  t: "KEY_TELE",
};
