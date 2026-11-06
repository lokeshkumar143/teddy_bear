/**
 * nameConstellation.js — Name Becomes the Universe
 * ============================================================================
 * - Custom name input overlay (NOT a standard form card)
 * - Input characters appear as floating glowing letter-particles
 * - On submit: letters fly to constellation positions spelling the name in stars
 * - Each letter star pulses and glows once placed
 * - Shows "Welcome to your little universe, [NAME]." in animated text
 * - Fires onNameReady(name) callback
 * ============================================================================
 */

class NameConstellation {
  constructor(canvas, particleSystem) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = particleSystem || null;
    this.width = canvas.width;
    this.height = canvas.height;
    this.time = 0;
    this.active = false;

    // Callbacks
    this.onNameReady = null;

    // State
    this.name = '';
    this.phase = 'idle'; // idle → entering → animating → complete
    this.letterStars = [];      // { letter, x, y, targetX, targetY, progress, glow, placed }
    this.flyProgress = 0;       // 0→1 overall fly animation
    this.welcomeAlpha = 0;
    this.welcomeText = '';
    this.inputEl = null;
    this.overlaySection = null;

    this._buildOverlay();
  }

  // ─── DOM Overlay ─────────────────────────────────────────────────────────

  _buildOverlay() {
    // The overlay is managed by index.html's #sceneNameEntry section.
    // This class handles the canvas animation portion.
    // We just wire up the input element from the DOM.
    this.overlaySection = document.getElementById('sceneNameEntry');
    this.inputEl = document.getElementById('nameInput');
    this.submitBtn = document.getElementById('btnNameSubmit');
    this.errorEl = document.getElementById('nameError');

    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this._onSubmit();
      });
      this.inputEl.addEventListener('input', () => {
        // Clear any previous error
        if (this.errorEl) {
          this.errorEl.classList.add('hidden');
          this.errorEl.textContent = '';
        }
        // Emit small particle from input area
        if (this.particles && this.inputEl) {
          const rect = this.inputEl.getBoundingClientRect();
          const x = rect.left + rect.width * 0.5;
          const y = rect.top + rect.height * 0.5;
          if (this.inputEl.value.length > 0) {
            this.particles.emit('dust', x, y, { count: 1, speed: 0.5, spread: 20 });
          }
        }
      });
    }

    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', () => this._onSubmit());
    }
  }

  _onSubmit() {
    if (!this.inputEl) return;
    const raw = this.inputEl.value.trim();
    if (!raw || raw.length < 1) {
      if (this.errorEl) {
        this.errorEl.textContent = 'Please tell me your name ✦';
        this.errorEl.classList.remove('hidden');
      }
      return;
    }
    if (raw.length > 20) {
      if (this.errorEl) {
        this.errorEl.textContent = 'Names up to 20 characters, please ✦';
        this.errorEl.classList.remove('hidden');
      }
      return;
    }
    this._startNameAnimation(raw);
  }

  // ─── Activation ───────────────────────────────────────────────────────────

  show() {
    this.active = true;
    this.phase = 'entering';
    if (this.overlaySection) {
      this.overlaySection.classList.remove('hidden');
    }
    // Focus input after a short delay
    setTimeout(() => {
      if (this.inputEl) this.inputEl.focus();
    }, 600);
  }

  hide() {
    this.active = false;
    if (this.overlaySection) {
      this.overlaySection.classList.add('hidden');
    }
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  // ─── Name Animation ───────────────────────────────────────────────────────

  _startNameAnimation(name) {
    this.name = name.toUpperCase();
    this.phase = 'animating';
    this.flyProgress = 0;
    this.welcomeAlpha = 0;
    this.welcomeText = `Welcome to your little universe, ${name}.`;

    // Hide the overlay section so canvas takes over
    if (this.overlaySection) {
      this.overlaySection.style.transition = 'opacity 0.5s';
      this.overlaySection.style.opacity = '0';
      setTimeout(() => {
        this.overlaySection.classList.add('hidden');
        this.overlaySection.style.opacity = '';
        this.overlaySection.style.transition = '';
      }, 500);
    }

    // Build letter stars
    this._buildLetterStars(this.name);

    // Fire callback after animation completes (~3.5s)
    setTimeout(() => {
      this.phase = 'complete';
      if (this.onNameReady) this.onNameReady(name);
    }, 3500);
  }

  _buildLetterStars(name) {
    const cx = this.width * 0.5;
    const cy = this.height * 0.42;
    const letters = name.split('');
    const totalWidth = letters.length * 38;
    const startX = cx - totalWidth * 0.5 + 19;

    // Starting position: near the bottom-center where the input was
    const srcX = cx;
    const srcY = this.height * 0.6;

    this.letterStars = letters.map((letter, i) => {
      const targetX = startX + i * 38;
      const targetY = cy - 30 + Math.sin(i * 0.8) * 20;

      return {
        letter,
        // Start from input area, scattered randomly
        x: srcX + (Math.random() - 0.5) * 60,
        y: srcY + (Math.random() - 0.5) * 30,
        targetX,
        targetY,
        progress: 0,
        delay: i * 0.08,  // stagger launch by 80ms per letter
        glow: 0,
        placed: false,
        pulsePhase: Math.random() * Math.PI * 2
      };
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(dt) {
    this.time += dt;
    if (!this.active) return;

    if (this.phase === 'animating') {
      this.flyProgress = Math.min(1, this.flyProgress + dt * 0.4);

      for (const ls of this.letterStars) {
        // Delay per letter
        const effectiveT = Math.max(0, this.flyProgress - ls.delay) / (1 - ls.delay * 0.5);
        const t = Math.min(1, effectiveT * 1.5);
        ls.progress = t;

        // Cubic ease-out
        const ease = 1 - Math.pow(1 - t, 3);
        ls.x = ls.x + (ls.targetX - ls.x) * Math.min(1, dt * 4 * ease);
        ls.y = ls.y + (ls.targetY - ls.y) * Math.min(1, dt * 4 * ease);

        // Mark as placed when close enough or time elapsed
        if (!ls.placed && (t >= 0.95 || (Math.abs(ls.x - ls.targetX) < 5 && Math.abs(ls.y - ls.targetY) < 5))) {
          ls.placed = true;
          ls.x = ls.targetX;
          ls.y = ls.targetY;
          ls.glow = 1;
          if (this.particles) {
            this.particles.emit('starbursts', ls.x, ls.y, { count: 6 });
          }
        }

        // Pulse placed letters
        if (ls.placed) {
          ls.glow = 0.6 + 0.4 * Math.sin(this.time * 3 + ls.pulsePhase);
        }
      }

      // Show welcome text once all letters placed
      const allPlaced = this.letterStars.every(ls => ls.placed);
      if (allPlaced) {
        this.welcomeAlpha = Math.min(1, this.welcomeAlpha + dt * 0.8);
      }
    } else if (this.phase === 'complete') {
      // Keep pulsing
      for (const ls of this.letterStars) {
        ls.glow = 0.6 + 0.4 * Math.sin(this.time * 2.5 + ls.pulsePhase);
      }
      this.welcomeAlpha = Math.min(1, this.welcomeAlpha + dt * 0.5);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  render() {
    if (!this.active) return;
    const ctx = this.ctx;

    if (this.phase === 'animating' || this.phase === 'complete') {
      this._drawLetterConstellation(ctx);
    }

    if (this.welcomeAlpha > 0.01) {
      this._drawWelcomeText(ctx);
    }
  }

  _drawLetterConstellation(ctx) {
    const t = this.time;

    // Draw connecting lines between placed letters
    const placed = this.letterStars.filter(ls => ls.placed);
    if (placed.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(placed[0].x, placed[0].y);
      for (let i = 1; i < placed.length; i++) {
        const prev = placed[i - 1];
        const curr = placed[i];
        const cpx = (prev.x + curr.x) / 2;
        const cpy = (prev.y + curr.y) / 2 - 10;
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        ctx.quadraticCurveTo(cpx, cpy, curr.x, curr.y);
      }
      ctx.strokeStyle = 'rgba(200, 180, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // Draw each letter as a glowing star-character
    for (const ls of this.letterStars) {
      if (ls.progress < 0.01 && !ls.placed) continue;

      const alpha = Math.min(1, ls.progress * 2);
      const glowR = 15 + ls.glow * 15;
      const hue = 260 + (this.letterStars.indexOf(ls) / this.letterStars.length) * 80;

      // Glow aura
      const glow = ctx.createRadialGradient(ls.x, ls.y, 0, ls.x, ls.y, glowR);
      glow.addColorStop(0, `hsla(${hue}, 90%, 75%, ${alpha * ls.glow * 0.6})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ls.x, ls.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Letter itself
      const fontSize = Math.min(28, Math.max(16, 22));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${fontSize}px 'Fira Code', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `hsla(${hue}, 80%, 92%, 1)`;
      ctx.shadowColor = `hsla(${hue}, 90%, 75%, 0.9)`;
      ctx.shadowBlur = 12 + ls.glow * 8;
      ctx.fillText(ls.letter, ls.x, ls.y);

      // Small star cross on placed letters
      if (ls.placed) {
        const arm = 10 + ls.glow * 5;
        ctx.strokeStyle = `hsla(${hue}, 80%, 85%, ${ls.glow * 0.5})`;
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(ls.x - arm, ls.y); ctx.lineTo(ls.x + arm, ls.y);
        ctx.moveTo(ls.x, ls.y - arm); ctx.lineTo(ls.x, ls.y + arm);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  _drawWelcomeText(ctx) {
    const W = this.width;
    const H = this.height;
    const alpha = this.welcomeAlpha;
    const fontSize = Math.min(26, Math.max(14, W * 0.026));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `italic ${fontSize}px 'Plus Jakarta Sans', 'Caveat', serif`;
    ctx.fillStyle = 'rgba(230, 220, 255, 1)';
    ctx.shadowColor = 'rgba(200, 170, 255, 0.9)';
    ctx.shadowBlur = 20;
    ctx.fillText(this.welcomeText, W * 0.5, H * 0.72);

    // Small decorative stars around text
    const tw = ctx.measureText(this.welcomeText).width;
    ctx.font = `${Math.floor(fontSize * 0.6)}px 'Fira Code', monospace`;
    ctx.fillStyle = `rgba(255, 220, 255, ${alpha * 0.7})`;
    ctx.shadowBlur = 10;
    ctx.fillText('✦', W * 0.5 - tw * 0.5 - 20, H * 0.72);
    ctx.fillText('✦', W * 0.5 + tw * 0.5 + 20, H * 0.72);

    ctx.restore();
  }

  destroy() {
    this.active = false;
    if (this.overlaySection) {
      this.overlaySection.classList.add('hidden');
    }
  }
}

window.NameConstellation = NameConstellation;

