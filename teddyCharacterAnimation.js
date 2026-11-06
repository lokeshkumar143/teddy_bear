/**
 * teddyCharacterAnimation.js
 * ============================================================================
 * Multi-layer Independent Animation Physics for the Teddy Bear Character.
 * Separately manages:
 * 1. Natural eye blinking
 * 2. Gentle chest breathing
 * 3. 3D Head tilting & mouse tracking
 * 4. Playful ear twitching
 * 5. Arm & paw waving
 * 6. Body squash-and-stretch bouncing
 * 7. Physiological double-pulse heartbeat & light shockwaves
 * 8. Cursor stardust & shooting stars
 * ============================================================================
 */

class TeddyCharacterAnimation {
  constructor() {
    this.time = 0.0;

    // Personalization & Themes
    this.name = "Someone Special";
    this.nameLetters = [];
    this.themes = {
      cyberRose: {
        name: "Cyber Rose",
        icon: "💖",
        furBase: [255, 115, 145],
        furShadow: [215, 80, 110],
        furHighlight: [255, 160, 185],
        heartCore: [255, 12, 65],
        heartHighlight: [255, 60, 120],
        heartEdge: [255, 230, 242],
        heartGlow: "rgba(255, 15, 75, 1.0)",
        bow: [52, 211, 153],
        bowGlow: "rgba(52, 211, 153, 0.85)",
        badge: [255, 255, 255],
        badgeGlow: "rgba(254, 240, 138, 1.0)",
        snout: [255, 245, 235],
        nebula: "rgba(255, 45, 95, 0.12)"
      },
      goldenHoney: {
        name: "Golden Honey",
        icon: "🍯",
        furBase: [245, 175, 80],
        furShadow: [210, 135, 45],
        furHighlight: [255, 210, 130],
        heartCore: [255, 25, 25],
        heartHighlight: [255, 75, 45],
        heartEdge: [255, 240, 220],
        heartGlow: "rgba(255, 30, 35, 1.0)",
        bow: [239, 68, 68],
        bowGlow: "rgba(239, 68, 68, 0.85)",
        badge: [255, 255, 255],
        badgeGlow: "rgba(255, 245, 180, 1.0)",
        snout: [255, 250, 235],
        nebula: "rgba(245, 160, 50, 0.12)"
      },
      cosmicAurora: {
        name: "Cosmic Aurora",
        icon: "🌌",
        furBase: [130, 175, 255],
        furShadow: [85, 130, 215],
        furHighlight: [175, 210, 255],
        heartCore: [255, 15, 125],
        heartHighlight: [255, 90, 185],
        heartEdge: [245, 230, 255],
        heartGlow: "rgba(255, 20, 130, 1.0)",
        bow: [56, 189, 248],
        bowGlow: "rgba(56, 189, 248, 0.85)",
        badge: [255, 255, 255],
        badgeGlow: "rgba(186, 230, 253, 1.0)",
        snout: [240, 248, 255],
        nebula: "rgba(147, 51, 234, 0.12)"
      },
      dreamyLavender: {
        name: "Dreamy Lavender",
        icon: "💜",
        furBase: [195, 145, 245],
        furShadow: [155, 105, 210],
        furHighlight: [225, 180, 255],
        heartCore: [255, 15, 90],
        heartHighlight: [255, 80, 145],
        heartEdge: [255, 230, 250],
        heartGlow: "rgba(255, 20, 95, 1.0)",
        bow: [251, 146, 60],
        bowGlow: "rgba(251, 146, 60, 0.85)",
        badge: [255, 255, 255],
        badgeGlow: "rgba(245, 208, 254, 1.0)",
        snout: [250, 245, 255],
        nebula: "rgba(192, 132, 252, 0.12)"
      }
    };
    this.currentThemeKey = "cyberRose";
    this.onNameChanged = null;
    this.onThemeChanged = null;

    // 1. Blinking state
    this.blinkTimer = 2.5;
    this.blinkValue = 0.0;
    this.isBlinking = false;

    // 2. Ear twitch state
    this.earTimer = 3.5;
    this.earTwitchAngle = 0.0;

    // 3. Head & Gaze tracking
    this.mouse = { x: 540, y: 820, nx: 0, ny: 0, isNear: false, isHovering: false };
    this.lookOffset = { x: 0, y: 0 };
    this.headTilt = 0.0;
    this.shyReaction = 0.0;

    // 4. Breathing
    this.breathScale = 1.0;

    // 5. Heartbeat & Shockwaves
    this.heartScale = 1.0;
    this.heartPulse = 1.0;
    this.lastBeatTime = 0.0;
    this.shockwaves = [];

    // 6. Paw waving
    this.isWaving = false;
    this.waveTimer = 0.0;
    this.waveDuration = 3.5;

    // 7. Interactive bounce
    this.bounce = 0.0;

    // 8. Particle systems & Background
    this.stars = [];
    this.sparkleStars = [];
    this.ambientParticles = [];
    this.initStars(150, 16);
    this.initAmbientParticles(65);

    this.shootingStars = [];
    this.shootingStarTimer = 3.5;
    this.cursorParticles = [];
    this.floatingHearts = [];
    this.initFloatingHearts(18);

    // 9. Bloom reveal timeline
    this.bloomProgress = 0.0;
    this.bloomDuration = 9.0;
    this.isBloomed = false;
  }

