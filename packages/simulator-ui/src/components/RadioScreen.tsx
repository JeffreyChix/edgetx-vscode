"use client";

import { useEffect, useRef } from "react";
import { LcdRenderer } from "../lib/lcd-renderer";

interface FrameData {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  depth: number;
}

interface Props {
  frameData: FrameData | null;
  width: number;
  height: number;
  depth: number;
  onTouch?: (x: number, y: number) => void;
  onTouchUp?: () => void;
  maxWidth?: number;
}

export function RadioScreen({ frameData, width, height, depth, onTouch, onTouchUp, maxWidth }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<LcdRenderer | null>(null);

  const naturalWidth = Math.max(width, (150 * width) / height, 320);
  const cssWidth = maxWidth ? Math.min(naturalWidth, maxWidth) : naturalWidth;
  const cssHeight = (cssWidth * height) / width;

  // Set up canvas, renderer, and touch/mouse handlers once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new LcdRenderer(canvas);
    rendererRef.current = renderer;

    const dpr = window.devicePixelRatio || 1;
    const canvasW = Math.round(cssWidth * dpr);
    const canvasH = Math.round(cssHeight * dpr);
    renderer.resize(canvasW, canvasH);

    function lcdXY(clientX: number, clientY: number): [number, number] {
      const rect = canvas!.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      return [
        Math.round(Math.max(0, Math.min(width - 1, (clientX - rect.left) * scaleX))),
        Math.round(Math.max(0, Math.min(height - 1, (clientY - rect.top) * scaleY))),
      ];
    }

    function onMouseDown(e: MouseEvent) {
      const [x, y] = lcdXY(e.clientX, e.clientY);
      onTouch?.(x, y);
      const onMove = (ev: MouseEvent) => {
        const [mx, my] = lcdXY(ev.clientX, ev.clientY);
        onTouch?.(mx, my);
      };
      const onUp = () => {
        onTouchUp?.();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const [x, y] = lcdXY(e.touches[0].clientX, e.touches[0].clientY);
      onTouch?.(x, y);
      const onMove = (ev: TouchEvent) => {
        ev.preventDefault();
        const [mx, my] = lcdXY(ev.touches[0].clientX, ev.touches[0].clientY);
        onTouch?.(mx, my);
      };
      const onEnd = () => {
        onTouchUp?.();
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onEnd);
    }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("touchstart", onTouchStart);
    };
  }, [width, height, depth, cssWidth, cssHeight, onTouch, onTouchUp]);

  // Render whenever frameData changes
  useEffect(() => {
    if (!frameData || !rendererRef.current) return;
    rendererRef.current.render(
      new Uint8Array(frameData.buffer),
      frameData.width,
      frameData.height,
      frameData.depth,
    );
  }, [frameData]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: cssWidth,
        height: cssHeight,
        imageRendering: "pixelated",
        display: "block",
        cursor: "crosshair",
        background: depth > 0 && depth < 16 ? "rgb(47, 123, 227)" : "#000",
      }}
    />
  );
}
