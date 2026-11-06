/**
 * teddyParticleWorld.js
 * ============================================================================
 * Fullscreen Cinematic Cosmic Particle & Sound Engine (100vw x 100svh)
 * Features:
 * - Edge-to-edge deep space background with dynamic nebula gradients
 * - 300+ twinkling multi-spectral stars with mouse parallax depth
 * - Pink, rose-red, and violet floating energy particles across 3 Z-layers
 * - Floating ASCII and glowing ember hearts ascending smoothly
 * - Streaking shooting meteors and light trail emitters
 * - Web Audio Synthesizer (harmonic chimes, heartbeat, romantic arpeggios)
 * ============================================================================
 */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggle() {
    this.init();
    this.muted = !this.muted;
    if (!this.muted) {
      this.playChime([523.25, 659.25, 783.99], 0.35); // C-Major chord
    }
    return !this.muted;
  }

  playChime(notes = [659.25, 880.0], duration = 0.45) {
    if (this.muted || !this.ctx) return;
    try {
      const freqs = Array.isArray(notes) ? notes : [notes];
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.08 + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + duration);
      });
    } catch (e) {}
  }

  playHeartbeat() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(75, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {}
  }

  playMagicChime() {
    this.playChime([587.33, 739.99, 880.0, 1174.66], 0.7);
  }
}

class TeddyParticleWorld {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.sound = new SoundSynthesizer();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.stars = [];
    this.particles = [];
    this.floatingHearts = [];
    this.shootingStars = [];
    this.shootingStarTimer = 3.0;

    // Mouse parallax tracking
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.time = 0;
    this.nebulaBrightness = 0.12;

