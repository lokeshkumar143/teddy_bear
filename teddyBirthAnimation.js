/**
 * teddyBirthAnimation.js — The Teddy is Born
 * ============================================================================
 * Uses the existing TeddyAsciiRenderer, TeddyGeometry, TeddyCharacterParts,
 * TeddyLighting, TeddyCharacterAnimation systems to:
 * 1. Show a miniature glowing planet (circle) floating to center
 * 2. Animate glowing cracks across its surface
 * 3. The planet "cracks open" (split circle animation with light erupting)
 * 4. Particles stream upward and form the ASCII teddy bear shape
 * 5. ASCII teddy blooms in from 0% to 100% using existing bloomProgress
 * 6. Fires onBirthComplete() when done
 * ============================================================================
 */

class TeddyBirthAnimation {
  constructor(canvas, particleSystem, visitorName) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = particleSystem || null;
    this.width = canvas.width;
    this.height = canvas.height;
    this.time = 0;
    this.active = false;

    this.visitorName = visitorName || 'Someone Special';

    // Callbacks
    this.onBirthComplete = null;

    // ── Phase state machine ──────────────────────────────────────────────
    // Phases: 'idle' → 'approach' → 'crack' → 'burst' → 'bloom' → 'complete'
    this.phase = 'idle';
    this.phaseTime = 0;

    // Planet animation state
    this.planet = {
      x: this.width * 0.5,
      y: this.height * 0.15,       // starts at top
      targetX: this.width * 0.5,
      targetY: this.height * 0.42, // floats to center
      radius: 0,
      targetRadius: Math.min(this.width, this.height) * 0.12,
      hue: 270,
      alpha: 0,
      rotation: 0,
      cracks: [],
      crackProgress: 0,
      splitLeft: 0,   // left half x offset for split
      splitRight: 0,  // right half x offset
      burstAlpha: 0
    };

    // ASCII renderer subsystem
    this.geo = null;
    this.parts = null;
    this.lighting = null;
    this.anim = null;
    this.renderer = null;

    // Bloom progress fed into ASCII renderer
    this.bloomProgress = 0;
    this.isBloomed = false;

