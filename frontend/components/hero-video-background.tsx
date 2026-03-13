"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic AI Background — SimRouteAI Offroad Semantic Scene Segmentation
 *
 * Supports two modes:
 * 1. Video: If /hero-bg.mp4 exists, plays it as a looping background.
 * 2. Canvas: Live-rendered animation with all effects (default).
 *
 * Renders a desert landscape with autonomous rover, semantic segmentation overlays,
 * and AI perception visualization effects. Designed for hero dashboard background.
 *
 * Features:
 * - Procedural desert terrain with dunes, rocks, vegetation
 * - Semi-transparent segmentation masks (Trees, Bushes, Grass, Rocks, etc.)
 * - Scanning grid, glowing boundaries, data particles
 * - Digital terrain grid, AI detection pulses
 * - ~11 second seamless loop, dark-gradient friendly
 */

const SEGMENTATION_CLASSES = [
  { name: "Dry Trees", color: "rgba(146, 64, 14, 0.35)", stroke: "rgba(146, 64, 14, 0.8)" },
  { name: "Sands", color: "rgba(234, 179, 8, 0.25)", stroke: "rgba(234, 179, 8, 0.6)" },
  { name: "Dry Brush", color: "rgba(120, 113, 108, 0.35)", stroke: "rgba(120, 113, 108, 0.7)" },
  { name: "Terrain", color: "rgba(249, 115, 22, 0.3)", stroke: "rgba(249, 115, 22, 0.6)" },
  { name: "Sky", color: "rgba(59, 130, 246, 0.15)", stroke: "rgba(59, 130, 246, 0.4)" },
  { name: "Rover Body", color: "rgba(15, 23, 42, 0.5)", stroke: "rgba(6, 182, 212, 0.7)" },
];

const LOOP_DURATION_MS = 7000; // Exact 7-second loop as requested

