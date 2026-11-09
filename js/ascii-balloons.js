/**
 * Majestic Living 24-Bit ASCII Floating Balloons Engine
 * 
 * Features:
 * - 4 floating 3D spheres rendered entirely out of colored ASCII characters.
 * - Each balloon houses its corresponding ASCII Teddy Bear inside.
 * - Dynamic harmonic floating bobbing physics (sine waves + string sway).
 * - High-DPR true-color 24-bit ASCII rasterization matching the Carrier Dove and Teddy Bear.
 * - Interactive cursor/touch hover: ASCII stardust aura and buoyant lift.
 * - Explosive ASCII pop blast on tap: shattered glowing crystal shards (✦ ✧ ⋆ ♥),
 *   shockwave rings, and other balloons floating into the night sky.
 * - Seamless handoff to full Living ASCII Teddy Bear stage.
 */

export class AsciiBalloons {
  constructor(canvas, onSelect = null) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.onSelect = onSelect;

    this.isRunning = false;
    this.animId = null;
    this.hasTriggeredSelect = false;

    // Simulation & Staging Canvases
    this.simCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.simCtx = this.simCanvas ? this.simCanvas.getContext('2d', { willReadFrequently: true }) : null;

    this.stageCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.stageCtx = this.stageCanvas ? this.stageCanvas.getContext('2d') : null;

    // Interactive mouse / touch state
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.hoveredIdx = -1;

    // ASCII Shading Character Ramp
    this.densityChars = "  ·.:~=+*✦#%@&";
    this.bodyChars = "+*#%@$&";
    this.sparkleChars = ['✦', '✧', '⋆', '·', '♥', '♡'];

    // Preload all 4 Teddy Bear images
    this.teddyAssets = [
      'assets/teddy-1-clean.png?v=37.0',
      'assets/teddy-2-clean.png?v=37.0',
      'assets/teddy-3-clean.png?v=37.0',
      'assets/teddy-4-standing-clean.png?v=37.0'
    ];
    this.teddyImages = [];
    this.imagesLoaded = [false, false, false, false];

    this.teddyAssets.forEach((src, idx) => {
      const img = new Image();
      img.onload = () => {
        this.imagesLoaded[idx] = true;
      };
      img.src = src;
      this.teddyImages.push(img);
    });

    // 4 Balloon Definitions
    this.balloons = [
      {
        id: 0,
        name: 'Hugging Heart',
        desc: 'Warm Hugs & Love',
        baseColor: [245, 158, 11],
        shineColor: [255, 235, 160],
        darkColor: [120, 53, 15],
        knotColor: [180, 83, 9],
        phase: 0.0,
        popping: false,
        popTime: 0,
        floatingAway: false,
        floatYOffset: 0
      },
      {
        id: 1,
        name: 'Sweet Dreams',
        desc: 'Cozy Starry Peace',
        baseColor: [168, 85, 247],
        shineColor: [243, 232, 255],
        darkColor: [76, 29, 149],
        knotColor: [126, 34, 206],
        phase: 1.2,
        popping: false,
        popTime: 0,
        floatingAway: false,
        floatYOffset: 0
      },
      {
        id: 2,
        name: 'Heart Balloon',
        desc: 'Joyful Floating Smiles',
        baseColor: [236, 72, 153],
        shineColor: [253, 242, 248],
        darkColor: [131, 24, 67],
        knotColor: [190, 24, 93],
        phase: 2.4,
        popping: false,
        popTime: 0,
        floatingAway: false,
        floatYOffset: 0
      },
      {
        id: 3,
        name: 'Love Balloon',
        desc: 'Infinite Devotion',
        baseColor: [244, 63, 94],
        shineColor: [255, 228, 230],
        darkColor: [112, 11, 37],
        knotColor: [159, 18, 57],
        phase: 3.6,
        popping: false,
        popTime: 0,
        floatingAway: false,
        floatYOffset: 0
      }
    ];

