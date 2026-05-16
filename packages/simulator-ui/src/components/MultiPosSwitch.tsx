"use client";

import { useState } from "react";

interface Props {
  id: number;
  name: string;
  onValue?: (position: number) => void;
}

export function MultiPosSwitch({ name, onValue }: Props) {
  const [value, setValue] = useState(0);

  function select(pos: number) {
    setValue(pos);
    onValue?.(pos);
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
          display: "none",
          fontSize: 8,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--sim-text-dimmer)",
        }}
      >
        {name}
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3, 4, 5].map((pos) => (
          <button
            key={pos}
            onClick={() => select(pos)}
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              fontSize: 8,
              border: `1px solid ${value === pos ? "var(--sim-accent)" : "var(--sim-border)"}`,
              background:
                value === pos ? "var(--sim-accent-dim)" : "var(--sim-surface)",
              color:
                value === pos ? "var(--sim-accent)" : "var(--sim-text-dimmer)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {pos + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
