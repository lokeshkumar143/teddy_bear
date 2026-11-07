/**
 * Interactive 3D Celestial Gift Box & Unboxing Ceremony Controller
 * 
 * Features:
 * - Silky-smooth 3D mouse/touch parallax tilt with specular light reflection.
 * - Floating ambient stardust motes swirling around the present.
 * - Dramatic Unboxing Ceremony:
 *   1. Golden bow unties and bursts with sparkles.
 *   2. 3D box lid pops up and flips back, emitting radiant golden light rays.
 *   3. Colorful shower of floating hearts, confetti, and golden ASCII embers.
 *   4. Smooth callback to emerge the living ASCII Teddy Bear.
 * - Full reset capability for "Watch Again" replay.
 */

export class GiftBoxController {
  constructor(containerEl, sparkleCanvas, onOpened = null) {
    this.boxEl = containerEl;
    this.sparkleCanvas = sparkleCanvas;
    this.sparkleCtx = sparkleCanvas ? sparkleCanvas.getContext('2d') : null;
    this.onOpened = onOpened;

    this.isOpened = false;
    this.isAnimating = false;
    this.particles = [];
    this.animId = null;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.currentRotX = 0;
    this.currentRotY = 0;

    this.init();
  }

  init() {
    this.resize();
    this.bindEvents();
    this.startAmbientLoop();
  }

  resize() {
    if (!this.sparkleCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.sparkleCanvas.width = w * dpr;
    this.sparkleCanvas.height = h * dpr;
    this.sparkleCanvas.style.width = w + 'px';
    this.sparkleCanvas.style.height = h + 'px';

    this.cssW = w;
    this.cssH = h;
  }

  bindEvents() {
    if (typeof window === 'undefined') return;

    // Mouse / Touch 3D tilt tracking
    const onMove = (e) => {
      if (this.isOpened) return;
      const x = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const y = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (x === null || y === null) return;

      const normX = (x / window.innerWidth) * 2 - 1;
      const normY = (y / window.innerHeight) * 2 - 1;

      this.targetRotY = normX * 16;  // -16deg to +16deg
      this.targetRotX = -normY * 14; // -14deg to +14deg
    };

    const onLeave = () => {
      this.targetRotX = 0;
      this.targetRotY = 0;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('touchend', onLeave);
    window.addEventListener('resize', () => this.resize());
  }

  startAmbientLoop() {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      this.update(now / 1000, dt);
      this.render();

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  update(t, dt) {
    // Smooth lerping tilt for 3D box
    this.currentRotX += (this.targetRotX - this.currentRotX) * 0.12;
    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.12;

    if (this.boxEl && !this.isOpened) {
      const floatY = Math.sin(t * 2.0) * 8;
      this.boxEl.style.transform = `perspective(1000px) translateY(${floatY}px) rotateX(${this.currentRotX}deg) rotateY(${this.currentRotY}deg)`;
    }

    // Spawn ambient stardust around gift box
    if (!this.isOpened && this.particles.length < 35 && Math.random() < 0.28) {
      const cx = this.cssW * 0.5;
      const cy = this.cssH * 0.44;
      const ang = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 110;

      const chars = ['✦', '✧', '⋆', '·', '♡', '•'];
      this.particles.push({
        x: cx + Math.cos(ang) * dist,
        y: cy + Math.sin(ang) * dist,
        vx: (Math.random() - 0.5) * 25,
        vy: -15 - Math.random() * 30,
        char: chars[Math.floor(Math.random() * chars.length)],
        life: 0,
        maxLife: 1.2 + Math.random() * 1.0,
        color: Math.random() > 0.4 ? [255, 215, 110] : [255, 130, 175],
        size: 11 + Math.random() * 6
      });
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
    }
  }

  render() {
    if (!this.sparkleCtx || !this.sparkleCanvas) return;
    const ctx = this.sparkleCtx;
    const dpr = this.dpr || 1;

    ctx.clearRect(0, 0, this.sparkleCanvas.width, this.sparkleCanvas.height);

    for (const p of this.particles) {
      const k = 1.0 - (p.life / p.maxLife);
      const alpha = Math.sin(Math.PI * (p.life / p.maxLife)) * (p.isExplosion ? 0.95 : 0.85);
      const [r, g, b] = p.color;

      ctx.save();
      ctx.font = `bold ${Math.round(p.size * dpr)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
      if (p.isExplosion) {
        ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
        ctx.shadowBlur = 12 * dpr;
      }
      ctx.fillText(p.char, p.x * dpr, p.y * dpr);
      ctx.restore();
    }
  }

  // =========================================================================
  // Unboxing Ceremony: Bow pops, Lid lifts in 3D, Confetti & Hearts Erupt
  // =========================================================================
  openGift() {
    if (this.isOpened || this.isAnimating) return;
    this.isOpened = true;
    this.isAnimating = true;

    // Trigger visual CSS 3D opening states
    if (this.boxEl) {
      this.boxEl.classList.add('opening');
    }

    const cx = this.cssW * 0.5;
    const cy = this.cssH * 0.44;

    // Burst 110+ colorful floating hearts, golden stardust, and celebratory confetti
    const confettiChars = ['💖', '💕', '✨', '✦', '✧', '⋆', '🧸', '❤', '⭐', '🌸'];
    for (let i = 0; i < 110; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 380;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 50,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 110,
        gravity: 140,
        char: confettiChars[Math.floor(Math.random() * confettiChars.length)],
        life: 0,
        maxLife: 1.4 + Math.random() * 1.2,
        color: Math.random() > 0.45 ? [255, 60, 120] : [255, 215, 0],
        size: 14 + Math.random() * 10,
        isExplosion: true
      });
    }

    // Call onOpened callback to transition into Teddy emergence
    setTimeout(() => {
      if (this.onOpened) {
        this.onOpened();
      }
      this.isAnimating = false;
    }, 850);
  }

  reset() {
    this.isOpened = false;
    this.isAnimating = false;
    this.particles = [];
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.currentRotX = 0;
    this.currentRotY = 0;

    if (this.boxEl) {
      this.boxEl.classList.remove('opening');
      this.boxEl.style.transform = '';
    }
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.sparkleCtx && this.sparkleCanvas) {
      this.sparkleCtx.clearRect(0, 0, this.sparkleCanvas.width, this.sparkleCanvas.height);
    }
  }
}
