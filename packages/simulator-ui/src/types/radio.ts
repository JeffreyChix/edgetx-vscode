export interface RadioDisplay {
  w: number;
  h: number;
  depth: number; // 1 = monochrome, 4 = grayscale, 16 = color RGB565
}

export interface RadioInput {
  name: string;
  type: "STICK" | "FLEX";
  label: string;
  default?: string; // POT | POT_CENTER | SLIDER | MULTIPOS | NONE
}

export interface RadioSwitch {
  name: string;
  type: "2POS" | "3POS";
  default: string; // 2POS | 3POS | TOGGLE | NONE
}

export interface RadioTrim {
  name: string;
}

export interface RadioKey {
  key: string; // KEY_MODEL | KEY_SYS | KEY_TELE | KEY_EXIT | KEY_ENTER | KEY_PAGEUP | KEY_PAGEDN | KEY_MENU
  label: string;
  side: "L" | "R";
}

export interface RadioProfile {
  name: string;
  wasm: string; // e.g. "edgetx-tx16s-simulator.wasm"
  display: RadioDisplay;
  inputs: RadioInput[];
  switches: RadioSwitch[];
  trims: RadioTrim[];
  keys: RadioKey[];
}

export type SwitchType = "3POS" | "2POS" | "MOMENT";
