'use client';

import { useRef, useEffect } from 'react';

interface Props {
  id: number;
  name: string;
  size?: number;
  onValue?: (value: number) => void;
}

export function PotKnob({ name, size = 40, onValue }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valueRef = useRef(0);
  const draggingRef = useRef(false);
  const lastYRef = useRef(0);

  function getThemeColors() {
    const el = document.body;
    const styles = getComputedStyle(el);
    return {
      card: styles.getPropertyValue('--sim-card').trim() || '#181818',
      border: styles.getPropertyValue('--sim-border').trim() || '#2c2c2c',
      accent: styles.getPropertyValue('--sim-accent').trim() || '#4a9eff',
    };
  }

  function draw() {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d')!;
    const CR = size / 2;
    const val = valueRef.current;
    const { card, border, accent } = getThemeColors();

    cx.clearRect(0, 0, size, size);

    cx.beginPath();
    cx.arc(CR, CR, CR - 2, 0, Math.PI * 2);
    cx.fillStyle = card;
    cx.fill();
    cx.strokeStyle = border;
    cx.lineWidth = 1.5;
    cx.stroke();

    const startAngle = Math.PI * 0.75;
    const endAngle = startAngle + (Math.PI * 1.5 * (val + 100)) / 200;
    cx.beginPath();
    cx.arc(CR, CR, CR - 5, startAngle, endAngle);
    cx.strokeStyle = accent;
    cx.lineWidth = 2;
    cx.stroke();

    const angle = startAngle + (Math.PI * 1.5 * (val + 100)) / 200;
    const dx = CR + (CR - 8) * Math.cos(angle);
    const dy = CR + (CR - 8) * Math.sin(angle);
    cx.beginPath();
    cx.arc(dx, dy, 2.5, 0, Math.PI * 2);
    cx.fillStyle = accent;
    cx.fill();
  }

  useEffect(() => { draw(); }, []);

  function onMouseDown(e: React.MouseEvent) {
    draggingRef.current = true;
    lastYRef.current = e.clientY;
  }

  function onMouseMove(e: MouseEvent) {
    if (!draggingRef.current) return;
    const dy = lastYRef.current - e.clientY;
    lastYRef.current = e.clientY;
    valueRef.current = Math.max(-100, Math.min(100, valueRef.current + dy * 2));
    onValue?.(valueRef.current);
    draw();
  }

  function onMouseUp() { draggingRef.current = false; }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onValue]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ cursor: 'ns-resize' }}
        onMouseDown={onMouseDown}
      />
      <span style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sim-text-dimmer)' }}>
        {name}
      </span>
    </div>
  );
}