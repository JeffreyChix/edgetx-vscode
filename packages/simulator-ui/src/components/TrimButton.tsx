'use client';

import { useState } from 'react';

interface Props {
  label: string;
  onPress: () => void;
  onRelease: () => void;
}

export function TrimButton({ label, onPress, onRelease }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      style={{
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        background: hovered ? 'var(--sim-border)' : 'var(--sim-card)',
        border: '1px solid var(--sim-border)',
        color: hovered ? 'var(--sim-text)' : 'var(--sim-text-dim)',
        fontSize: 10,
        fontFamily: 'monospace',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        transition: 'all 0.15s',
      }}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={() => { onRelease(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      onTouchStart={e => { e.preventDefault(); onPress(); }}
      onTouchEnd={e => { e.preventDefault(); onRelease(); }}
    >
      {label}
    </button>
  );
}
