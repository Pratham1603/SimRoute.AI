"use client";

import { useEffect, useRef } from "react";

/**
 * Animated Canvas Background — renders a subtle terrain grid with
 * floating data particles and glowing route lines.
 * Designed to sit behind the hero section at low opacity.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let gridOffset = 0;

    // Responsive canvas sizing
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
      life: number;
      maxLife: number;
    }

    const colors = [
      "rgba(6, 182, 212, ",   // cyan
      "rgba(59, 130, 246, ",  // blue
      "rgba(249, 115, 22, ",  // orange
      "rgba(34, 197, 94, ",   // green
    ];

    // Spawn particles
    function spawnParticle(): Particle {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 300 + Math.random() * 400,
      };
    }

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      const p = spawnParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    function drawGrid() {
      if (!ctx || !canvas) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const spacing = 60;

      gridOffset = (gridOffset + 0.15) % spacing;

      ctx.strokeStyle = "rgba(6, 182, 212, 0.035)";
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (let x = gridOffset; x < w; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = gridOffset; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    function drawParticles() {
      if (!ctx || !canvas) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Fade in and out based on life
        const lifePct = p.life / p.maxLife;
        const fadeIn = Math.min(lifePct * 5, 1);
        const fadeOut = Math.max(1 - (lifePct - 0.8) * 5, 0);
        const alpha = p.opacity * fadeIn * (lifePct > 0.8 ? fadeOut : 1);

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ")";
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (alpha * 0.15) + ")";
        ctx.fill();

        // Reset if done or off-screen
        if (p.life >= p.maxLife || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          particles[i] = spawnParticle();
        }
      }

      // Draw connecting lines between nearby particles
      ctx.lineWidth = 0.3;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.08;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      drawGrid();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
