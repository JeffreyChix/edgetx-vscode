'use client';

import { useEffect, useRef } from 'react';

interface Props {
  springX?: boolean;
  springY?: boolean;
  size?: number;
  onInput: (nx: number, ny: number) => void;
  onRelease: () => void;
  initialY?: number;
}

export function Joystick({
  springX = true,
  springY = true,
  size = 130,
  initialY = 0,
  onInput,
  onRelease,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ nx: 0, ny: initialY, live: false });

  useEffect(() => {
    const cv = canvasRef.current!;
    const cx = cv.getContext('2d')!;
    const CR = size / 2;
    const HR = 20;
    const MAX = CR - HR - 8;
    const state = stateRef.current;

    function getThemeColors() {
      const styles = getComputedStyle(document.body);
      return {
        card: styles.getPropertyValue('--sim-card').trim() || '#181818',
        border: styles.getPropertyValue('--sim-border').trim() || '#2c2c2c',
        borderLight: styles.getPropertyValue('--sim-border-light').trim() || '#333',
      };
    }

    function paint() {
      const { card, border, borderLight } = getThemeColors();
      cx.clearRect(0, 0, size, size);

      // Outer plate
      cx.beginPath();
      cx.arc(CR, CR, CR - 2, 0, Math.PI * 2);
      cx.fillStyle = card;
      cx.fill();
      cx.strokeStyle = border;
      cx.lineWidth = 1.5;
      cx.stroke();

      // Gate ring
      cx.beginPath();
      cx.arc(CR, CR, MAX + HR + 4, 0, Math.PI * 2);
      cx.strokeStyle = borderLight;
      cx.lineWidth = 1;
      cx.stroke();

      // Crosshair
      cx.strokeStyle = borderLight;
      cx.lineWidth = 1;
      cx.beginPath();
      cx.moveTo(CR, 8);
      cx.lineTo(CR, size - 8);
      cx.moveTo(8, CR);
      cx.lineTo(size - 8, CR);
      cx.stroke();

      // Handle
      const hx = CR + state.nx * MAX;
      const hy = CR + state.ny * MAX;
      const g = cx.createRadialGradient(hx - 4, hy - 5, 2, hx, hy, HR);
      g.addColorStop(0, state.live ? '#7ab4cc' : '#5a5a5a');
      g.addColorStop(1, state.live ? '#2a4d66' : '#252525');

      cx.beginPath();
      cx.arc(hx, hy, HR, 0, Math.PI * 2);
      cx.fillStyle = g;
      cx.fill();
      cx.strokeStyle = state.live ? '#4a8aaa' : '#383838';
      cx.lineWidth = 1.5;
      cx.stroke();
    }

    function getXY(e: MouseEvent | TouchEvent): [number, number] {
      const r = cv.getBoundingClientRect();
      const sx = size / r.width;
      const sy = size / r.height;
      const s = 'touches' in e ? e.touches[0] : e;
      return [(s.clientX - r.left) * sx, (s.clientY - r.top) * sy];
    }

    function move(px: number, py: number) {
      let dx = (px - CR) / MAX;
      let dy = (py - CR) / MAX;
      const d = Math.hypot(dx, dy);
      if (d > 1) { dx /= d; dy /= d; }
      state.nx = dx;
      state.ny = dy;
      paint();
      onInput(state.nx, state.ny);
    }

    function release() {
      if (!state.live) return;
      state.live = false;
      if (springX) state.nx = 0;
      if (springY) state.ny = 0;
      paint();
      onInput(state.nx, state.ny);
      onRelease?.();
    }

    function onMouseDown(e: MouseEvent) { state.live = true; move(...getXY(e)); }
    function onMouseMove(e: MouseEvent) { if (state.live) move(...getXY(e)); }
    function onTouchStart(e: TouchEvent) { e.preventDefault(); state.live = true; move(...getXY(e)); }
    function onTouchMove(e: TouchEvent) { e.preventDefault(); if (state.live) move(...getXY(e)); }

    cv.addEventListener('mousedown', onMouseDown);
    cv.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', release);
    window.addEventListener('touchend', release);

    paint();

    return () => {
      cv.removeEventListener('mousedown', onMouseDown);
      cv.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', release);
      window.removeEventListener('touchend', release);
    };
  }, [size, springX, springY, onInput, onRelease]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: 'block', cursor: 'crosshair', touchAction: 'none' }}
    />
  );
}