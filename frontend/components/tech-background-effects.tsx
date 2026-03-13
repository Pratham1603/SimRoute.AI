"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight tech background effects: floating particles + moving grid.
 * GPU-friendly, no Three.js dependency.
 */
export default function TechBackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d"); // Combined null check for canvas and ctx
    if (!canvas || !ctx) return; // Explicitly return if canvas or ctx is null

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];
    let gridOffset = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);

      // Reinit particles on resize
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.4 - 0.2,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          color: ["#06b6d4", "#22d3ee", "#3b82f6", "#0ea5e9"][
            Math.floor(Math.random() * 4)
          ],
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!canvas || !ctx) return; // Added null check for canvas and ctx
      const w = canvas.offsetWidth; // Changed from canvas.width = window.innerWidth;
      const h = canvas.offsetHeight; // Changed from canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Grid
      const spacing = 60;
      gridOffset = (gridOffset + 0.3) % spacing;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
      ctx.lineWidth = 0.5;
      for (let x = -gridOffset; x < w + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = -gridOffset; y < h + spacing; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const [r, g, b] = [
          parseInt(p.color.slice(1, 3), 16),
          parseInt(p.color.slice(3, 5), 16),
          parseInt(p.color.slice(5, 7), 16),
        ];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
        ctx.fill();
      });

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
      className="fixed inset-0 w-full h-full -z-[1] pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
