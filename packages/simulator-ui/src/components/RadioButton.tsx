"use client";

import { useRef, useState } from "react";

interface Props {
  btn: {
    label: string;
    key: number;
  };
  module: any;
}

export function RadioButtonWidget({ btn, module }: Props) {
  const pressedRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  function pressStart() {
    if (pressedRef.current) return;
    pressedRef.current = true;
    setActive(true);
    module?.simuSetKey?.(btn.key, 1);
  }

  function pressEnd() {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    setActive(false);
    module?.simuSetKey?.(btn.key, 0);
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
      {btn.label}
    </button>
  );
}