    // Particle systems
    this.stardustParticles = [];
    this.popShards = [];
    this.shockwaves = [];

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    this.bindEvents();
  }

  bindEvents() {
    if (typeof window === 'undefined') return;

    const onMove = (e) => {
      const x = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const y = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (x === null || y === null || !this.canvas) return;

      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = x - rect.left;
      this.mouseY = y - rect.top;

      this.updateHoverState();
    };

    const onClick = (e) => {
      if (!this.isRunning || this.hasTriggeredSelect) return;
      const x = e.clientX ?? (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null);
      const y = e.clientY ?? (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : null);
      if (x === null || y === null || !this.canvas) return;

      const rect = this.canvas.getBoundingClientRect();
      const clickX = x - rect.left;
      const clickY = y - rect.top;

      const hitIdx = this.hitTest(clickX, clickY);
      if (hitIdx !== -1) {
        this.popBalloon(hitIdx);
      }
    };

    this.canvas.addEventListener('mousemove', onMove, { passive: true });
    this.canvas.addEventListener('touchmove', onMove, { passive: true });
    this.canvas.addEventListener('click', onClick);
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      onClick(e);
    });

    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;

    const rect = this.canvas.getBoundingClientRect();
    const cssW = Math.round(rect.width || window.innerWidth || 800);
    const cssH = Math.round(rect.height || window.innerHeight || 800);
    const w = cssW * dpr;
    const h = cssH * dpr;

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    this.cssW = cssW;
    this.cssH = cssH;
    this.charAspect = 0.55;

    // High density grid for crisp readable ASCII art
    const isMobile = cssW < 768;
    const targetCellH = isMobile ? Math.max(7.0, cssH / 115) : Math.max(7.5, cssH / 130);
    this.rows = Math.max(80, Math.min(140, Math.round(cssH / targetCellH)));
    this.columns = Math.round(this.rows * (w / h) / this.charAspect);

    if (this.simCanvas) {
      this.simCanvas.width = this.columns;
      this.simCanvas.height = this.rows;
    }

    if (this.stageCanvas) {
      this.stageCanvas.width = this.columns * 2;
      this.stageCanvas.height = this.rows * 2;
    }

    // Compute Balloon Target Screen Layout
    this.updateBalloonPositions();
  }

  updateBalloonPositions() {
    const isMobile = this.cssW < 680;
    const w = this.cssW;
    const h = this.cssH;

    if (isMobile) {
      // 2x2 Grid on Mobile
      const cols = [w * 0.28, w * 0.72];
      const rows = [h * 0.36, h * 0.68];
      const radX = Math.min(w * 0.16, 52);
      const radY = radX * 1.25;

      this.balloons[0].screenX = cols[0];
      this.balloons[0].screenY = rows[0];
      this.balloons[1].screenX = cols[1];
      this.balloons[1].screenY = rows[0];
      this.balloons[2].screenX = cols[0];
      this.balloons[2].screenY = rows[1];
      this.balloons[3].screenX = cols[1];
      this.balloons[3].screenY = rows[1];

      this.balloons.forEach(b => {
        b.radX = radX;
        b.radY = radY;
      });
    } else {
      // 4 Horizontal Row on Desktop / Tablets
      const cy = h * 0.48;
      const spacing = w / 5;
      const radX = Math.min(w * 0.08, 62);
      const radY = radX * 1.28;

      for (let i = 0; i < 4; i++) {
        this.balloons[i].screenX = spacing * (i + 1);
        this.balloons[i].screenY = cy;
        this.balloons[i].radX = radX;
        this.balloons[i].radY = radY;
      }
    }
  }

  updateHoverState() {
    let newHover = -1;
    for (let i = 0; i < this.balloons.length; i++) {
      const b = this.balloons[i];
      if (b.popping || b.floatingAway) continue;
      const dx = this.mouseX - b.screenX;
      const dy = this.mouseY - (b.screenY + b.floatYOffset);
      const distSq = (dx * dx) / (b.radX * b.radX) + (dy * dy) / (b.radY * b.radY);
      if (distSq <= 1.35) {
        newHover = i;
        break;
      }
    }
    this.hoveredIdx = newHover;
    if (this.canvas) {
      this.canvas.style.cursor = newHover !== -1 ? 'pointer' : 'default';
    }
  }

  hitTest(x, y) {
    for (let i = 0; i < this.balloons.length; i++) {
      const b = this.balloons[i];
      if (b.popping || b.floatingAway) continue;
      const dx = x - b.screenX;
      const dy = y - (b.screenY + b.floatYOffset);
      const distSq = (dx * dx) / (b.radX * b.radX) + (dy * dy) / (b.radY * b.radY);
      if (distSq <= 1.45) {
        return i;
      }
    }
    return -1;
  }

  popBalloon(index) {
    if (this.hasTriggeredSelect) return;
    const balloon = this.balloons[index];
    if (!balloon || balloon.popping) return;

    this.hasTriggeredSelect = true;
    balloon.popping = true;
    balloon.popTime = performance.now() / 1000;

    const bx = balloon.screenX;
    const by = balloon.screenY + balloon.floatYOffset;

    // 1. Shatter into 70+ radiant ASCII crystal shards
    for (let i = 0; i < 75; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 260;
      const symbols = ['✦', '✧', '⋆', '♥', '♡', '•', '*', '+', '#'];
      const isGold = Math.random() > 0.5;
      const shardColor = isGold ? balloon.shineColor : balloon.baseColor;

      this.popShards.push({
        x: bx,
        y: by,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 30,
        life: 0,
        maxLife: 0.65 + Math.random() * 0.45,
        char: symbols[Math.floor(Math.random() * symbols.length)],
        color: shardColor,
        size: 11 + Math.random() * 7
      });
    }

    // 2. Expanding shockwave ring
    this.shockwaves.push({
      x: bx,
      y: by,
      r: 8,
      maxR: Math.max(balloon.radX, balloon.radY) * 3.2,
      life: 0,
      maxLife: 0.6,
      color: balloon.baseColor
    });

    // 3. Float other balloons away into the starry sky
    this.balloons.forEach((b, idx) => {
      if (idx !== index) {
        b.floatingAway = true;
      }
    });

    // 4. Callback handover to Teddy Bear
    setTimeout(() => {
      if (this.onSelect) {
        this.onSelect(index);
      }
    }, 420);
  }

  // =========================================================================
  // Vector Stage Drawing: 4 ASCII Balloon Spheres & Miniature Teddy Bears
  // =========================================================================
  drawBalloonsStage(ctx, tNow) {
    const sW = this.stageCanvas.width;
    const sH = this.stageCanvas.height;
    ctx.clearRect(0, 0, sW, sH);

    const scaleX = sW / this.cssW;
    const scaleY = sH / this.cssH;

    for (let i = 0; i < this.balloons.length; i++) {
      const b = this.balloons[i];

      // Handle Popping
      if (b.popping) {
        continue;
      }

      // Handle Floating Away
      if (b.floatingAway) {
        b.floatYOffset -= 240 * 0.016;
      } else {
        // Natural harmonic bobbing
        b.floatYOffset = Math.sin(tNow * 1.8 + b.phase) * (b.radY * 0.16);
      }

      const bx = b.screenX * scaleX;
      const by = (b.screenY + b.floatYOffset) * scaleY;
      const rx = b.radX * scaleX;
      const ry = b.radY * scaleY;

      const isHovered = (i === this.hoveredIdx);
      const hoverScale = isHovered ? 1.08 : 1.0;

      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(hoverScale, hoverScale);

      // A. Swaying curved string in pure ASCII line
      const stringLen = ry * 0.75;
      const sway = Math.sin(tNow * 2.2 + b.phase) * 6;
      ctx.beginPath();
      ctx.moveTo(0, ry);
      ctx.quadraticCurveTo(sway * 0.5, ry + stringLen * 0.5, sway, ry + stringLen);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // B. Knot polygon
      ctx.beginPath();
      const [kr, kg, kb] = b.knotColor;
      ctx.fillStyle = `rgb(${kr}, ${kg}, ${kb})`;
      ctx.moveTo(-rx * 0.12, ry - 2);
      ctx.lineTo(rx * 0.12, ry - 2);
      ctx.lineTo(rx * 0.18, ry + 7);
      ctx.lineTo(-rx * 0.18, ry + 7);
      ctx.closePath();
      ctx.fill();

      // C. 3D Spherical Balloon Body with specular highlights
      ctx.beginPath();
      // Egg shape (curved rounded balloon)
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);

      const [br, bg, bb] = b.baseColor;
      const [sr, sg, sb] = b.shineColor;
      const [dr, dg, db] = b.darkColor;

      // Radial 3D Sphere Shading
      const grad = ctx.createRadialGradient(-rx * 0.32, -ry * 0.32, rx * 0.1, 0, 0, Math.max(rx, ry) * 1.15);
      grad.addColorStop(0, `rgb(${sr}, ${sg}, ${sb})`);
      grad.addColorStop(0.35, `rgb(${br}, ${bg}, ${bb})`);
      grad.addColorStop(0.78, `rgb(${dr}, ${dg}, ${db})`);
      grad.addColorStop(1, `rgba(${dr * 0.7 | 0}, ${dg * 0.7 | 0}, ${db * 0.7 | 0}, 0.95)`);

      ctx.fillStyle = grad;
      ctx.shadowColor = `rgba(${br}, ${bg}, ${bb}, ${isHovered ? 0.9 : 0.6})`;
      ctx.shadowBlur = isHovered ? 24 : 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // D. Inner Specular Sheen Crescent
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-rx * 0.35, -ry * 0.35, rx * 0.28, ry * 0.38, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();
      ctx.restore();

      // E. Draw miniature Teddy Bear inside the balloon!
      if (this.imagesLoaded[i] && this.teddyImages[i]) {
        const img = this.teddyImages[i];
        const teddyW = rx * 1.35;
        const teddyH = ry * 1.35;
        const aspect = img.width / img.height;
        let dw = teddyW;
        let dh = dw / aspect;
        if (dh > teddyH) {
          dh = teddyH;
          dw = dh * aspect;
        }

        ctx.save();
        ctx.globalAlpha = isHovered ? 0.98 : 0.90;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.drawImage(img, -dw * 0.5, -dh * 0.5 - ry * 0.05, dw, dh);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // =========================================================================
  // Main True-Color 24-Bit ASCII Rasterization Render Loop
  // =========================================================================
  render(tNow, dt) {
    if (!this.canvas || !this.ctx || !this.simCanvas || !this.simCtx || !this.stageCanvas || !this.stageCtx) return;

    // 1. Draw vectors & images to stageCanvas
    this.drawBalloonsStage(this.stageCtx, tNow);

    // 2. Transfer to simCanvas (columns x rows)
    const cols = this.columns;
    const rows = this.rows;
    this.simCtx.clearRect(0, 0, cols, rows);
    this.simCtx.drawImage(this.stageCanvas, 0, 0, this.stageCanvas.width, this.stageCanvas.height, 0, 0, cols, rows);

    // 3. Read pixels & render 24-bit Living ASCII Cells
    const simImg = this.simCtx.getImageData(0, 0, cols, rows);
    const data = simImg.data;

    const W = this.canvas.width;
    const H = this.canvas.height;
    const cellW = W / cols;
    const cellH = H / rows;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    const fontSize = Math.max(8, Math.round(cellH * 1.18));
    ctx.font = `bold ${fontSize}px Menlo, Consolas, "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const numChars = this.densityChars.length;
    const dpr = this.dpr || 1;

    for (let r = 0; r < rows; r++) {
      const posY = r * cellH + cellH * 0.5;
      const rowOffset = r * cols * 4;

      for (let c = 0; c < cols; c++) {
        const offset = rowOffset + c * 4;
        const alpha = data[offset + 3] / 255;
        if (alpha < 0.04) continue;

        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];

        // Perceived luminance
        const lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
        let charIdx = Math.min(numChars - 1, Math.floor(lum * numChars));
        let ch = this.densityChars[charIdx];

        // Boost high-luminance specular highlights with special sparkle glyphs
        if (lum > 0.92) {
          ch = '✦';
        } else if (lum > 0.82) {
          ch = '*';
        }

        const posX = c * cellW + cellW * 0.5;

        // True 24-bit glow
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(2)})`;
        ctx.fillText(ch, posX, posY);
      }
    }

    // 4. Render Explosive Shard Particles from popped balloon
    for (let i = this.popShards.length - 1; i >= 0; i--) {
      const p = this.popShards[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.popShards.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // gravity

      const k = 1.0 - (p.life / p.maxLife);
      const [pr, pg, pb] = p.color;

      ctx.save();
      ctx.font = `bold ${Math.round(p.size * dpr)}px Menlo, Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${k.toFixed(2)})`;
      ctx.shadowColor = `rgba(${pr}, ${pg}, ${pb}, 0.9)`;
      ctx.shadowBlur = 10;
      ctx.fillText(p.char, p.x * dpr, p.y * dpr);
      ctx.restore();
    }

    // 5. Render Expanding Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      if (sw.life >= sw.maxLife) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      const prog = sw.life / sw.maxLife;
      const curR = sw.r + (sw.maxR - sw.r) * Math.pow(prog, 0.7);
      const alpha = 1.0 - prog;
      const [sr, sg, sb] = sw.color;

      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x * dpr, sw.y * dpr, curR * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, ${(alpha * 0.75).toFixed(2)})`;
      ctx.lineWidth = Math.max(2, (1.0 - prog) * 4 * dpr);
      ctx.stroke();
      ctx.restore();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.hasTriggeredSelect = false;
    let lastTime = performance.now();

    const loop = (now) => {
      if (!this.isRunning) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      this.render(now / 1000, dt);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  reset() {
    this.hasTriggeredSelect = false;
    this.popShards = [];
    this.shockwaves = [];
    this.balloons.forEach(b => {
      b.popping = false;
      b.popTime = 0;
      b.floatingAway = false;
      b.floatYOffset = 0;
    });
    this.updateBalloonPositions();
  }
}