  getTheme() {
    return this.themes[this.currentThemeKey] || this.themes.cyberRose;
  }

  setTheme(themeKey) {
    if (this.themes[themeKey]) {
      this.currentThemeKey = themeKey;
      this.triggerShockwave();
      if (this.onThemeChanged) this.onThemeChanged(this.getTheme());
    }
  }

  setName(name) {
    if (!name || !name.trim()) name = "Someone Special";
    this.name = name.trim();
    const cleaned = this.name.toUpperCase().replace(/[^A-Z0-9]/g, "");
    this.nameLetters = cleaned.length > 0 ? Array.from(cleaned) : ["♥", "★", "A"];
    if (this.onNameChanged) this.onNameChanged(this.name);
  }

  initStars(dotCount, sparkleCount) {
    let s = 1337;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    this.stars = [];
    for (let i = 0; i < dotCount; i++) {
      this.stars.push({
        x: 15 + rnd() * 1050,
        y: 20 + rnd() * 1880,
        freq: 0.8 + rnd() * 2.8,
        phase: rnd() * Math.PI * 2,
        baseBrightness: 0.2 + rnd() * 0.75,
        colorType: rnd() > 0.75 ? "rose" : (rnd() > 0.5 ? "gold" : "blue")
      });
    }
    this.sparkleStars = [];
    for (let i = 0; i < sparkleCount; i++) {
      this.sparkleStars.push({
        x: 50 + rnd() * 980,
        y: 50 + rnd() * 1820,
        freq: 0.6 + rnd() * 1.5,
        phase: rnd() * Math.PI * 2
      });
    }
  }