    this.resize();
    this.initSystems();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize(), { passive: true });

    const onPointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || (this.width / 2);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || (this.height / 2);
      this.mouse.targetX = (clientX / this.width) * 2 - 1;
      this.mouse.targetY = (clientY / this.height) * 2 - 1;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  initSystems() {
    let s = 1337;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const isMobile = (window.innerWidth < 768);

    // 1. Fullscreen Starfield (scaled for performance on mobile devices)
    this.stars = [];
    const starCount = isMobile ? 180 : 380;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        xRel: rnd(),
        yRel: rnd(),
        size: 0.8 + rnd() * 1.8,
        freq: 0.7 + rnd() * 2.5,
        phase: rnd() * Math.PI * 2,
        brightness: 0.2 + rnd() * 0.75,
        color: rnd() > 0.65 ? "#ffc2d4" : (rnd() > 0.4 ? "#ffeaa7" : "#c7f9cc"),
        depth: 0.2 + rnd() * 0.8
      });
    }

    // 2. Pink, Rose-Red & Violet Cosmic Particles
    this.particles = [];
    const particleCount = isMobile ? 36 : 72;
    const colors = ["#ff4d79", "#ff7597", "#b5179e", "#7209b7", "#f72585", "#ff007f"];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: rnd() * this.width,
        y: rnd() * this.height,
        vx: (rnd() - 0.5) * 0.4,
        vy: -0.2 - rnd() * 0.4,
        size: 1.5 + rnd() * 3.5,
        alpha: 0.15 + rnd() * 0.55,
        color: colors[Math.floor(rnd() * colors.length)],
        phase: rnd() * Math.PI * 2,
        wobble: 1.2 + rnd() * 2.0
      });
    }

    // 3. Floating Embers Hearts
    this.floatingHearts = [];
    const heartCount = isMobile ? 12 : 24;
    const glyphs = ["♥", "♡", "✧", "★", "°"];
    for (let i = 0; i < heartCount; i++) {
      this.floatingHearts.push({
        x: rnd() * this.width,
        y: this.height + rnd() * 200,
        speed: 18 + rnd() * 28,
        wobbleAmp: 14 + rnd() * 20,
        wobbleFreq: 1.5 + rnd() * 1.5,
        phase: rnd() * Math.PI * 2,
        alpha: 0.2 + rnd() * 0.6,
        size: 12 + Math.floor(rnd() * 8),
        glyph: glyphs[Math.floor(rnd() * glyphs.length)],
        color: rnd() > 0.5 ? "#ff4d79" : "#ff8da1"
      });
    }
  }

  spawnShootingStar() {
    const startX = Math.random() * (this.width * 0.6);
    const startY = Math.random() * (this.height * 0.35);
    const angle = 0.55 + (Math.random() - 0.5) * 0.25;
    const len = 120 + Math.random() * 120;
    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * 700,
      vy: Math.sin(angle) * 700,
      len: len,
      alpha: 1.0,
      life: 0.75
    });
  }

  update(dt) {
    this.time += dt;

    // Mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * (dt * 3.0);
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * (dt * 3.0);

    // Shooting stars
    this.shootingStarTimer -= dt;
    if (this.shootingStarTimer <= 0) {
      this.spawnShootingStar();
      this.shootingStarTimer = 3.5 + Math.random() * 3.5;
    }
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx * dt;
      ss.y += ss.vy * dt;
      ss.alpha -= dt / ss.life;
      if (ss.alpha <= 0) this.shootingStars.splice(i, 1);
    }

    // Particles motion
    for (const p of this.particles) {
      p.x += p.vx + Math.sin(this.time * p.wobble + p.phase) * 0.3;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
    }

    // Floating hearts
    for (const h of this.floatingHearts) {
      h.y -= h.speed * dt;
      h.xCurrent = h.x + Math.sin(this.time * h.wobbleFreq + h.phase) * h.wobbleAmp;
      if (h.y < -30) {
        h.y = this.height + 40;
        h.x = Math.random() * this.width;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;

    // 1. Deep Midnight Black Background
    ctx.fillStyle = "#030206";
    ctx.fillRect(0, 0, W, H);

    // 2. Fullscreen Ambient Radial Nebula Clouds
    const grad = ctx.createRadialGradient(
      W * 0.5 + this.mouse.x * 40,
      H * 0.45 + this.mouse.y * 30,
      50,
      W * 0.5,
      H * 0.5,
      Math.max(W, H) * 0.75
    );
    grad.addColorStop(0, `rgba(255, 45, 95, ${this.nebulaBrightness})`);
    grad.addColorStop(0.35, "rgba(90, 24, 154, 0.08)");
    grad.addColorStop(0.7, "rgba(24, 8, 40, 0.04)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 3. Twinkling Parallax Starfield
    for (const s of this.stars) {
      const px = s.xRel * W + this.mouse.x * 25 * s.depth;
      const py = s.yRel * H + this.mouse.y * 25 * s.depth;
      const twinkle = s.brightness * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this.time * s.freq + s.phase)));
      if (twinkle > 0.15) {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = twinkle;
        ctx.fillRect(px, py, s.size, s.size);
      }
    }
    ctx.globalAlpha = 1.0;

    // 4. Shooting Stars
    for (const ss of this.shootingStars) {
      ctx.save();
      const tailX = ss.x - (ss.vx / 700) * ss.len;
      const tailY = ss.y - (ss.vy / 700) * ss.len;
      const sGrad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      sGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      sGrad.addColorStop(1, `rgba(255, 180, 220, ${ss.alpha})`);
      ctx.strokeStyle = sGrad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Floating Glowing Cosmic Dust
    for (const p of this.particles) {
      const alpha = p.alpha * (0.6 + 0.4 * Math.sin(this.time * 2.5 + p.phase));
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 6. Floating Ascending Hearts
    ctx.font = 'bold 15px "Fira Code", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const h of this.floatingHearts) {
      ctx.fillStyle = h.color;
      ctx.globalAlpha = h.alpha;
      ctx.shadowColor = h.color;
      ctx.shadowBlur = 8;
      ctx.fillText(h.glyph, h.xCurrent || h.x, h.y);
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  }
}

window.TeddyParticleWorld = TeddyParticleWorld;

