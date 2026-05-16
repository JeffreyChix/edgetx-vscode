"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Props {
  id: number;
  name: string;
  height?: number;
  onValue?: (value: number) => void;
}

export function PotSlider({ name, height = 80, onValue }: Props) {
  const [value, setValue] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  function getValueFromY(clientY: number): number {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, ratio));
    return Math.round(100 - clamped * 200);
  }

  const emit = useCallback(
    (val: number) => {
      setValue(val);
      onValue?.(val);
    },
    [onValue],
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      emit(getValueFromY(e.clientY));
    }
    function onMouseUp() {
      draggingRef.current = false;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [emit]);

  const nubPct = ((100 - value) / 200) * 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontSize: 8,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--sim-text-dimmer)",
        }}
      >
        {name}
      </span>
      <div
        ref={trackRef}
        style={{ position: "relative", width: 12, height, cursor: "ns-resize" }}
        onMouseDown={(e) => {
          draggingRef.current = true;
          emit(getValueFromY(e.clientY));
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          draggingRef.current = true;
          emit(getValueFromY(e.touches[0].clientY));
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          if (draggingRef.current) emit(getValueFromY(e.touches[0].clientY));
        }}
        onTouchEnd={() => {
          draggingRef.current = false;
        }}
      >
        {/* Track */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: 3,
            height,
            top: 0,
            borderRadius: 9999,
            background: "var(--sim-card)",
            border: "1px solid var(--sim-border)",
          }}
        />
        {/* Nub */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 12,
            height: 12,
            borderRadius: 9999,
            top: `${nubPct}%`,
            background: "var(--sim-border-light)",
            border: "1px solid var(--sim-text-dim)",
          }}
        />
      </div>
    </div>
  );
}