    this._initAsciiSystem();
    this._initCracks();
  }

  // ─── ASCII System Initialization ──────────────────────────────────────────

  _initAsciiSystem() {
    try {
      this.geo      = new TeddyGeometry();
      this.parts    = new TeddyCharacterParts();
      this.lighting = new TeddyLighting();
      this.anim     = new TeddyCharacterAnimation();
      this.anim.setName(this.visitorName);
      this.renderer = new TeddyAsciiRenderer(this.canvas, this.geo, this.parts, this.lighting, this.anim);
      this.renderer.setupCanvas(this.width, this.height);
    } catch (e) {
      console.warn('TeddyBirthAnimation: ASCII subsystem init failed:', e);
    }
  }

  _initCracks() {
    // Pre-generate crack line angles for the planet's surface
    const numCracks = 6;
    this.planet.cracks = Array.from({ length: numCracks }, (_, i) => {
      const baseAngle = (i / numCracks) * Math.PI * 2 + Math.random() * 0.5;
      return {
        angle: baseAngle,
        length: 0.4 + Math.random() * 0.5, // relative to radius
        width: 1.5 + Math.random() * 1.5,
        progress: 0, // 0→1
        delay: i * 0.12,
        glow: 1.0
      };
    });
  }

  // ─── Activation ───────────────────────────────────────────────────────────

  start(name) {
    if (name) this.visitorName = name;
    this.active = true;
    this.phase = 'approach';
    this.phaseTime = 0;
    this.bloomProgress = 0;
    this.isBloomed = false;

    // Update anim name
    if (this.anim) {
      this.anim.setName(this.visitorName);
    }

    // Reset planet
    this.planet.x = this.width * 0.5;
    this.planet.y = this.height * 0.1;
    this.planet.targetY = this.height * 0.42;
    this.planet.radius = 10;
    this.planet.targetRadius = Math.min(this.width, this.height) * 0.1;
    this.planet.alpha = 0;
    this.planet.crackProgress = 0;
    this.planet.splitLeft = 0;
    this.planet.splitRight = 0;
    this.planet.burstAlpha = 0;
    for (const c of this.planet.cracks) {
      c.progress = 0;
    }
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.planet.targetX = w * 0.5;
    this.planet.targetY = h * 0.42;
    if (this.renderer) {
      this.renderer.setupCanvas(w, h);
    }
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(dt) {
    this.time += dt;
    if (!this.active) return;

    this.phaseTime += dt;

    // Update animation state
    if (this.anim) {
      this.anim.update(dt);
    }

    switch (this.phase) {

      case 'approach': {
        // Phase 1: Planet floats in from top (1.5s)
        const t = Math.min(1, this.phaseTime / 1.5);
        const ease = this._easeOutCubic(t);
        this.planet.alpha = Math.min(1, t * 2);
        this.planet.y = this.planet.y + (this.planet.targetY - this.planet.y) * Math.min(1, dt * 2);
        this.planet.radius = this.planet.radius + (this.planet.targetRadius - this.planet.radius) * Math.min(1, dt * 2);
        this.planet.rotation += dt * 0.5;

        // Emit ambient particles around planet
        if (this.particles && Math.random() < dt * 10) {
          const angle = Math.random() * Math.PI * 2;
          const dist = this.planet.radius + Math.random() * 20;
          this.particles.emit('dust', this.planet.x + Math.cos(angle) * dist, this.planet.y + Math.sin(angle) * dist, { count: 1, speed: 0.3 });
        }

        if (t >= 1) {
          this.phase = 'crack';
          this.phaseTime = 0;
        }
        break;
      }

      case 'crack': {
        // Phase 2: Cracks appear on surface (1.8s)
        const totalDuration = 1.8;
        this.planet.crackProgress = Math.min(1, this.phaseTime / totalDuration);
        this.planet.rotation += dt * 0.3;

        for (const crack of this.planet.cracks) {
          const effectiveT = Math.max(0, this.planet.crackProgress - crack.delay) / (1 - crack.delay);
          crack.progress = Math.min(1, effectiveT * 1.5);
          // Emit light particles from crack tips
          if (crack.progress > 0.1 && crack.progress < 0.95 && this.particles && Math.random() < dt * 5) {
            const tipX = this.planet.x + Math.cos(crack.angle) * crack.progress * crack.length * this.planet.radius;
            const tipY = this.planet.y + Math.sin(crack.angle) * crack.progress * crack.length * this.planet.radius;
            this.particles.emit('sparks', tipX, tipY, { count: 1, speed: 1.5, color: [255, 220, 150] });
          }
        }

        if (this.planet.crackProgress >= 1) {
          this.phase = 'burst';
          this.phaseTime = 0;
        }
        break;
      }

      case 'burst': {
        // Phase 3: Planet bursts open (1.0s)
        const t = Math.min(1, this.phaseTime / 1.0);
        this.planet.splitLeft  = -this._easeOutCubic(t) * this.planet.radius * 1.5;
        this.planet.splitRight =  this._easeOutCubic(t) * this.planet.radius * 1.5;
        this.planet.burstAlpha = Math.sin(t * Math.PI) * 0.9;
        this.planet.alpha = Math.max(0, 1 - t * 1.2);

        // Massive particle burst
        if (t > 0 && t < 0.3 && this.particles) {
          if (Math.random() < dt * 60) {
            this.particles.emitTeddyBirth(this.planet.x, this.planet.y);
          }
        }

        // Upward stream of particles
        if (this.particles && t > 0.1 && t < 0.9) {
          if (Math.random() < dt * 30) {
            this.particles.emit('embers', this.planet.x + (Math.random() - 0.5) * 40, this.planet.y, {
              count: 1, speed: 3 + Math.random() * 2
            });
            this.particles.emit('trails', this.planet.x, this.planet.y, {
              count: 1, speed: 2
            });
          }
        }

        if (t >= 1) {
          this.phase = 'bloom';
          this.phaseTime = 0;
          // Now start the ASCII bloom
          this.bloomProgress = 0;
        }
        break;
      }

      case 'bloom': {
        // Phase 4: ASCII teddy blooms in (3.5s)
        const bloomDuration = 3.5;
        this.bloomProgress = Math.min(1, this.phaseTime / bloomDuration);

        // Emit ambient particles during bloom
        if (this.particles && this.bloomProgress < 0.9) {
          if (Math.random() < dt * 8) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 60;
            this.particles.emit('dust', this.width * 0.5 + Math.cos(angle) * dist, this.height * 0.42 + Math.sin(angle) * dist, { count: 1 });
          }
        }

        if (this.bloomProgress >= 1) {
          this.isBloomed = true;
          this.phase = 'complete';
          this.phaseTime = 0;
          if (this.onBirthComplete) {
            setTimeout(() => this.onBirthComplete(), 800);
          }
        }
        break;
      }

      case 'complete': {
        // Keep animating
        this.bloomProgress = 1;
        this.isBloomed = true;
        break;
      }
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  render() {
    if (!this.active) return;
    const ctx = this.ctx;

    switch (this.phase) {
      case 'approach':
      case 'crack':
        this._drawPlanet(ctx);
        break;

      case 'burst':
        this._drawPlanetBurst(ctx);
        this._drawBurstFlash(ctx);
        break;

      case 'bloom':
      case 'complete':
        this._drawAsciiTeddy(ctx);
        break;
    }
  }

  _drawPlanet(ctx) {
    const p = this.planet;
    if (p.alpha < 0.01) return;

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    // Outer aura
    const aura = ctx.createRadialGradient(0, 0, p.radius * 0.7, 0, 0, p.radius * 2.8);
    aura.addColorStop(0, `hsla(${p.hue}, 80%, 60%, 0.15)`);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Planet body
    const bodyGrad = ctx.createRadialGradient(-p.radius * 0.3, -p.radius * 0.3, 0, 0, 0, p.radius);
    bodyGrad.addColorStop(0, `hsla(${p.hue + 30}, 90%, 85%, 1)`);
    bodyGrad.addColorStop(0.55, `hsla(${p.hue}, 70%, 60%, 1)`);
    bodyGrad.addColorStop(1, `hsla(${p.hue - 20}, 60%, 40%, 1)`);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Surface banding
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let band = -2; band <= 2; band++) {
      ctx.fillRect(-p.radius, band * p.radius * 0.35 - p.radius * 0.07, p.radius * 2, p.radius * 0.14);
    }
    ctx.restore();

    // Specular
    const specGrad = ctx.createRadialGradient(-p.radius * 0.35, -p.radius * 0.35, 0, -p.radius * 0.2, -p.radius * 0.2, p.radius * 0.6);
    specGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
    specGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ring
    ctx.save();
    ctx.scale(1, 0.3);
    ctx.strokeStyle = `hsla(${p.hue}, 70%, 75%, 0.4)`;
    ctx.lineWidth = p.radius * 0.22;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 1.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw cracks
    for (const crack of p.cracks) {
      if (crack.progress < 0.01) continue;
      const len = crack.progress * crack.length * p.radius;
      const ex = Math.cos(crack.angle) * len;
      const ey = Math.sin(crack.angle) * len;

      // Glow
      ctx.save();
      ctx.shadowColor = 'rgba(255, 220, 100, 0.9)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = `rgba(255, 240, 180, ${crack.progress * 0.9})`;
      ctx.lineWidth = crack.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Jagged crack using a simple midpoint offset
      const mx = ex * 0.5 + (Math.random() - 0.5) * p.radius * 0.1;
      const my = ey * 0.5 + (Math.random() - 0.5) * p.radius * 0.1;
      ctx.quadraticCurveTo(mx, my, ex, ey);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _drawPlanetBurst(ctx) {
    const p = this.planet;
    if (p.alpha < 0.01 && p.splitLeft === 0) return;

    ctx.save();

    // Left half falling away
    if (Math.abs(p.splitLeft) > 0.5) {
      ctx.save();
      ctx.translate(p.x + p.splitLeft, p.y + Math.abs(p.splitLeft) * 0.3);
      ctx.rotate(-p.splitLeft * 0.01);
      ctx.globalAlpha = p.alpha;

      // Clip to left semicircle
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, Math.PI * 0.5, Math.PI * 1.5);
      ctx.closePath();
      ctx.clip();

      const bodyGrad = ctx.createRadialGradient(-p.radius * 0.3, -p.radius * 0.3, 0, 0, 0, p.radius);
      bodyGrad.addColorStop(0, `hsla(${p.hue + 30}, 90%, 85%, 1)`);
      bodyGrad.addColorStop(1, `hsla(${p.hue - 20}, 60%, 40%, 1)`);
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
      ctx.restore();
      ctx.restore();
    }

    // Right half falling away
    if (p.splitRight > 0.5) {
      ctx.save();
      ctx.translate(p.x + p.splitRight, p.y + p.splitRight * 0.3);
      ctx.rotate(p.splitRight * 0.01);
      ctx.globalAlpha = p.alpha;

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.clip();

      const bodyGrad = ctx.createRadialGradient(-p.radius * 0.3, -p.radius * 0.3, 0, 0, 0, p.radius);
      bodyGrad.addColorStop(0, `hsla(${p.hue + 30}, 90%, 85%, 1)`);
      bodyGrad.addColorStop(1, `hsla(${p.hue - 20}, 60%, 40%, 1)`);
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
      ctx.restore();
      ctx.restore();
    }

    ctx.restore();
  }

  _drawBurstFlash(ctx) {
    const p = this.planet;
    if (p.burstAlpha < 0.01) return;

    // Central explosion flash
    const burstGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
    burstGrad.addColorStop(0, `rgba(255, 255, 220, ${p.burstAlpha})`);
    burstGrad.addColorStop(0.3, `rgba(255, 200, 100, ${p.burstAlpha * 0.6})`);
    burstGrad.addColorStop(0.7, `rgba(200, 100, 255, ${p.burstAlpha * 0.3})`);
    burstGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Radial light rays
    const rays = 16;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const len = p.radius * (1.5 + Math.sin(this.time * 20 + i) * 0.5);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle + this.time * 2);
      const rayGrad = ctx.createLinearGradient(0, 0, len, 0);
      rayGrad.addColorStop(0, `rgba(255, 240, 200, ${p.burstAlpha * 0.8})`);
      rayGrad.addColorStop(1, 'rgba(255, 240, 200, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, -4 * p.burstAlpha);
      ctx.lineTo(len, 4 * p.burstAlpha);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  _drawAsciiTeddy(ctx) {
    if (!this.renderer) return;

    // The renderer draws stars / nebula / ASCII on the SAME canvas.
    // We pass our bloom progress to it.
    this.renderer.render(this.bloomProgress, this.isBloomed);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  destroy() {
    this.active = false;
  }
}

window.TeddyBirthAnimation = TeddyBirthAnimation;

