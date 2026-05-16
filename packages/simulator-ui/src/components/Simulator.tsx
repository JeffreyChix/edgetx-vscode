"use client";

import { useEffect, useRef } from "react";
import type { RadioProfile, RadioInput } from "../types/radio";
import { RadioScreen } from "./RadioScreen";
import { Joystick } from "./Joystick";
import { SwitchWidget } from "./SwitchWidget";
import { PotKnob } from "./PotKnob";
import { PotSlider } from "./PotSlider";
import { MultiPosSwitch } from "./MultiPosSwitch";
import { TrimButton } from "./TrimButton";
import { KEY_MAP, KEYBOARD_MAP } from "../data/keys";

interface FrameData {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  depth: number;
}

interface SimState {
  loading: boolean;
  error: string | null;
  progress: number;
  status: string;
}

interface Props {
  radio: RadioProfile;
  frameData: FrameData | null;
  simState: SimState;
  keyboardMode: "none" | "text" | "number";
  onInput: (msg: object) => void;
}

function toAdc(v: number): number {
  return Math.round((v + 1) * 2048);
}

function getStickIndices(inputs: RadioInput[]) {
  let lh = -1, lv = -1, rv = -1, rh = -1;
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type === "STICK") {
      if (inputs[i].name === "LH") lh = i;
      else if (inputs[i].name === "LV") lv = i;
      else if (inputs[i].name === "RV") rv = i;
      else if (inputs[i].name === "RH") rh = i;
    }
  }
  return { lh, lv, rv, rh };
}

function getVisibleSwitches(radio: RadioProfile) {
  return radio.switches
    .map((sw, index) => ({ sw, index }))
    .filter(({ sw }) => sw.default !== "NONE" && !sw.name.startsWith("SW"));
}

function getFlexInputs(radio: RadioProfile) {
  return radio.inputs
    .map((input, index) => ({ input, index }))
    .filter(
      ({ input }) =>
        input.type === "FLEX" && input.default && input.default !== "NONE",
    );
}

function getPots(radio: RadioProfile) {
  return getFlexInputs(radio).filter(
    ({ input }) => input.default === "POT" || input.default === "POT_CENTER",
  );
}

function getLeftPots(radio: RadioProfile) {
  const all = getPots(radio);
  return all.slice(0, Math.ceil(all.length / 2));
}

function getRightPots(radio: RadioProfile) {
  const all = getPots(radio);
  return all.slice(Math.ceil(all.length / 2));
}

function getSliders(radio: RadioProfile) {
  return getFlexInputs(radio).filter(({ input }) => input.default === "SLIDER");
}

