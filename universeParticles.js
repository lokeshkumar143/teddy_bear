/**
 * universeParticles.js — Ambient Particle System
 * ============================================================================
 * - Manages pools of: dust, sparks, trails, embers, petals, starbursts
 * - Emitter API: emit(type, x, y, options)
 * - Each particle type has unique physics: gravity, wind, drag, bounce
 * - Pooled for zero-allocation steady state
 * - Integrates with main canvas draw call
 * ============================================================================
 */

class UniverseParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.time = 0;

    // Pool sizes per type
    this.POOL_SIZE = {
      dust:       120,
      sparks:      80,
      trails:      60,
      embers:      80,
      petals:      40,
      starbursts:  60
    };

    // Active particles
    this.pools = {};
    for (const type of Object.keys(this.POOL_SIZE)) {
      this.pools[type] = [];
      for (let i = 0; i < this.POOL_SIZE[type]; i++) {
        this.pools[type].push(this._createParticle(type));
      }
    }

    // Active list (live particles drawn each frame)
    this.active = [];
  }

  // ─── Particle Factory ─────────────────────────────────────────────────────

  _createParticle(type) {
    return {
      type,
      alive: false,
      x: 0, y: 0,
      vx: 0, vy: 0,
      life: 0,      // 0→1 progress
      maxLife: 1,   // seconds
      size: 2,
      color: [255, 255, 255],
      alpha: 1,
      gravity: 0,
      wind: 0,
      drag: 0.98,
      rotation: 0,
      rotSpeed: 0,
      bounce: false,
      trail: false,
      trailPositions: []
    };
  }

  _getFromPool(type) {
    const pool = this.pools[type];
    for (const p of pool) {
      if (!p.alive) return p;
    }
    // All in use — reuse oldest (overwrite)
    return pool[0];
  }

  // ─── Emitter API ──────────────────────────────────────────────────────────

  /**
   * Emit particles of a given type at (x, y) with options.
   * @param {string} type   'dust' | 'sparks' | 'trails' | 'embers' | 'petals' | 'starbursts'
   * @param {number} x      World X position
   * @param {number} y      World Y position
   * @param {object} opts   Optional overrides: count, spread, speed, color, life, size
   */
  emit(type, x, y, opts = {}) {
    const count = opts.count || 1;
    for (let i = 0; i < count; i++) {
      const p = this._getFromPool(type);
      this._initParticle(p, type, x, y, opts);
      if (!p.alive) {
        p.alive = true;
        this.active.push(p);
      }
    }
  }

  _initParticle(p, type, x, y, opts) {
    p.alive = true;
    p.life = 0;
    p.x = x + (Math.random() - 0.5) * (opts.spread || 0);
    p.y = y + (Math.random() - 0.5) * (opts.spread || 0);
    p.rotation = Math.random() * Math.PI * 2;
    p.trailPositions = [];

    switch (type) {
      case 'dust': {
        const angle = Math.random() * Math.PI * 2;
        const speed = opts.speed || (0.2 + Math.random() * 0.5);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = opts.life || (2 + Math.random() * 2);
        p.size = opts.size || (1 + Math.random() * 2);
        p.color = opts.color || this._hslToRgb(240 + Math.random() * 100, 70, 65);
        p.gravity = 0.01;
        p.wind = (Math.random() - 0.5) * 0.03;
        p.drag = 0.995;
        p.rotSpeed = (Math.random() - 0.5) * 0.05;
        break;
      }
      case 'sparks': {
        const angle = opts.angle !== undefined ? opts.angle : Math.random() * Math.PI * 2;
        const speed = opts.speed || (1 + Math.random() * 3);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = opts.life || (0.4 + Math.random() * 0.5);
        p.size = opts.size || (1 + Math.random() * 1.5);
        p.color = opts.color || [255, 220, 150];
        p.gravity = 0.08;
        p.drag = 0.97;
        p.rotSpeed = 0;
        p.trail = true;
        break;
      }
      case 'trails': {
        const angle = opts.angle !== undefined ? opts.angle : Math.random() * Math.PI * 2;
        const speed = opts.speed || (0.5 + Math.random() * 1.5);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = opts.life || (1 + Math.random() * 1.5);
        p.size = opts.size || (2 + Math.random() * 3);
        p.color = opts.color || this._hslToRgb(300 + Math.random() * 60, 80, 70);
        p.gravity = -0.02;
        p.drag = 0.98;
        p.rotSpeed = (Math.random() - 0.5) * 0.1;
        p.trail = true;
        break;
      }
      case 'embers': {
        const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.6;
        const speed = opts.speed || (0.5 + Math.random() * 2);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = opts.life || (1.5 + Math.random() * 2.5);
        p.size = opts.size || (1 + Math.random() * 2.5);
        p.color = opts.color || [255, 180 + Math.random() * 60, 50 + Math.random() * 100];
        p.gravity = -0.04;
        p.wind = (Math.random() - 0.5) * 0.08;
        p.drag = 0.993;
        p.rotSpeed = (Math.random() - 0.5) * 0.08;
        break;
      }
      case 'petals': {
        const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.5;
        const speed = opts.speed || (0.3 + Math.random() * 0.8);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = opts.life || (3 + Math.random() * 3);
        p.size = opts.size || (3 + Math.random() * 4);
        p.color = opts.color || this._hslToRgb(300 + Math.random() * 60, 80, 85);
        p.gravity = 0.015;
        p.wind = (Math.random() - 0.5) * 0.06;
        p.drag = 0.995;
        p.rotSpeed = (Math.random() - 0.5) * 0.15;
        break;
      }
      case 'starbursts': {
        const angle = Math.random() * Math.PI * 2;
        const speed = opts.speed || (1.5 + Math.random() * 3);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = opts.life || (0.6 + Math.random() * 0.8);
        p.size = opts.size || (1.5 + Math.random() * 2.5);
        p.color = opts.color || this._hslToRgb(260 + Math.random() * 100, 90, 85);
        p.gravity = 0;
        p.drag = 0.94;
        p.rotSpeed = (Math.random() - 0.5) * 0.2;
        p.trail = true;
        break;
      }
      default: break;
    }
  }

  // ─── Convenience Emitters ─────────────────────────────────────────────────

  emitBurst(x, y, type, count, opts) {
    this.emit(type, x, y, { ...opts, count });
  }

  emitNameLetterBurst(x, y) {
    this.emit('starbursts', x, y, { count: 10, speed: 2 });
    this.emit('dust', x, y, { count: 5, spread: 10 });
  }

  emitTeddyBirth(x, y) {
    this.emit('embers', x, y, { count: 25, speed: 3, spread: 20 });
    this.emit('sparks', x, y, { count: 20, speed: 4 });
    this.emit('trails', x, y, { count: 10, speed: 2 });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(dt) {
    this.time += dt;

    const toRemove = [];
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      if (!p.alive) {
        toRemove.push(i);
        continue;
      }

      p.life += dt / p.maxLife;
      if (p.life >= 1) {
        p.alive = false;
        toRemove.push(i);
        continue;
      }

      // Store trail
      if (p.trail && (p.trailPositions.length === 0 || Math.hypot(p.x - p.trailPositions[p.trailPositions.length-1][0], p.y - p.trailPositions[p.trailPositions.length-1][1]) > 2)) {
        p.trailPositions.push([p.x, p.y]);
        if (p.trailPositions.length > 8) p.trailPositions.shift();
      }

      // Physics
      p.vy += p.gravity;
      p.vx += p.wind;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.rotation += p.rotSpeed * dt * 60;

      // Bounce off floor
      if (p.bounce && p.y > this.height - 5) {
        p.y = this.height - 5;
        p.vy = -Math.abs(p.vy) * 0.4;
      }
    }

    // Remove dead from active
    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.active.splice(toRemove[i], 1);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  render() {
    const ctx = this.ctx;

    for (const p of this.active) {
      if (!p.alive) continue;

      const lifeProgress = p.life;
      // Fade in first 10%, fade out last 20%
      let alpha = 1;
      if (lifeProgress < 0.1) {
        alpha = lifeProgress / 0.1;
      } else if (lifeProgress > 0.8) {
        alpha = (1 - lifeProgress) / 0.2;
      }
      alpha = Math.max(0, Math.min(1, alpha));

      const [r, g, b] = p.color;

      // Draw trail
      if (p.trail && p.trailPositions.length > 1) {
        ctx.save();
        for (let i = 1; i < p.trailPositions.length; i++) {
          const trailAlpha = alpha * (i / p.trailPositions.length) * 0.4;
          const trailSize = p.size * (i / p.trailPositions.length) * 0.6;
          ctx.fillStyle = `rgba(${r},${g},${b},${trailAlpha})`;
          ctx.beginPath();
          ctx.arc(p.trailPositions[i][0], p.trailPositions[i][1], trailSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      switch (p.type) {
        case 'petals': {
          // Petal shape: ellipse
          ctx.fillStyle = `rgba(${r},${g},${b},1)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'starbursts': {
          // 4-pointed star
          const sr = p.size;
          ctx.fillStyle = `rgba(${r},${g},${b},1)`;
          ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          for (let pt = 0; pt < 8; pt++) {
            const angle = (pt / 8) * Math.PI * 2;
            const radius = pt % 2 === 0 ? sr : sr * 0.4;
            if (pt === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        default: {
          // Default: glowing circle
          ctx.fillStyle = `rgba(${r},${g},${b},1)`;
          ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
          ctx.shadowBlur = p.size * 2;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
    }

    // Reset shadow after all particles drawn
    this.ctx.shadowBlur = 0;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }
}

window.UniverseParticles = UniverseParticles;

