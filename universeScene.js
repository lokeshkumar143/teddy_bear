/**
 * universeScene.js — The Little Universe: Cosmic Environment Engine
 * ============================================================================
 * Full-screen 100vw x 100svh canvas cosmic backdrop featuring:
 * - 500 twinkling stars with depth parallax and mouse interaction
 * - 8 floating miniature procedural planets with surface detail
 * - Luminous thread network connecting stars (animated bezier curves)
 * - 80 floating fireflies with organic flight paths
 * - Volumetric light shafts (radial gradients from random sky points)
 * - Cosmic dust clouds at multiple Z depths
 * - Mouse parallax shifting star layers at different speeds
 * - Smooth nebula gradient background that slowly color-shifts
 * ============================================================================
 */

class UniverseScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.time = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.active = true;
    this.nebulaHue = 270; // Start purple-ish
    this.nebulaHueTarget = 310;

    // Intensity multiplier (can be boosted when constellation fires)
    this.intensity = 1.0;
    this.targetIntensity = 1.0;

    this._initStars();
    this._initPlanets();
    this._initFireflies();
    this._initLightShafts();
    this._initDustClouds();
    this._initThreadNetwork();

    this._bindMouse();
  }

  // ─── Initializers ────────────────────────────────────────────────────────

  _initStars() {
    this.stars = [];
    // Layer 0 = far, layer 2 = near (parallax multiplier increases)
    const layers = [
      { count: 220, minSize: 0.4, maxSize: 1.0, parallax: 0.01, brightness: 0.5 },
      { count: 180, minSize: 0.6, maxSize: 1.5, parallax: 0.025, brightness: 0.7 },
      { count: 100, minSize: 0.8, maxSize: 2.2, parallax: 0.05,  brightness: 0.9 }
    ];

    const colorTypes = ['white', 'white', 'white', 'rose', 'gold', 'blue'];
    let id = 0;

    for (const layer of layers) {
      for (let i = 0; i < layer.count; i++) {
        const colorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
        this.stars.push({
          id: id++,
          xRel: Math.random(), // 0–1 of canvas width
          yRel: Math.random(),
          size: layer.minSize + Math.random() * (layer.maxSize - layer.minSize),
          parallax: layer.parallax,
          baseBrightness: layer.brightness * (0.5 + Math.random() * 0.5),
          twinkleFreq: 0.5 + Math.random() * 2.5,
          twinklePhase: Math.random() * Math.PI * 2,
          colorType,
          layer: layers.indexOf(layer)
        });
      }
    }
  }

  _initPlanets() {
    this.planets = [];
    const palettes = [
      { base: '#d4a5ff', shadow: '#9b5de5', ring: 'rgba(212,165,255,0.3)', hasCraters: true },
      { base: '#90e0ef', shadow: '#0096c7', ring: 'rgba(144,224,239,0.3)', hasCraters: false },
      { base: '#ffb3c6', shadow: '#e05780', ring: 'rgba(255,179,198,0.4)', hasCraters: true },
      { base: '#ffd166', shadow: '#ef8c27', ring: 'rgba(255,209,102,0.35)', hasCraters: false },
      { base: '#b7e4c7', shadow: '#52b788', ring: 'rgba(183,228,199,0.3)', hasCraters: true },
      { base: '#ffc8dd', shadow: '#ff85a1', ring: 'rgba(255,200,221,0.4)', hasCraters: false },
      { base: '#cdb4db', shadow: '#9d4edd', ring: 'rgba(205,180,219,0.3)', hasCraters: true },
      { base: '#caffbf', shadow: '#38b000', ring: 'rgba(202,255,191,0.3)', hasCraters: false }
    ];

    for (let i = 0; i < 8; i++) {
      const pal = palettes[i];
      this.planets.push({
        xRel: 0.08 + Math.random() * 0.84,
        yRel: 0.05 + Math.random() * 0.90,
        radius: 10 + Math.random() * 22,
        base: pal.base,
        shadow: pal.shadow,
        ring: pal.ring,
        hasCraters: pal.hasCraters,
        hasRing: Math.random() > 0.5,
        floatAmp: 4 + Math.random() * 6,
        floatFreq: 0.2 + Math.random() * 0.3,
        floatPhase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        rotation: Math.random() * Math.PI * 2,
        parallax: 0.015 + Math.random() * 0.02,
        // Craters are relative positions within the planet circle
        craters: Array.from({ length: 3 }, () => ({
          ox: (Math.random() - 0.5) * 0.6,
          oy: (Math.random() - 0.5) * 0.6,
          r: 0.08 + Math.random() * 0.14
        }))
      });
    }
  }

  _initFireflies() {
    this.fireflies = [];
    const colors = [
      [255, 220, 150], // amber
      [150, 255, 200], // mint
      [255, 160, 200], // rose
      [200, 220, 255], // ice blue
    ];

    for (let i = 0; i < 80; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      this.fireflies.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        // Organic wander
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: 0.015 + Math.random() * 0.025,
        wanderRadius: 0.02 + Math.random() * 0.05,
        // Glow
        color: col,
        size: 1.5 + Math.random() * 2.5,
        glowRadius: 6 + Math.random() * 14,
        brightness: 0.4 + Math.random() * 0.6,
        blinkFreq: 0.5 + Math.random() * 2.0,
        blinkPhase: Math.random() * Math.PI * 2
      });
    }
  }

  _initLightShafts() {
    this.lightShafts = [];
    for (let i = 0; i < 5; i++) {
      this.lightShafts.push({
        xRel: 0.1 + Math.random() * 0.8,
        yRel: -0.05 + Math.random() * 0.3,
        angle: (Math.PI * 0.4) + Math.random() * (Math.PI * 0.2),
        length: 300 + Math.random() * 400,
        width: 60 + Math.random() * 100,
        alpha: 0.03 + Math.random() * 0.05,
        hue: 260 + Math.random() * 80,
        pulseFreq: 0.1 + Math.random() * 0.3,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }

  _initDustClouds() {
    this.dustClouds = [];
    for (let i = 0; i < 12; i++) {
      this.dustClouds.push({
        xRel: Math.random(),
        yRel: Math.random(),
        rx: 80 + Math.random() * 200,
        ry: 50 + Math.random() * 150,
        hue: 240 + Math.random() * 100,
        alpha: 0.02 + Math.random() * 0.05,
        parallax: 0.005 + Math.random() * 0.015,
        driftX: (Math.random() - 0.5) * 0.0001,
        driftY: (Math.random() - 0.5) * 0.00005
      });
    }
  }

  _initThreadNetwork() {
    // Pick 30 stars to be "thread hubs"
    this.threadHubs = [];
    const pool = [...this.stars].sort(() => Math.random() - 0.5).slice(0, 30);
    // Create connections between nearby hubs
    this.threadConnections = [];
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const dx = (pool[i].xRel - pool[j].xRel);
        const dy = (pool[i].yRel - pool[j].yRel);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.18 && this.threadConnections.length < 60) {
          this.threadConnections.push({
            a: pool[i],
            b: pool[j],
            dist,
            flowOffset: Math.random(),
            flowSpeed: 0.1 + Math.random() * 0.3,
            alpha: 0.08 + (0.18 - dist) / 0.18 * 0.12
          });
        }
      }
    }
  }

  _bindMouse() {
    this._onMouseMove = (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    this._onTouchMove = (e) => {
      if (e.touches.length > 0) {
        this.targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        this.targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    };
    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    window.addEventListener('touchmove', this._onTouchMove, { passive: true });
  }

  // ─── Resize ───────────────────────────────────────────────────────────────

  resize(w, h) {
    this.width = w;
    this.height = h;
    // Reposition fireflies to stay in bounds
    for (const f of this.fireflies) {
      if (f.x > w) f.x = Math.random() * w;
      if (f.y > h) f.y = Math.random() * h;
    }
  }

  // ─── Intensity Control ────────────────────────────────────────────────────

  setIntensity(val) {
    this.targetIntensity = Math.max(0, Math.min(2, val));
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(dt) {
    this.time += dt;

    // Smooth mouse parallax
    const mouseLerp = 1 - Math.pow(0.05, dt);
    this.mouseX += (this.targetMouseX - this.mouseX) * mouseLerp;
    this.mouseY += (this.targetMouseY - this.mouseY) * mouseLerp;

    // Smooth intensity
    this.intensity += (this.targetIntensity - this.intensity) * Math.min(1, dt * 2);

    // Nebula hue drift
    const nebulaDrift = dt * 2;
    if (Math.abs(this.nebulaHue - this.nebulaHueTarget) < 1) {
      this.nebulaHueTarget = 220 + Math.random() * 140;
    }
    this.nebulaHue += (this.nebulaHueTarget - this.nebulaHue) * nebulaDrift * 0.05;

    // Update fireflies
    for (const f of this.fireflies) {
      f.wanderAngle += (Math.random() - 0.5) * f.wanderSpeed * 60 * dt;
      f.vx += Math.cos(f.wanderAngle) * f.wanderRadius * dt;
      f.vy += Math.sin(f.wanderAngle) * f.wanderRadius * dt;
      // Drag
      f.vx *= Math.pow(0.96, dt * 60);
      f.vy *= Math.pow(0.96, dt * 60);
      f.x += f.vx * dt * 60;
      f.y += f.vy * dt * 60;
      // Wrap edges
      if (f.x < -20) f.x = this.width + 20;
      if (f.x > this.width + 20) f.x = -20;
      if (f.y < -20) f.y = this.height + 20;
      if (f.y > this.height + 20) f.y = -20;
    }

    // Update planet rotations
    for (const p of this.planets) {
      p.rotation += p.rotSpeed;
    }

    // Update dust cloud drifts
    for (const d of this.dustClouds) {
      d.xRel = (d.xRel + d.driftX + 1) % 1;
      d.yRel = (d.yRel + d.driftY + 1) % 1;
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  render() {
    if (!this.active) return;
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;
    const t = this.time;
    const mx = this.mouseX;
    const my = this.mouseY;

    // 1. Deep space background gradient
    this._drawBackground(ctx, W, H, t);

    // 2. Cosmic dust clouds
    this._drawDustClouds(ctx, W, H, mx, my);

    // 3. Volumetric light shafts
    this._drawLightShafts(ctx, W, H, t);

    // 4. Thread network between stars
    this._drawThreadNetwork(ctx, W, H, mx, my, t);

    // 5. Stars with parallax
    this._drawStars(ctx, W, H, mx, my, t);

    // 6. Planets
    this._drawPlanets(ctx, W, H, mx, my, t);

    // 7. Fireflies
    this._drawFireflies(ctx, t);
  }

  // ─── Draw Helpers ─────────────────────────────────────────────────────────

  _drawBackground(ctx, W, H, t) {
    // Deep black base
    ctx.fillStyle = '#030208';
    ctx.fillRect(0, 0, W, H);

    // Nebula gradient that color-shifts
    const h1 = this.nebulaHue;
    const h2 = (h1 + 60) % 360;
    const cx = W * 0.5;
    const cy = H * 0.45;
    const maxR = Math.max(W, H) * 0.9;

    const nebula = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    const alpha1 = 0.09 * this.intensity;
    const alpha2 = 0.04 * this.intensity;
    nebula.addColorStop(0, `hsla(${h1}, 70%, 55%, ${alpha1})`);
    nebula.addColorStop(0.35, `hsla(${h2}, 60%, 40%, ${alpha2})`);
    nebula.addColorStop(0.7, `hsla(${(h1 + 180) % 360}, 50%, 25%, ${alpha2 * 0.5})`);
    nebula.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, W, H);

    // Secondary glow at upper area
    const topGlow = ctx.createRadialGradient(W * 0.3, H * 0.15, 0, W * 0.3, H * 0.15, W * 0.5);
    topGlow.addColorStop(0, `hsla(${(h1 + 30) % 360}, 80%, 70%, 0.04)`);
    topGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, W, H);
  }

  _drawDustClouds(ctx, W, H, mx, my) {
    for (const d of this.dustClouds) {
      const px = (d.xRel * W) + mx * d.parallax * W;
      const py = (d.yRel * H) + my * d.parallax * H;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, Math.max(d.rx, d.ry));
      grad.addColorStop(0, `hsla(${d.hue}, 60%, 65%, ${d.alpha * this.intensity})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(d.rx / Math.max(d.rx, d.ry), d.ry / Math.max(d.rx, d.ry));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(d.rx, d.ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawLightShafts(ctx, W, H, t) {
    for (const ls of this.lightShafts) {
      const x = ls.xRel * W;
      const y = ls.yRel * H;
      const pulse = 0.6 + 0.4 * Math.sin(t * ls.pulseFreq + ls.pulsePhase);
      const alpha = ls.alpha * pulse * this.intensity;
      if (alpha < 0.005) continue;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ls.angle);

      const shaftGrad = ctx.createLinearGradient(0, 0, 0, ls.length);
      shaftGrad.addColorStop(0, `hsla(${ls.hue}, 80%, 70%, ${alpha * 2})`);
      shaftGrad.addColorStop(0.3, `hsla(${ls.hue}, 70%, 65%, ${alpha})`);
      shaftGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.moveTo(-ls.width / 2, 0);
      ctx.lineTo(ls.width / 2, 0);
      ctx.lineTo(ls.width, ls.length);
      ctx.lineTo(-ls.width, ls.length);
      ctx.closePath();
      ctx.fillStyle = shaftGrad;
      ctx.fill();
      ctx.restore();
    }
  }

  _drawThreadNetwork(ctx, W, H, mx, my, t) {
    for (const conn of this.threadConnections) {
      const ax = conn.a.xRel * W + mx * conn.a.parallax * W;
      const ay = conn.a.yRel * H + my * conn.a.parallax * H;
      const bx = conn.b.xRel * W + mx * conn.b.parallax * W;
      const by = conn.b.yRel * H + my * conn.b.parallax * H;

      // Draw base thread
      const alpha = conn.alpha * this.intensity;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      // Bezier with midpoint control
      const cpx = (ax + bx) / 2 + (ay - by) * 0.1;
      const cpy = (ay + by) / 2 + (bx - ax) * 0.1;
      ctx.quadraticCurveTo(cpx, cpy, bx, by);
      ctx.strokeStyle = `rgba(255, 200, 230, ${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Animated flowing light particle along thread
      const flow = ((t * conn.flowSpeed + conn.flowOffset) % 1);
      const ft = flow;
      // Quadratic bezier at t: (1-t)^2*P0 + 2*(1-t)*t*CP + t^2*P1
      const fpx = (1-ft)*(1-ft)*ax + 2*(1-ft)*ft*cpx + ft*ft*bx;
      const fpy = (1-ft)*(1-ft)*ay + 2*(1-ft)*ft*cpy + ft*ft*by;

      ctx.beginPath();
      ctx.arc(fpx, fpy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 230, 255, ${alpha * 3})`;
      ctx.fill();
    }
  }

  _drawStars(ctx, W, H, mx, my, t) {
    for (const star of this.stars) {
      const px = star.xRel * W + mx * star.parallax * W;
      const py = star.yRel * H + my * star.parallax * H;

      // Twinkle
      const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * star.twinkleFreq + star.twinklePhase));
      const brightness = star.baseBrightness * twinkle * this.intensity;
      if (brightness < 0.08) continue;

      let r, g, b;
      if (star.colorType === 'rose') {
        r = 255; g = 180; b = 210;
      } else if (star.colorType === 'gold') {
        r = 255; g = 230; b = 160;
      } else if (star.colorType === 'blue') {
        r = 170; g = 210; b = 255;
      } else {
        r = 220; g = 230; b = 255;
      }

      // Glow halo for bright stars
      if (brightness > 0.6 && star.size > 1.2) {
        const glowR = star.size * 4;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        glow.addColorStop(0, `rgba(${r},${g},${b},${brightness * 0.3})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Star dot
      ctx.fillStyle = `rgba(${r},${g},${b},${brightness})`;
      ctx.beginPath();
      ctx.arc(px, py, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Cross sparkle for large bright stars
      if (brightness > 0.8 && star.size > 1.6) {
        const arm = star.size * 3;
        ctx.strokeStyle = `rgba(${r},${g},${b},${brightness * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(px - arm, py); ctx.lineTo(px + arm, py);
        ctx.moveTo(px, py - arm); ctx.lineTo(px, py + arm);
        ctx.stroke();
      }
    }
  }

  _drawPlanets(ctx, W, H, mx, my, t) {
    for (const p of this.planets) {
      const px = p.xRel * W + mx * p.parallax * W;
      const py = p.yRel * H + my * p.parallax * H + Math.sin(t * p.floatFreq + p.floatPhase) * p.floatAmp;
      const r = p.radius;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rotation);

      // Outer glow
      const outerGlow = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 2.5);
      outerGlow.addColorStop(0, p.base.replace('#', 'rgba(').replace(/([0-9a-fA-F]{2})/g, (m) => parseInt(m, 16) + ',').slice(0, -1) + ', 0.08)');
      // Simpler approach:
      outerGlow.addColorStop(0, `${p.base}18`);
      outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Planet body gradient
      const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
      bodyGrad.addColorStop(0, p.base + 'ff');
      bodyGrad.addColorStop(0.6, p.base + 'cc');
      bodyGrad.addColorStop(1, p.shadow + 'aa');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Surface banding (horizontal stripes)
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.clip();
      for (let band = -1; band <= 1; band++) {
        const by = band * r * 0.4;
        ctx.fillStyle = `rgba(255,255,255,0.05)`;
        ctx.fillRect(-r, by - r * 0.1, r * 2, r * 0.2);
      }
      ctx.restore();

      // Craters (if applicable)
      if (p.hasCraters) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.clip();
        for (const cr of p.craters) {
          const crX = cr.ox * r;
          const crY = cr.oy * r;
          const crR = cr.r * r;
          const crGrad = ctx.createRadialGradient(crX - crR * 0.2, crY - crR * 0.2, 0, crX, crY, crR);
          crGrad.addColorStop(0, `rgba(0,0,0,0.25)`);
          crGrad.addColorStop(0.7, `rgba(0,0,0,0.1)`);
          crGrad.addColorStop(1, `rgba(255,255,255,0.05)`);
          ctx.fillStyle = crGrad;
          ctx.beginPath();
          ctx.arc(crX, crY, crR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Specular highlight
      const specGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 0, -r * 0.2, -r * 0.2, r * 0.55);
      specGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
      specGrad.addColorStop(0.4, 'rgba(255,255,255,0.08)');
      specGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Ring (if applicable)
      if (p.hasRing) {
        ctx.save();
        ctx.scale(1, 0.3);
        ctx.strokeStyle = p.ring;
        ctx.lineWidth = r * 0.18;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  _drawFireflies(ctx, t) {
    for (const f of this.fireflies) {
      const blink = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * f.blinkFreq + f.blinkPhase));
      const alpha = f.brightness * blink * this.intensity;
      if (alpha < 0.05) continue;

      const [r, g, b] = f.color;

      // Outer glow
      const glowGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.glowRadius);
      glowGrad.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.6})`);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  destroy() {
    this.active = false;
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('touchmove', this._onTouchMove);
  }
}

window.UniverseScene = UniverseScene;

