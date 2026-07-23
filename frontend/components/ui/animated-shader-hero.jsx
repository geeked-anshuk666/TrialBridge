'use client';

import React, { useEffect, useRef } from 'react';

export default function AnimatedShaderHero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };
    window.addEventListener('resize', handleResize);

    // --- Starfield Initialization ---
    let stars = [];
    const NUM_STARS = Math.min(300, Math.floor((width * height) / 4500));

    const initStars = () => {
      stars = [];
      for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.8 + 0.2,
          baseAlpha: Math.random() * 0.7 + 0.2,
          twinkleSpeed: Math.random() * 0.04 + 0.01,
          phase: Math.random() * Math.PI * 2,
          color: Math.random() > 0.75 ? '#35d7ff' : Math.random() > 0.6 ? '#ff7a59' : '#ffffff',
        });
      }
    };
    initStars();

    // --- Shooting Stars System ---
    let shootingStars = [];
    let particles = [];

    class ShootingStar {
      constructor() {
        this.reset();
      }

      reset() {
        // Spawn from top or top-right/left edge
        this.x = Math.random() * width * 1.2 - width * 0.1;
        this.y = Math.random() * (height * 0.45);
        this.length = Math.random() * 160 + 120;
        this.speed = Math.random() * 12 + 10;
        // Direction angle: ~35 deg to 50 deg down-right or down-left
        this.angle = (Math.random() * 20 + 35) * (Math.PI / 180);
        this.dx = Math.cos(this.angle) * this.speed;
        this.dy = Math.sin(this.angle) * this.speed;

        this.headRadius = Math.random() * 1.8 + 1.2;
        this.life = 0;
        this.maxLife = Math.random() * 90 + 70;
        this.colorHead = '#ffffff';
        this.colorMid = Math.random() > 0.4 ? '#35d7ff' : '#64b5f6';
        this.colorTail = '#ff7a59';
        this.active = true;
      }

      update() {
        if (!this.active) return;
        this.x += this.dx;
        this.y += this.dy;
        this.life++;

        // Spawn trailing sparks at head
        if (Math.random() < 0.6) {
          particles.push({
            x: this.x + (Math.random() - 0.5) * 4,
            y: this.y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 1.5 - this.dx * 0.05,
            vy: (Math.random() - 0.5) * 1.5 - this.dy * 0.05,
            life: 0,
            maxLife: Math.random() * 25 + 15,
            size: Math.random() * 1.8 + 0.6,
            color: Math.random() > 0.5 ? '#35d7ff' : '#ff7a59',
          });
        }

        if (this.life >= this.maxLife || this.x > width + 200 || this.y > height + 200) {
          this.active = false;
        }
      }

      draw(c) {
        if (!this.active) return;

        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        // Gradient for shooting star trail
        const grad = c.createLinearGradient(this.x, this.y, tailX, tailY);
        const fadeInOut = Math.sin((this.life / this.maxLife) * Math.PI);
        const alpha = Math.min(1, fadeInOut * 1.3);

        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.15, `rgba(53, 215, 255, ${alpha * 0.85})`);
        grad.addColorStop(0.55, `rgba(255, 122, 89, ${alpha * 0.45})`);
        grad.addColorStop(1, 'rgba(255, 122, 89, 0)');

        c.save();
        c.lineWidth = this.headRadius * 1.5;
        c.lineCap = 'round';
        c.strokeStyle = grad;
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(tailX, tailY);
        c.stroke();

        // Glowing Head Halo
        c.beginPath();
        c.arc(this.x, this.y, this.headRadius * 2.8, 0, Math.PI * 2);
        c.fillStyle = `rgba(180, 240, 255, ${alpha * 0.6})`;
        c.fill();

        c.beginPath();
        c.arc(this.x, this.y, this.headRadius, 0, Math.PI * 2);
        c.fillStyle = '#ffffff';
        c.fill();
        c.restore();
      }
    }

    // Keep 3 shooting stars pool
    for (let i = 0; i < 3; i++) {
      const star = new ShootingStar();
      // Stagger initial start times
      star.life = Math.floor(Math.random() * star.maxLife * 0.7);
      shootingStars.push(star);
    }

    // --- Mouse Stardust Interactive Trail ---
    const pointer = { x: -1000, y: -1000 };
    const handlePointerMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      // Add cursor stardust
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: pointer.x + (Math.random() - 0.5) * 12,
          y: pointer.y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * -0.8 - 0.2,
          life: 0,
          maxLife: Math.random() * 30 + 20,
          size: Math.random() * 2 + 0.8,
          color: Math.random() > 0.5 ? '#35d7ff' : '#ffd486',
        });
      }
    };
    window.addEventListener('pointermove', handlePointerMove);

    // --- Main Render Loop ---
    let frameTime = 0;
    const render = () => {
      frameTime += 0.016;

      // 1. Draw Deep Space Background with Ambient Cosmic Glow
      ctx.fillStyle = '#060710';
      ctx.fillRect(0, 0, width, height);

      // Cyan nebula glow (top left)
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.25, 10, width * 0.2, height * 0.25, width * 0.5);
      grad1.addColorStop(0, 'rgba(30, 75, 140, 0.18)');
      grad1.addColorStop(0.6, 'rgba(15, 35, 75, 0.08)');
      grad1.addColorStop(1, 'rgba(6, 7, 16, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Warm Coral nebula glow (top right)
      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.35, 10, width * 0.8, height * 0.35, width * 0.55);
      grad2.addColorStop(0, 'rgba(140, 50, 70, 0.14)');
      grad2.addColorStop(0.6, 'rgba(60, 20, 40, 0.06)');
      grad2.addColorStop(1, 'rgba(6, 7, 16, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Twinkling Starfield
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.twinkleSpeed;
        const currentAlpha = Math.max(0.1, s.baseAlpha + Math.sin(s.phase) * 0.35);

        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Cross flare for larger bright stars
        if (s.radius > 1.7 && currentAlpha > 0.65) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.radius * 2.5, s.y);
          ctx.lineTo(s.x + s.radius * 2.5, s.y);
          ctx.moveTo(s.x, s.y - s.radius * 2.5);
          ctx.lineTo(s.x, s.y + s.radius * 2.5);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;

      // 3. Update & Draw Shooting Stars
      for (let i = 0; i < shootingStars.length; i++) {
        const star = shootingStars[i];
        if (!star.active) {
          star.reset();
        } else {
          star.update();
          star.draw(ctx);
        }
      }

      // 4. Update & Draw Particles (sparks + mouse stardust)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const pAlpha = 1 - p.life / p.maxLife;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, pAlpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pAlpha, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
