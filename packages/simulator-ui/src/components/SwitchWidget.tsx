"use client";

import { useState } from "react";
import type { SwitchType } from "../types/radio";

interface Props {
  name: string;
  type: SwitchType;
  onChange: (pos: number) => void;
}

export function SwitchWidget({ name, type, onChange }: Props) {
  const [pos, setPos] = useState<number>(-1);

  const TRACK_H = 52;
  const NUB = 12;
  const TRAVEL = TRACK_H - NUB;

  function handlePress() {
    if (type === "MOMENT") {
      setPos(1);
      onChange(1);
      return;
    }
    if (type === "2POS") {
      const next = pos === -1 ? 1 : -1;
      setPos(next);
      onChange(next);
      return;
    }
    const next = pos === -1 ? 0 : pos === 0 ? 1 : -1;
    setPos(next);
    onChange(next);
  }

  function handleRelease() {
    if (type === "MOMENT") {
      setPos(-1);
      onChange(-1);
    }
  }

  function nubTop(): number {
    if (type === "2POS" || type === "MOMENT")
      return pos === -1 ? 4 : TRAVEL - 4;
    if (pos === -1) return 4;
    if (pos === 0) return (TRACK_H - NUB) / 2;
    return TRAVEL - 4;
  }

  function nubColor(): string {
    if (pos === -1) return "var(--sim-border-light)";
    if (pos === 0) return "#f5a623";
    return "var(--sim-accent)";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontSize: 9,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--sim-text-dimmer)",
        }}
      >
        {name}
      </span>
      <div
        style={{
          position: "relative",
          width: 18,
          height: TRACK_H,
          cursor: "pointer",
        }}
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={(e) => {
          e.preventDefault();
          handlePress();
        }}
        onTouchEnd={handleRelease}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9999,
            background: "#0f0f0f",
            border: "1px solid var(--sim-border)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: NUB,
            height: NUB,
            borderRadius: 9999,
            top: nubTop(),
            background: nubColor(),
            boxShadow: pos !== -1 ? `0 0 6px ${nubColor()}66` : "none",
            transition: "top 0.1s, background 0.1s",
          }}
        />
      </div>
    </div>
  );
}
