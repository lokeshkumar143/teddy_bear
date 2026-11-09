/**
 * Ambient Celestial ASCII Stardust & Gentle Hearts Universe
 * Fills the screen with drifting cosmic stars, glowing stardust motes,
 * and soft rising mini hearts that float like gentle embers in the night sky.
 */

export class AmbientParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.time = 0;
    this.windX = 0;
    this.targetWindX = 0;

    // Romantic celestial glyphs
    this.glyphs = ['✦', '✧', '♥', '♡', '·', '⋆', '•', '✨', '°'];
    
    // Rich romantic stardust palette
    this.colors = [
      'rgba(255, 225, 120, ',  // Golden Starlight
      'rgba(255, 65, 115, ',   // Soft Glowing Rose
      'rgba(255, 150, 180, ',  // Petal Pink
      'rgba(190, 140, 255, ',  // Celestial Violet
      'rgba(240, 245, 255, '   // Diamond Silver
    ];

    this.dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    this.resize();
    this.initParticles(95);
    this.initEvents();
  }

  resize() {
    this.dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (this.ctx.resetTransform) {
      this.ctx.resetTransform();
    }
    this.ctx.scale(this.dpr, this.dpr);
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    // Distribute nicely across margins while leaving center open
    const isFlank = Math.random() < 0.75;
    let x;
    if (isFlank) {
      if (Math.random() < 0.5) {
        x = Math.random() * (this.width * 0.32);
      } else {
        x = this.width * 0.68 + Math.random() * (this.width * 0.32);
      }
    } else {
      x = Math.random() * this.width;
    }

    const y = randomY ? Math.random() * this.height : this.height + 15;
    const isHeart = Math.random() < 0.28;
    const glyph = isHeart 
      ? (Math.random() < 0.6 ? '♥' : '♡') 
      : this.glyphs[Math.floor(Math.random() * this.glyphs.length)];

    return {
      x,
      y,
      baseX: x,
      glyph,
      size: isHeart ? (10 + Math.random() * 8) : (8 + Math.random() * 7),
      vy: isHeart ? (-12 - Math.random() * 22) : (-6 - Math.random() * 16), // Gently rises upward
      vx: (Math.random() - 0.5) * 8,
      wobbleSpeed: 0.8 + Math.random() * 1.6,
      wobbleAmp: 12 + Math.random() * 24,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: 0.25 + Math.random() * 0.55,
      fadeSpeed: 0.25 + Math.random() * 0.45,
      colorPrefix: this.colors[Math.floor(Math.random() * this.colors.length)],
      life: 0,
      maxLife: 6 + Math.random() * 10
    };
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / this.width) - 0.5;
      this.targetWindX = normX * 35;
    });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const normX = (e.touches[0].clientX / this.width) - 0.5;
        this.targetWindX = normX * 35;
      }
    }, { passive: true });
  }

  burstLoveConfetti(originX = null, originY = null, count = 55) {
    const ox = originX !== null ? originX : this.width * 0.5;
    const oy = originY !== null ? originY : this.height * 0.45;
    const loveGlyphs = ['💖', '♥', '💕', '✦', '✨', '🌸', '❤️', '💝'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 220;
      const glyph = loveGlyphs[Math.floor(Math.random() * loveGlyphs.length)];

      this.particles.push({
        x: ox + (Math.random() - 0.5) * 30,
        y: oy + (Math.random() - 0.5) * 30,
        baseX: ox,
        glyph,
        size: 14 + Math.random() * 18,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        wobbleSpeed: 1.8 + Math.random() * 2.2,
        wobbleAmp: 16 + Math.random() * 24,
        wobbleOffset: Math.random() * Math.PI * 2,
        opacity: 0.95,
        colorPrefix: this.colors[Math.floor(Math.random() * this.colors.length)],
        life: 0,
        maxLife: 4.5 + Math.random() * 3.5,
        isBurst: true
      });
    }
  }

  update(dt) {
    this.time += dt;
    this.windX += (this.targetWindX - this.windX) * 0.04;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      if (p.isBurst) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= Math.pow(0.92, dt * 60);
        p.vy = (p.vy + 35 * dt) * Math.pow(0.94, dt * 60) - 25 * dt;

        if (p.life >= p.maxLife || p.y < -50) {
          this.particles.splice(i, 1);
        }
      } else {
        // Gentle floating ascent
        p.y += p.vy * dt;
        p.x = p.baseX + Math.sin(this.time * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp + this.windX;

        if (p.y < -30 || p.life > p.maxLife) {
          this.particles[i] = this.createParticle(false);
        }
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    for (const p of this.particles) {
      const lifeRatio = p.life / p.maxLife;
      let alpha = p.opacity;
      if (lifeRatio < 0.15) {
        alpha *= (lifeRatio / 0.15);
      } else if (lifeRatio > 0.85) {
        alpha *= ((1 - lifeRatio) / 0.15);
      }

      this.ctx.font = `${Math.round(p.size)}px "JetBrains Mono", Menlo, monospace`;
      this.ctx.shadowColor = p.colorPrefix + '0.6)';
      this.ctx.shadowBlur = 4;
      this.ctx.fillStyle = p.colorPrefix + `${Math.max(0, Math.min(1, alpha))})`;
      this.ctx.fillText(p.glyph, p.x, p.y);
    }
    this.ctx.shadowBlur = 0;
  }
}