  initAmbientParticles(count) {
    let s = 4242;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    this.ambientParticles = [];
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: rnd() * 1080,
        y: rnd() * 1920,
        size: 1.0 + rnd() * 2.5,
        alpha: 0.15 + rnd() * 0.45,
        hue: 330 + Math.floor(rnd() * 30),
        phase: rnd() * Math.PI * 2
      });
    }
  }

  initFloatingHearts(count) {
    let s = 999;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    this.floatingHearts = [];
    for (let i = 0; i < count; i++) {
      this.floatingHearts.push({
        xRel: -0.22 + rnd() * 0.44,
        speed: 0.12 + rnd() * 0.14,
        wobbleFreq: 1.8 + rnd() * 1.5,
        wobbleAmp: 0.025 + rnd() * 0.035,
        phase: rnd() * Math.PI * 2,
        period: 3.2 + rnd() * 1.8,
        timeOffset: i * 0.30,
        char: ["♥", "♡", "★", "✧", "o"][Math.floor(rnd() * 5)]
      });
    }
  }

  triggerWave() {
    this.isWaving = true;
    this.waveTimer = 0.0;
    this.triggerShockwave();

    // Burst hearts from waving paw
    for (let i = 0; i < 8; i++) {
      this.cursorParticles.push({
        x: 540 + 0.28 * 1050 + (Math.random() - 0.5) * 50,
        y: 800 - 0.04 * 1050 + (Math.random() - 0.5) * 50,
        vx: 30 + Math.random() * 80,
        vy: -40 - Math.random() * 90,
        alpha: 1.0,
        life: 1.2,
        size: 14 + Math.random() * 8,
        char: ["♥", "♡", "✨", "✦"][Math.floor(Math.random() * 4)],
        color: [255, 120, 160]
      });
    }
  }

  triggerBounce() {
    this.bounce = 1.0;
    this.triggerShockwave();
    this.shyReaction = Math.min(1.0, this.shyReaction + 0.3);
  }

  triggerShockwave(color = "rgba(255, 30, 85, 0.9)") {
    this.shockwaves.push({
      cx: 540,
      cy: 800 + 0.16 * 1050,
      r: 30,
      maxR: 480,
      alpha: 0.9,
      color: color
    });
  }

  spawnShootingStar() {
    const startX = 60 + Math.random() * 300;
    const startY = 80 + Math.random() * 400;
    const len = 180 + Math.random() * 120;
    const angle = 0.55 + (Math.random() - 0.5) * 0.25;
    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * 750,
      vy: Math.sin(angle) * 750,
      len: len,
      alpha: 1.0,
      life: 0.85
    });
  }

  setMouse(clientX, clientY, canvasRect) {
    if (!canvasRect || canvasRect.width === 0 || canvasRect.height === 0) return;
    const scaleX = 1080 / canvasRect.width;
    const scaleY = 1920 / canvasRect.height;
    const cx = (clientX - canvasRect.left) * scaleX;
    const cy = (clientY - canvasRect.top) * scaleY;

    this.mouse.x = cx;
    this.mouse.y = cy;
    this.mouse.nx = (cx - 540) / 1050;
    this.mouse.ny = (cy - 800) / 1050;

    const distToCenter = Math.hypot(this.mouse.nx, this.mouse.ny);
    this.mouse.isNear = distToCenter < 0.45;
    this.mouse.isHovering = distToCenter < 0.32;

    if (this.mouse.isNear) {
      this.shyReaction = Math.min(1.0, this.shyReaction + 0.08);
    } else {
      this.shyReaction = Math.max(0.0, this.shyReaction - 0.04);
    }

    // Spawn fairy dust particles under cursor
    if (Math.random() < 0.6) {
      this.cursorParticles.push({
        x: cx + (Math.random() - 0.5) * 16,
        y: cy + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 30,
        vy: -15 - Math.random() * 30,
        alpha: 0.9,
        life: 0.65,
        size: 10 + Math.random() * 6,
        char: ["✦", "✧", "♥", "•", "°"][Math.floor(Math.random() * 5)],
        color: Math.random() > 0.5 ? [255, 130, 175] : [255, 255, 255]
      });
    }
  }

  update(dt) {
    this.time += dt;

    // 1. Organic Bloom Timeline
    if (!this.isBloomed) {
      this.bloomProgress += dt / this.bloomDuration;
      if (this.bloomProgress >= 1.0) {
        this.bloomProgress = 1.0;
        this.isBloomed = true;
      }
    }

    // 2. Breathing physics
    this.breathScale = 1.0 + 0.012 * Math.sin(this.time * 2.8);

    // 3. Heartbeat rhythm (Lub-Dub)
    const hbPhase = (this.time * 2.2) % (Math.PI * 2);
    let beat = 0.0;
    if (hbPhase < 0.8) {
      beat = Math.sin((hbPhase / 0.8) * Math.PI); // Lub
    } else if (hbPhase >= 0.9 && hbPhase < 1.5) {
      beat = 0.65 * Math.sin(((hbPhase - 0.9) / 0.6) * Math.PI); // Dub
    }
    this.heartScale = 1.0 + 0.08 * Math.pow(beat, 1.5);
    this.heartPulse = 0.8 + 0.4 * beat;

    if (beat > 0.95 && (this.time - this.lastBeatTime) > 0.6) {
      this.lastBeatTime = this.time;
      if (this.bloomProgress > 0.25) {
        this.triggerShockwave();
      }
    }

    // 4. Shockwave updates
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.r += 320 * dt;
      sw.alpha = 0.9 * (1.0 - sw.r / sw.maxR);
      if (sw.r >= sw.maxR || sw.alpha <= 0.02) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 5. Shooting stars
    this.shootingStarTimer -= dt;
    if (this.shootingStarTimer <= 0) {
      this.spawnShootingStar();
      this.shootingStarTimer = 4.5 + Math.random() * 4.0;
    }
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx * dt;
      ss.y += ss.vy * dt;
      ss.alpha -= dt / ss.life;
      if (ss.alpha <= 0) {
        this.shootingStars.splice(i, 1);
      }
    }

    // 6. Cursor particles
    for (let i = this.cursorParticles.length - 1; i >= 0; i--) {
      const cp = this.cursorParticles[i];
      cp.x += cp.vx * dt;
      cp.y += cp.vy * dt;
      cp.alpha -= dt / cp.life;
      if (cp.alpha <= 0) {
        this.cursorParticles.splice(i, 1);
      }
    }

    // 7. Blinking
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      this.blinkValue = 1.0;
      this.blinkTimer = 3.0 + Math.random() * 2.5;
    }
    if (this.isBlinking) {
      this.blinkValue -= dt * 7.0;
      if (this.blinkValue <= 0) {
        this.blinkValue = 0;
        this.isBlinking = false;
      }
    }

    // 8. Ear twitching
    this.earTimer -= dt;
    if (this.earTimer <= 0) {
      this.earTwitchAngle = Math.sin(this.time * 16.0) * 0.04;
      if (this.earTimer < -0.4) {
        this.earTwitchAngle = 0.0;
        this.earTimer = 3.5 + Math.random() * 2.5;
      }
    }

    // 9. Waving paw
    if (this.isWaving) {
      this.waveTimer += dt;
      if (this.waveTimer >= this.waveDuration) {
        this.isWaving = false;
        this.waveTimer = 0.0;
      }
    }

    // 10. Bounce decay
    if (this.bounce > 0.001) {
      this.bounce *= Math.pow(0.04, dt);
    } else {
      this.bounce = 0.0;
    }

    // 11. Mouse look-at damping
    const targetLx = this.mouse.isNear ? Math.max(-0.25, Math.min(0.25, this.mouse.nx * 0.45)) : 0;
    const targetLy = this.mouse.isNear ? Math.max(-0.25, Math.min(0.25, this.mouse.ny * 0.45)) : 0;
    this.lookOffset.x += (targetLx - this.lookOffset.x) * 0.08;
    this.lookOffset.y += (targetLy - this.lookOffset.y) * 0.08;

    // 12. Head tilt
    const targetTilt = this.mouse.isNear ? (this.mouse.nx * 0.08 + this.shyReaction * 0.04) : (Math.sin(this.time * 0.9) * 0.025);
    this.headTilt += (targetTilt - this.headTilt) * 0.06;
  }
}

window.TeddyCharacterAnimation = TeddyCharacterAnimation;