export function Simulator({ radio, frameData, simState, keyboardMode, onInput }: Props) {
  const { loading, error, progress, status } = simState;

  const analogRef = useRef<number[]>([]);
  const switchRef = useRef<number[]>([]);

  // Initialize analog/switch state when frameData first arrives (sim is running)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (frameData && !initializedRef.current) {
      initializedRef.current = true;
      const inputs = radio.inputs;
      const si = getStickIndices(inputs);
      const thrIdx = si.lv;
      analogRef.current = inputs.map((input, i) => {
        if (input.default === "MULTIPOS") return 0;
        if (i === thrIdx) return 0;
        return 2048;
      });
      switchRef.current = radio.switches.map(() => -1);
      for (let i = 0; i < analogRef.current.length; i++) {
        onInput({ type: "simAnalog", index: i, value: analogRef.current[i] });
      }
      for (let i = 0; i < switchRef.current.length; i++) {
        onInput({ type: "simSwitch", index: i, state: switchRef.current[i] });
      }
    }
  }, [frameData, radio, onInput]);

  // Reset initialization flag when radio changes
  useEffect(() => {
    initializedRef.current = false;
  }, [radio.wasm]);

  // Keyboard and wheel input
  useEffect(() => {
    const ROTARY_ENCODER_GRANULARITY = 1;

    function handleKey(e: KeyboardEvent) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const down = e.type === "keydown";
      const textActive = keyboardMode === "text";
      const numberActive = keyboardMode === "number";

      if (textActive) {
        if (down) {
          if (e.key.length === 1) {
            const code = e.key.charCodeAt(0);
            if (code >= 32 && code < 127) {
              onInput({ type: "simChar", code });
              e.preventDefault();
              return;
            }
          }
          if (e.key === "Backspace") {
            onInput({ type: "simChar", code: 8 });
            e.preventDefault();
            return;
          }
          if (e.key === "Delete") {
            onInput({ type: "simChar", code: 127 });
            e.preventDefault();
            return;
          }
          if (e.key === "ArrowLeft") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEUP"] ?? 3, state: 1 });
            e.preventDefault();
            return;
          }
          if (e.key === "ArrowRight") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEDN"] ?? 4, state: 1 });
            e.preventDefault();
            return;
          }
          if (e.key === "Home") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEUP"] ?? 3, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEUP"] ?? 3, state: 0 }), 800);
            e.preventDefault();
            return;
          }
          if (e.key === "End") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEDN"] ?? 4, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEDN"] ?? 4, state: 0 }), 800);
            e.preventDefault();
            return;
          }
          if (e.key === "Enter") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_ENTER"] ?? 2, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_ENTER"] ?? 2, state: 0 }), 80);
            e.preventDefault();
            return;
          }
          if (e.key === "Escape") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_EXIT"] ?? 1, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_EXIT"] ?? 1, state: 0 }), 80);
            e.preventDefault();
            return;
          }
        } else {
          if (e.key === "ArrowLeft") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEUP"] ?? 3, state: 0 });
            e.preventDefault();
            return;
          }
          if (e.key === "ArrowRight") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEDN"] ?? 4, state: 0 });
            e.preventDefault();
            return;
          }
        }
        return;
      }

      if (numberActive) {
        if (down) {
          if (e.key === "ArrowUp") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEDN"] ?? 4, state: 1 });
            e.preventDefault();
            return;
          }
          if (e.key === "ArrowDown") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEUP"] ?? 3, state: 1 });
            e.preventDefault();
            return;
          }
          if (e.key === "+" || e.key === "=") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEDN"] ?? 4, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEDN"] ?? 4, state: 0 }), 80);
            e.preventDefault();
            return;
          }
          if (e.key === "-") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEUP"] ?? 3, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEUP"] ?? 3, state: 0 }), 80);
            e.preventDefault();
            return;
          }
          if (e.key === "PageUp") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_SYS"] ?? 13, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_SYS"] ?? 13, state: 0 }), 80);
            e.preventDefault();
            return;
          }
          if (e.key === "PageDown") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_MODEL"] ?? 11, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_MODEL"] ?? 11, state: 0 }), 80);
            e.preventDefault();
            return;
          }
          if (e.key === "Enter") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_ENTER"] ?? 2, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_ENTER"] ?? 2, state: 0 }), 80);
            e.preventDefault();
            return;
          }
          if (e.key === "Escape") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_EXIT"] ?? 1, state: 1 });
            setTimeout(() => onInput({ type: "simKey", key: KEY_MAP["KEY_EXIT"] ?? 1, state: 0 }), 80);
            e.preventDefault();
            return;
          }
        } else {
          if (e.key === "ArrowUp") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEDN"] ?? 4, state: 0 });
            e.preventDefault();
            return;
          }
          if (e.key === "ArrowDown") {
            onInput({ type: "simKey", key: KEY_MAP["KEY_PAGEUP"] ?? 3, state: 0 });
            e.preventDefault();
            return;
          }
        }
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (down) {
          onInput({
            type: "simRotary",
            steps: e.key === "ArrowUp" ? -ROTARY_ENCODER_GRANULARITY : ROTARY_ENCODER_GRANULARITY,
          });
        }
        e.preventDefault();
        return;
      }

      const keyName = KEYBOARD_MAP[e.key];
      if (!keyName) return;
      const idx = KEY_MAP[keyName] ?? 0;
      onInput({ type: "simKey", key: idx, state: down ? 1 : 0 });
      e.preventDefault();
    }

    function onWheel(e: WheelEvent) {
      if (keyboardMode === "text" || keyboardMode === "number") return;
      onInput({ type: "simRotary", steps: e.deltaY > 0 ? 1 : -1 });
    }

    document.addEventListener("keydown", handleKey);
    document.addEventListener("keyup", handleKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("keyup", handleKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [keyboardMode, onInput]);

  function updateAnalog(index: number, value: number) {
    const v = Math.round(Math.max(0, Math.min(4096, value)));
    analogRef.current[index] = v;
    onInput({ type: "simAnalog", index, value: v });
  }

  function updateSwitch(index: number, state: number) {
    switchRef.current[index] = state;
    onInput({ type: "simSwitch", index, state });
  }

  const si = getStickIndices(radio.inputs);
  const switches = getVisibleSwitches(radio);
  const leftPots = getLeftPots(radio);
  const rightPots = getRightPots(radio);
  const sliders = getSliders(radio);
  const leftKeys = radio.keys.filter((k) => k.side === "L");
  const rightKeys = radio.keys.filter((k) => k.side === "R");

  const springAnimations = useRef<Map<number, number>>(new Map());

  function springTo(index: number, target: number) {
    const existing = springAnimations.current.get(index);
    if (existing) cancelAnimationFrame(existing);
    let pos = analogRef.current[index] ?? 2048;
    let vel = 0;
    let prev = 0;
    const stiffness = 600;
    const damping = 25;
    const tick = (now: number) => {
      if (prev === 0) prev = now;
      const dt = Math.min((now - prev) / 1000, 0.033);
      prev = now;
      const force = (target - pos) * stiffness;
      vel = (vel + force * dt) * Math.exp(-damping * dt);
      pos += vel * dt;
      updateAnalog(index, Math.round(pos));
      if (Math.abs(pos - target) < 1 && Math.abs(vel) < 10) {
        updateAnalog(index, target);
        springAnimations.current.delete(index);
        return;
      }
      springAnimations.current.set(index, requestAnimationFrame(tick));
    };
    springAnimations.current.set(index, requestAnimationFrame(tick));
  }

  function applyGimbal(side: "left" | "right", nx: number, ny: number) {
    if (side === "left") {
      if (si.lh >= 0) updateAnalog(si.lh, toAdc(nx));
      if (si.lv >= 0) updateAnalog(si.lv, toAdc(-ny));
    } else {
      if (si.rh >= 0) updateAnalog(si.rh, toAdc(nx));
      if (si.rv >= 0) updateAnalog(si.rv, toAdc(-ny));
    }
  }

  function releaseGimbal(side: "left" | "right") {
    const thrIdx = si.lv;
    if (side === "left") {
      if (si.lh >= 0) springTo(si.lh, 2048);
      if (si.lv >= 0 && si.lv !== thrIdx) springTo(si.lv, 2048);
    } else {
      if (si.rh >= 0) springTo(si.rh, 2048);
      if (si.rv >= 0) springTo(si.rv, 2048);
    }
  }

  function displayMultiPosSwitch() {
    const multipos = getFlexInputs(radio).find(
      (p) => p.input.default === "MULTIPOS",
    );
    if (!multipos) return null;
    return (
      <MultiPosSwitch
        key={multipos.input.name}
        id={multipos.index}
        name={multipos.input.label}
        onValue={(pos) =>
          updateAnalog(multipos.index, Math.round((pos * 4096) / 5))
        }
      />
    );
  }

  function trimSwitchIndex(trimIndex: number, direction: "dec" | "inc"): number {
    const maxMain = Math.min(radio.trims.length, 4);
    const base = trimIndex < maxMain ? (maxMain - 1 - trimIndex) * 2 : trimIndex * 2;
    return base + (direction === "inc" ? 1 : 0);
  }

  function trimDown(trimIndex: number, direction: "dec" | "inc") {
    onInput({ type: "simTrim", trim: trimSwitchIndex(trimIndex, direction), state: 1 });
  }

  function trimUp(trimIndex: number, direction: "dec" | "inc") {
    onInput({ type: "simTrim", trim: trimSwitchIndex(trimIndex, direction), state: 0 });
  }

  const trimLabel = (label: string) => (
    <span style={{ fontSize: 8, color: "var(--sim-text-dimmer)" }}>
      {label}
    </span>
  );

  const trimGroup = (
    trimIndex: number,
    label: string,
    dir: "vertical" | "horizontal",
  ) => {
    if (dir === "vertical") {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <TrimButton
            label="+"
            onPress={() => trimDown(trimIndex, "inc")}
            onRelease={() => trimUp(trimIndex, "inc")}
          />
          {trimLabel(label)}
          <TrimButton
            label="-"
            onPress={() => trimDown(trimIndex, "dec")}
            onRelease={() => trimUp(trimIndex, "dec")}
          />
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <TrimButton
          label="-"
          onPress={() => trimDown(trimIndex, "dec")}
          onRelease={() => trimUp(trimIndex, "dec")}
        />
        {trimLabel(label)}
        <TrimButton
          label="+"
          onPress={() => trimDown(trimIndex, "inc")}
          onRelease={() => trimUp(trimIndex, "inc")}
        />
      </div>
    );
  };

  if (error) {
    return (
      <div
        style={{
          color: "var(--sim-danger)",
          fontSize: 14,
          fontFamily: "monospace",
          padding: 16,
        }}
      >
        Failed: {error}
      </div>
    );
  }

  // Show spinner while loading (before first frame arrives)
  const showLoading = loading || (!frameData && !error);

  return (
    <>
      {showLoading && (
        <div
          style={{
            marginTop: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <span
            style={{
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--sim-text-dim)",
            }}
          >
            {status || "Starting…"}
          </span>
          <div
            style={{
              width: 240,
              height: 3,
              background: "var(--sim-border)",
              borderRadius: 9999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--sim-accent)",
                borderRadius: 9999,
                transition: "width 0.2s",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              color: "var(--sim-text-dimmer)",
              letterSpacing: "0.05em",
            }}
          >
            {radio.name}
          </span>
        </div>
      )}

      {!showLoading && (
        <div
          style={{
            background: "var(--sim-card)",
            border: "1px solid var(--sim-border)",
            borderRadius: 22,
            padding: "24px 28px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                alignSelf: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--sim-text-dimmer)",
                }}
              >
                EdgeTX Simulator — {radio.name}
              </span>
              {keyboardMode !== "none" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <span style={{ fontSize: 8, color: "var(--sim-success)" }}>
                    ⌨
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(34,197,94,0.6)",
                    }}
                  >
                    {keyboardMode === "text"
                      ? "Type to edit"
                      : "Arrow keys to adjust"}
                  </span>
                </div>
              )}
            </div>
            {/* Switches */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {switches.map(({ sw, index }) => (
                <SwitchWidget
                  key={sw.name}
                  name={sw.name}
                  type={sw.default === "TOGGLE" ? "MOMENT" : sw.type}
                  onChange={(pos) => updateSwitch(index, pos)}
                />
              ))}
            </div>
          </div>

          {/* Main row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Left buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {leftKeys.map((k) => (
                <SimButton
                  key={k.key}
                  label={k.label}
                  keyIdx={KEY_MAP[k.key] ?? 0}
                  onInput={onInput}
                />
              ))}
            </div>

            {/* Left gimbal with trims */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {radio.trims.length >= 3 && trimGroup(2, "T3", "vertical")}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {radio.trims.length >= 5 && trimGroup(4, "T5", "horizontal")}
                <Joystick
                  springX
                  springY={false}
                  initialY={1}
                  size={110}
                  onInput={(nx, ny) => applyGimbal("left", nx, ny)}
                  onRelease={() => releaseGimbal("left")}
                />
                {radio.trims.length >= 4 && trimGroup(3, "T4", "horizontal")}
              </div>
            </div>

            {/* LS slider */}
            {sliders[0] && (
              <PotSlider
                id={sliders[0].index}
                name={sliders[0].input.label}
                onValue={(v) =>
                  updateAnalog(
                    sliders[0].index,
                    Math.round((v / 100 + 1) * 2048),
                  )
                }
              />
            )}

            {/* Left pots */}
            {leftPots.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {leftPots.map(({ input, index }) =>
                  input.default === "MULTIPOS" ? null : (
                    <PotKnob
                      key={input.name}
                      id={index}
                      name={input.label}
                      onValue={(v) =>
                        updateAnalog(index, Math.round((v / 100 + 1) * 2048))
                      }
                    />
                  ),
                )}
              </div>
            )}

            {/* Screen */}
            <div>
              <div style={{ marginBottom: 12 }}>{displayMultiPosSwitch()}</div>
              <div
                style={{
                  background: "var(--sim-bg)",
                  borderRadius: 8,
                  padding: 10,
                  boxShadow: "0 0 0 1px var(--sim-border)",
                }}
              >
                <RadioScreen
                  frameData={frameData}
                  width={radio.display.w}
                  height={radio.display.h}
                  depth={radio.display.depth}
                  onTouch={(x, y) => onInput({ type: "simTouch", x, y })}
                  onTouchUp={() => onInput({ type: "simTouchUp" })}
                />
              </div>
            </div>

            {/* Right pots */}
            {rightPots.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {rightPots.map(({ input, index }) =>
                  input.default === "MULTIPOS" ? null : (
                    <PotKnob
                      key={input.name}
                      id={index}
                      name={input.label}
                      onValue={(v) =>
                        updateAnalog(index, Math.round((v / 100 + 1) * 2048))
                      }
                    />
                  ),
                )}
              </div>
            )}

            {/* RS slider */}
            {sliders[1] && (
              <PotSlider
                id={sliders[1].index}
                name={sliders[1].input.label}
                onValue={(v) =>
                  updateAnalog(
                    sliders[1].index,
                    Math.round((v / 100 + 1) * 2048),
                  )
                }
              />
            )}

            {/* Right gimbal with trims */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {radio.trims.length >= 6 && trimGroup(5, "T6", "horizontal")}
                <Joystick
                  springX
                  springY
                  size={110}
                  onInput={(nx, ny) => applyGimbal("right", nx, ny)}
                  onRelease={() => releaseGimbal("right")}
                />
                {radio.trims.length >= 1 && trimGroup(0, "T1", "horizontal")}
              </div>
              {radio.trims.length >= 2 && trimGroup(1, "T2", "vertical")}
            </div>

            {/* Right buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rightKeys.map((k) => (
                <SimButton
                  key={k.key}
                  label={k.label}
                  keyIdx={KEY_MAP[k.key] ?? 0}
                  onInput={onInput}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// SimButton — replaces RadioButtonWidget, uses onInput instead of module
// ---------------------------------------------------------------------------

import { useRef as useButtonRef, useState } from "react";

interface SimButtonProps {
  label: string;
  keyIdx: number;
  onInput: (msg: object) => void;
}

function SimButton({ label, keyIdx, onInput }: SimButtonProps) {
  const pressedRef = useButtonRef(false);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  function pressStart() {
    if (pressedRef.current) return;
    pressedRef.current = true;
    setActive(true);
    onInput({ type: "simKey", key: keyIdx, state: 1 });
  }

  function pressEnd() {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    setActive(false);
    onInput({ type: "simKey", key: keyIdx, state: 0 });
  }

  return (
    <button
      style={{
        padding: "6px 12px",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        background: active
          ? "var(--sim-card)"
          : hovered
            ? "var(--sim-border)"
            : "#242424",
        border: `1px solid ${hovered ? "var(--sim-border-light)" : "var(--sim-border)"}`,
        borderRadius: 4,
        color: hovered ? "var(--sim-text)" : "var(--sim-text-dim)",
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseDown={pressStart}
      onMouseUp={pressEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        pressEnd();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        pressStart();
      }}
      onTouchEnd={pressEnd}
    >
      {label}
    </button>
  );
}