// Simplex-like noise for procedural terrain (simplified)
function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = noise2D(ix, iy);
  const b = noise2D(ix + 1, iy);
  const c = noise2D(ix, iy + 1);
  const d = noise2D(ix + 1, iy + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!ctx) return;

    let animationId: number;
    let startTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Data particles
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }> = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 2000 - 500,
        y: Math.random() * 1200 - 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: ["#06b6d4", "#3b82f6", "#22c55e", "#f97316"][Math.floor(Math.random() * 4)],
      });
    }

    // Segmentation region definitions (procedural blob positions - normalized 0-1)
    const segments = [
      { classIdx: 0, cx: 0.2, cy: 0.7, radius: 0.07, phase: 0 },      // Dry Trees
      { classIdx: 0, cx: 0.4, cy: 0.65, radius: 0.06, phase: 0.2 },
      { classIdx: 0, cx: 0.7, cy: 0.72, radius: 0.08, phase: 0.4 },
      { classIdx: 2, cx: 0.15, cy: 0.85, radius: 0.04, phase: 0.1 },    // Dry Brush
      { classIdx: 2, cx: 0.55, cy: 0.82, radius: 0.05, phase: 0.3 },
      { classIdx: 1, cx: 0.3, cy: 0.9, radius: 0.4, phase: 0 },         // Sands
      { classIdx: 4, cx: 0.5, cy: 0.3, radius: 0.6, phase: 0 },         // Sky
    ];

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const t = ((performance.now() - startTime) % LOOP_DURATION_MS) / LOOP_DURATION_MS;
      const tRad = t * Math.PI * 2;

      // Camera drift (slow drone movement)
      const camX = Math.sin(t * Math.PI * 2) * w * 0.02;
      const camY = Math.cos(t * 0.7 * Math.PI * 2) * h * 0.015;

      ctx.save();
      ctx.translate(camX, camY);

      // ─── Base: Transparent (Using image from landing-page) ───
      ctx.clearRect(0, 0, w, h);

      // (Dune/Sky rendering removed to use the photo background)

      // ─── Digital terrain grid overlay ───
      const gridSpacing = 45;
      const gridOffset = (t * gridSpacing * 2) % gridSpacing;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.06)";
      ctx.lineWidth = 0.5;
      for (let x = -gridOffset; x < w + gridSpacing; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = -gridOffset; y < h + gridSpacing; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ─── Semantic segmentation overlays (semi-transparent masks) ───
      segments.forEach((seg, i) => {
        const cls = SEGMENTATION_CLASSES[seg.classIdx];
        const pulse = 0.85 + Math.sin(tRad + seg.phase * Math.PI * 2) * 0.15;
        const cx = seg.cx * w;
        const cy = seg.cy * h;
        const r = seg.radius * Math.max(w, h) * pulse;

        // Glowing boundary
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.strokeStyle = cls.stroke;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4 + Math.sin(tRad * 2 + i) * 0.1;
        ctx.stroke();

        // Fill
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = cls.color;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Label (every few segments, subtle)
        if (i % 3 === 0 && seg.classIdx < 8) {
          ctx.font = "10px 'SF Mono', Monaco, monospace";
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.textAlign = "center";
          ctx.fillText(SEGMENTATION_CLASSES[seg.classIdx].name, cx, cy + 4);
        }
      });

      // ─── Rover (simplified geometric rover moving across) ───
      const roverX = (0.2 + t * 0.65) * w;
      const roverY = h - 120 - Math.sin(t * Math.PI * 4) * 8;
      ctx.save();
      ctx.translate(roverX, roverY);

      // Rover shadow
      ctx.beginPath();
      ctx.ellipse(0, 25, 35, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fill();

      // Rover body
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-28, -12, 56, 24, 4);
      ctx.fill();
      ctx.stroke();

      // Rover cab/sensor
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-12, -20, 24, 12);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
      ctx.strokeRect(-12, -20, 24, 12);

      // Sensor glow
      ctx.beginPath();
      ctx.arc(0, -14, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(6, 182, 212, 0.8)";
      ctx.fill();

      // Wheels
      ctx.fillStyle = "#334155";
      [-18, 0, 18].forEach((ox) => {
        ctx.fillRect(ox - 4, 10, 8, 10);
      });
      ctx.restore();

      // ─── Dual Scanning Lines (Blue and Red) ───
      const scanT = (t * 1.5) % 1;
      
      // Blue Scan (Primary Horizontal)
      const blueScanY = scanT * h;
      const blueGrad = ctx.createLinearGradient(0, blueScanY - 40, 0, blueScanY + 40);
      blueGrad.addColorStop(0, "transparent");
      blueGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.4)");
      blueGrad.addColorStop(1, "transparent");
      ctx.fillStyle = blueGrad;
      ctx.fillRect(0, blueScanY - 40, w, 80);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, blueScanY);
      ctx.lineTo(w, blueScanY);
      ctx.stroke();

      // Red Scan (Delayed/Offset Horizontal)
      const redScanT = (scanT + 0.3) % 1;
      const redScanY = redScanT * h;
      const redGrad = ctx.createLinearGradient(0, redScanY - 30, 0, redScanY + 30);
      redGrad.addColorStop(0, "transparent");
      redGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.3)");
      redGrad.addColorStop(1, "transparent");
      ctx.fillStyle = redGrad;
      ctx.fillRect(0, redScanY - 30, w, 60);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, redScanY);
      ctx.lineTo(w, redScanY);
      ctx.stroke();

      // ─── AI detection pulses (expanding circles from rover) ───
      for (let i = 0; i < 3; i++) {
        const pulseT = (t + i * 0.33) % 1;
        const pulseR = pulseT * 150;
        const alpha = (1 - pulseT) * 0.15;
        ctx.beginPath();
        ctx.arc(roverX, roverY, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? `rgba(6, 182, 212, ${alpha})` : `rgba(239, 68, 68, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // ─── Data particles ───
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;

        const flicker = 0.7 + Math.sin(tRad + p.x * 0.01) * 0.3;
        const alpha = p.opacity * flicker;
        const r = parseInt(p.color.slice(1, 3), 16);
        const g = parseInt(p.color.slice(3, 5), 16);
        const b = parseInt(p.color.slice(5, 7), 16);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      });

      // ─── Holographic terrain mapping (subtle corner brackets) ───
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 1;
      const bracketSize = 40;
      [[20, 20], [w - 20, 20], [w - 20, h - 20], [20, h - 20]].forEach(([bx, by], i) => {
        ctx.beginPath();
        if (i === 0) {
          ctx.moveTo(bx, by + bracketSize);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + bracketSize, by);
        } else if (i === 1) {
          ctx.moveTo(bx - bracketSize, by);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx, by + bracketSize);
        } else if (i === 2) {
          ctx.moveTo(bx, by - bracketSize);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx - bracketSize, by);
        } else {
          ctx.moveTo(bx + bracketSize, by);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx, by - bracketSize);
        }
        ctx.stroke();
      });

      ctx.restore();

      // (Dark/Vignette overlays removed to use CSS-based layering in landing-page)

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      style={{
        filter: "blur(0.5px) saturate(1.05) contrast(1.02)",
        opacity: 0.95,
      }}
    />
  );
}

export default function HeroVideoBackground() {
  const [useVideo, setUseVideo] = useState<boolean | null>(null);

  // Pre-rendered video from: python scripts/generate_hero_video.py
  // Canvas shows immediately; switches to video when loaded (or stays on canvas if 404)
  return (
    <>
      {useVideo !== true && <CanvasBackground />}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
        style={{
          opacity: useVideo === true ? 0.95 : 0,
          visibility: useVideo === true ? "visible" : "hidden",
        }}
        onError={() => setUseVideo(false)}
        onLoadedData={() => setUseVideo(true)}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
    </>
  );
}
