/**
 * Majestic Living 24-Bit ASCII Floating Balloons Engine
 * 
 * Features:
 * - 4 floating 3D spheres rendered directly in Living 24-Bit Monospace ASCII characters.
 * - Each balloon contains its corresponding Living ASCII Teddy Bear inside.
 * - Character palette matching the Living Teddy Bear:
 *   ✦, *, +, %, &, @, #, ♥ (zero-gap dense true-color typography).
 * - Exact aspect-ratio-corrected grid ensuring circular/oval balloons with ZERO scanline gaps.
 * - Sinuous sinusoidal floating bobbing physics + swaying ASCII strings.
 * - Interactive cursor/touch hover: ASCII stardust aura and buoyant lift.
 * - Explosive ASCII pop blast on tap: 85+ glowing crystal characters (✦ ✧ ⋆ ♥ % # @),
 *   shockwave rings, and other balloons floating away into the stars.
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

    // Simulation Canvas (exact ASCII columns x rows grid)
    this.simCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.simCtx = this.simCanvas ? this.simCanvas.getContext('2d', { willReadFrequently: true }) : null;

    // High-Resolution Balloon Staging Canvas for crisp vector & texture rendering
    this.stageCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.stageCtx = this.stageCanvas ? this.stageCanvas.getContext('2d') : null;
    if (this.stageCanvas) {
      this.stageCanvas.width = 480;
      this.stageCanvas.height = 620;
    }

    // Interactive mouse / touch state
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.hoveredIdx = -1;

    // Preload all 4 Teddy Bear images
    this.teddyAssets = [
      'assets/teddy-1-clean.png?v=40.0',
      'assets/teddy-2-clean.png?v=40.0',
      'assets/teddy-3-clean.png?v=40.0',
      'assets/teddy-4-standing-clean.png?v=41.0'
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

    // 4 Saturated 24-Bit Balloon Definitions (Minimum luminosity kept high to prevent dark scanlines)
    this.balloons = [
      {
        id: 0,
        name: 'Hugging Heart',
        desc: 'Warm Hugs & Love',
        baseColor: [255, 195, 25],     // Rich warm honey gold
        shineColor: [255, 250, 210],   // Bright specular cream gold
        shadowColor: [215, 125, 12],   // Saturated amber gold (NOT black/brown)
        rimColor: [255, 220, 80],
        knotColor: [225, 135, 15],
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
        baseColor: [195, 110, 255],    // Radiant celestial violet
        shineColor: [250, 238, 255],   // Luminous lavender white
        shadowColor: [140, 50, 220],   // Saturated deep violet
        rimColor: [215, 145, 255],
        knotColor: [155, 60, 230],
        phase: 1.3,
        popping: false,
        popTime: 0,
        floatingAway: false,
        floatYOffset: 0
      },
      {
        id: 2,
        name: 'Heart Balloon',
        desc: 'Joyful Floating Smiles',
        baseColor: [255, 95, 180],     // Vibrant romantic magenta-pink
        shineColor: [255, 240, 248],   // Luminous pearl rose
        shadowColor: [205, 30, 120],   // Saturated velvet rose
        rimColor: [255, 140, 205],
        knotColor: [215, 35, 130],
        phase: 2.6,
        popping: false,
        popTime: 0,
        floatingAway: false,
        floatYOffset: 0
      },
      {
        id: 3,
        name: 'Love Balloon',
        desc: 'Infinite Devotion',
        baseColor: [255, 65, 105],     // Passionate radiant crimson
        shineColor: [255, 235, 240],   // Specular blush white
        shadowColor: [210, 20, 65],    // Saturated velvet ruby
        rimColor: [255, 110, 145],
        knotColor: [220, 25, 75],
        phase: 3.9,
        popping: false,
        popTime: 0,
        floatingAway: false,
        floatYOffset: 0
      }
    ];

    // Particle systems
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

    // Density grid matching AsciiTeddy (~7.0 - 8.2 CSS px cell height)
    const targetCellH = Math.max(7.0, Math.min(8.2, cssH / 115));
    this.rows = Math.max(85, Math.min(135, Math.round(cssH / targetCellH)));
    this.columns = Math.round(this.rows * (w / h) / this.charAspect);

    if (this.simCanvas) {
      this.simCanvas.width = this.columns;
      this.simCanvas.height = this.rows;
    }

    this.updateBalloonPositions();
  }

  updateBalloonPositions() {
    const isMobile = this.cssW < 680;
    const cols = this.columns;
    const rows = this.rows;

    if (isMobile) {
      // 2x2 Grid on Mobile
      const colCenters = [Math.round(cols * 0.28), Math.round(cols * 0.72)];
      const rowCenters = [Math.round(rows * 0.27), Math.round(rows * 0.68)];

      // Sized comfortably to fill mobile viewport
      const radY = Math.min(Math.round(rows * 0.13), 16);
      const radX = Math.round((radY * 0.82) / this.charAspect);

      this.balloons[0].col = colCenters[0];
      this.balloons[0].row = rowCenters[0];
      this.balloons[1].col = colCenters[1];
      this.balloons[1].row = rowCenters[0];
      this.balloons[2].col = colCenters[0];
      this.balloons[2].row = rowCenters[1];
      this.balloons[3].col = colCenters[1];
      this.balloons[3].row = rowCenters[1];

      this.balloons.forEach(b => {
        b.radX = radX;
        b.radY = radY;
      });
    } else {
      // 4 Horizontal Row on Desktop / Tablets
      const cy = Math.round(rows * 0.48);
      const spacing = cols / 5;

      // Generous, majestic balloon sizing: ~22-26 rows tall, ~32-38 cols wide
      const radY = Math.min(Math.round(rows * 0.20), 24);
    const radX = Math.round((radY * 0.72) / this.charAspect);

      for (let i = 0; i < 4; i++) {
        this.balloons[i].col = Math.round(spacing * (i + 1));
        this.balloons[i].row = cy;
        this.balloons[i].radX = radX;
        this.balloons[i].radY = radY;
      }
    }

    // Compute screen pixel coordinates for CSS hit testing & particle origins
    const cellW_css = this.cssW / this.columns;
    const cellH_css = this.cssH / this.rows;

    this.balloons.forEach(b => {
      b.screenX = b.col * cellW_css;
      b.screenY = b.row * cellH_css;
      b.screenRadX = b.radX * cellW_css;
      b.screenRadY = b.radY * cellH_css;
    });
  }

  updateHoverState() {
    let newHover = -1;
    for (let i = 0; i < this.balloons.length; i++) {
      const b = this.balloons[i];
      if (b.popping || b.floatingAway) continue;
      const dx = this.mouseX - b.screenX;
      const dy = this.mouseY - (b.screenY + b.floatYOffset);
        const distSq = (dx * dx) / (b.screenRadX * b.screenRadX) + (dy * dy) / (b.screenRadY * b.screenRadY);
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
          const distSq = (dx * dx) / (b.screenRadX * b.screenRadX) + (dy * dy) / (b.screenRadY * b.screenRadY);
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

          // 1. Shatter into 85+ glowing ASCII crystal shards
          for (let i = 0; i < 90; i++) {
            const ang = Math.random() * Math.PI * 2;
            const speed = 90 + Math.random() * 320;
            const symbols = ['✦', '✧', '⋆', '♥', '♡', '•', '*', '+', '%', '#', '@', '&'];
            const isGold = Math.random() > 0.45;
            const shardColor = isGold ? balloon.shineColor : balloon.baseColor;

            this.popShards.push({
              x: bx,
              y: by,
              vx: Math.cos(ang) * speed,
              vy: Math.sin(ang) * speed - 50,
              life: 0,
              maxLife: 0.70 + Math.random() * 0.45,
              char: symbols[Math.floor(Math.random() * symbols.length)],
              color: shardColor,
        size: 13 + Math.random() * 9
            });
          }

          // 2. Expanding Shockwave Ring
          this.shockwaves.push({
            x: bx,
            y: by,
            r: 12,
            maxR: Math.max(balloon.screenRadX, balloon.screenRadY) * 3.6,
            life: 0,
            maxLife: 0.65,
            color: balloon.baseColor
          });

          // 3. Float other balloons away upwards into the night sky
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
        // Vector Staging: Render a Single 3D Spherical Balloon onto Staging Canvas
        // =========================================================================
          renderSingleBalloonToStage(balloon, index, isHovered, tNow) {
            const sW = this.stageCanvas.width;
            const sH = this.stageCanvas.height;
            const ctx = this.stageCtx;
            ctx.clearRect(0, 0, sW, sH);

            const cx = sW * 0.5;
            const cy = sH * 0.42;
            const rx = sW * 0.42;
            const ry = sH * 0.36;

              ctx.save();

              // 1. Swaying String dangling from bottom knot
              const stringLen = sH * 0.28;
              const sway = Math.sin(tNow * 2.5 + balloon.phase) * 14;
              ctx.beginPath();
              ctx.moveTo(cx, cy + ry);
              ctx.quadraticCurveTo(cx + sway * 0.5, cy + ry + stringLen * 0.5, cx + sway, cy + ry + stringLen);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)';
              ctx.lineWidth = 4.0;
              ctx.stroke();

              // 2. Bottom Tie Knot
              const [kr, kg, kb] = balloon.knotColor;
              ctx.beginPath();
              ctx.fillStyle = `rgb(${kr}, ${kg}, ${kb})`;
              ctx.moveTo(cx - 16, cy + ry - 4);
              ctx.lineTo(cx + 16, cy + ry - 4);
              ctx.lineTo(cx + 24, cy + ry + 16);
              ctx.lineTo(cx - 24, cy + ry + 16);
              ctx.closePath();
              ctx.fill();

              // 3. 3D Spherical Balloon Body with Natural Balloon Silhouette
              ctx.beginPath();
              ctx.moveTo(cx, cy - ry);
              ctx.bezierCurveTo(cx + rx * 1.06, cy - ry * 0.95, cx + rx * 1.04, cy + ry * 0.40, cx + rx * 0.26, cy + ry);
              ctx.lineTo(cx - rx * 0.26, cy + ry);
              ctx.bezierCurveTo(cx - rx * 1.04, cy + ry * 0.40, cx - rx * 1.06, cy - ry * 0.95, cx, cy - ry);
              ctx.closePath();

              const [br, bg, bb] = balloon.baseColor;
              const [sr, sg, sb] = balloon.shineColor;
              const [dr, dg, db] = balloon.shadowColor;
              const [rr, rg, rb] = balloon.rimColor;

              // Specular highlight centered slightly upper-left
              const grad = ctx.createRadialGradient(cx - rx * 0.35, cy - ry * 0.35, rx * 0.08, cx, cy, Math.max(rx, ry) * 1.05);
              grad.addColorStop(0.00, `rgb(${sr}, ${sg}, ${sb})`);
              grad.addColorStop(0.22, `rgb(${sr}, ${sg}, ${sb})`);
              grad.addColorStop(0.55, `rgb(${br}, ${bg}, ${bb})`);
              grad.addColorStop(0.85, `rgb(${dr}, ${dg}, ${db})`);
              grad.addColorStop(1.00, `rgb(${rr}, ${rg}, ${rb})`);

              ctx.fillStyle = grad;
              ctx.shadowColor = `rgba(${br}, ${bg}, ${bb}, ${isHovered ? 0.95 : 0.70})`;
              ctx.shadowBlur = isHovered ? 36 : 22;
              ctx.fill();
              ctx.shadowBlur = 0;

              // 4. Specular Curved Sheen Arc
              ctx.save();
              ctx.beginPath();
              ctx.ellipse(cx - rx * 0.35, cy - ry * 0.35, rx * 0.28, ry * 0.36, -0.6, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
              ctx.fill();
              ctx.restore();

              // 5. Miniature Teddy Bear nestled inside
              if (this.imagesLoaded[index] && this.teddyImages[index]) {
                const img = this.teddyImages[index];
                const targetW = rx * 1.30;
                const targetH = ry * 1.30;
                const aspect = img.width / img.height;
                let dw = targetW;
                let dh = dw / aspect;
                if (dh > targetH) {
                  dh = targetH;
                  dw = dh * aspect;
                }

                ctx.save();
                ctx.globalAlpha = isHovered ? 0.98 : 0.92;
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 10;
                ctx.drawImage(img, cx - dw * 0.5, cy - dh * 0.5 - ry * 0.04, dw, dh);
                ctx.restore();
              }

            ctx.restore();
          }

          // =========================================================================
          // Main True-Color 24-Bit ASCII Typography Render Loop
          // Matches AsciiTeddy exactly: zero-gap typography with ✦, *, +, %, &, @, #, ♥
          // =========================================================================
          render(tNow, dt) {
            if (!this.canvas || !this.ctx || !this.simCanvas || !this.simCtx || !this.stageCanvas || !this.stageCtx) return;

            const cols = this.columns;
            const rows = this.rows;
            const simCtx = this.simCtx;
            simCtx.clearRect(0, 0, cols, rows);

            // 1. Draw each active balloon onto simCanvas with exact aspect ratio
            for (let i = 0; i < this.balloons.length; i++) {
              const b = this.balloons[i];
              if (b.popping) continue;

              if (b.floatingAway) {
                b.floatYOffset -= 260 * 0.016;
              } else {
                b.floatYOffset = Math.sin(tNow * 1.8 + b.phase) * (b.screenRadY * 0.16);
              }

              const isHovered = (i === this.hoveredIdx);
              const hoverScale = isHovered ? 1.08 : 1.0;

              // Render crisp vector stage for this balloon
              this.renderSingleBalloonToStage(b, i, isHovered, tNow);

              // Draw onto simCanvas with exact row and col dimensions
              const drawRadX = Math.round(b.radX * hoverScale);
              const drawRadY = Math.round(b.radY * hoverScale);
              const floatRowOffset = Math.round((b.floatYOffset / this.cssH) * rows);
              const destX = Math.round(b.col - drawRadX);
              const destY = Math.round(b.row + floatRowOffset - drawRadY);
              const destW = drawRadX * 2;
              const destH = drawRadY * 2;

              simCtx.drawImage(
                this.stageCanvas,
                0, 0, this.stageCanvas.width, this.stageCanvas.height,
                destX, destY, destW, destH
              );
            }

            // 2. Read simulation pixels and render Living ASCII Art
            const simImg = simCtx.getImageData(0, 0, cols, rows);
            const data = simImg.data;

            const W = this.canvas.width;
            const H = this.canvas.height;
            const cellW = W / cols;
            const cellH = H / rows;

            const ctx = this.ctx;
            ctx.clearRect(0, 0, W, H);

            // ZERO-GAP GUARANTEE: font size overlaps cell height by 35% for tight, seamless packing
            const fontSize = Math.max(10, Math.ceil(cellH * 1.36));
            ctx.font = `bold ${fontSize}px "JetBrains Mono", Menlo, Consolas, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const dpr = this.dpr || 1;
            const stardustTime = Math.floor(tNow * 3.0);

            for (let r = 0; r < rows; r++) {
              const posY = r * cellH + cellH * 0.5;
              const rowOffset = r * cols * 4;

              for (let c = 0; c < cols; c++) {
                const offset = rowOffset + c * 4;
                let red = data[offset];
                let grn = data[offset + 1];
                let blu = data[offset + 2];
                const alpha = data[offset + 3] / 255;

                const posX = c * cellW + cellW * 0.5;

                // Ambient floating golden stardust fireflies
                let isStardust = false;
                if (alpha < 0.08) {
                  const hash = Math.sin(c * 17.1 + (r + stardustTime) * 31.7) * 43758.5453;
                  if ((hash - Math.floor(hash)) < 0.0035) {
                    isStardust = true;
                    red = 255;
                    grn = 220;
                    blu = 120;
                  }
                }

                if (alpha < 0.12 && !isStardust) continue;

                const maxC = Math.max(red, grn, blu);
                const lum = (0.55 * (maxC / 255) + 0.45 * (0.299 * red + 0.587 * grn + 0.114 * blu) / 255);

                // Heart & Teddy Detection inside the balloon
                const isHeartColor = (red - grn >= 46) && (red - blu >= 42) && (grn - blu <= 20) && (red > 125);

                // Character selection matching AsciiTeddy & user reference: ✦, *, +, %, &, @, #, ♥
                let char = '#';
                if (isStardust) {
                  char = '✦';
                } else if (isHeartColor) {
                  char = '♥';
                } else if (lum > 0.88) {
                  char = '✦';
                } else if (lum > 0.74) {
                  char = '*';
                } else if (lum > 0.60) {
                  char = '+';
                } else if (lum > 0.44) {
                  char = '%';
                } else if (lum > 0.30) {
                  char = '&';
                } else if (lum > 0.16) {
                  char = '@';
                } else {
                  char = '#';
                }

                // True 24-bit vibrant output color
                if (isStardust) {
                  ctx.fillStyle = `rgba(255, 225, 130, ${0.7 + 0.3 * Math.sin(tNow * 4 + r)})`;
                  ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                  ctx.shadowBlur = 4;
                } else {
                  // Boost brightness slightly for high contrast against the dark cosmic sky
                  const rBoost = Math.min(255, Math.floor(red * 1.08 + 12));
                  const gBoost = Math.min(255, Math.floor(grn * 1.08 + 12));
                  const bBoost = Math.min(255, Math.floor(blu * 1.08 + 12));
                  ctx.fillStyle = `rgb(${rBoost}, ${gBoost}, ${bBoost})`;

                  if (isHeartColor || lum > 0.82) {
                    ctx.shadowColor = `rgba(${rBoost}, ${gBoost}, ${bBoost}, 0.75)`;
                    ctx.shadowBlur = 4;
                  } else {
                    ctx.shadowBlur = 0;
                  }
                }

                ctx.fillText(char, posX, posY);
              }
            }

            // 3. Render Explosive Shard Particles from popped balloon
            for (let i = this.popShards.length - 1; i >= 0; i--) {
              const p = this.popShards[i];
              p.life += dt;
              if (p.life >= p.maxLife) {
                this.popShards.splice(i, 1);
                continue;
              }

              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.vy += 140 * dt; // gravity

              const k = 1.0 - (p.life / p.maxLife);
              const [pr, pg, pb] = p.color;

              ctx.save();
              ctx.font = `bold ${Math.round(p.size * dpr)}px Menlo, Consolas, monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${k.toFixed(2)})`;
              ctx.shadowColor = `rgba(${pr}, ${pg}, ${pb}, 0.95)`;
              ctx.shadowBlur = 14;
              ctx.fillText(p.char, p.x * dpr, p.y * dpr);
              ctx.restore();
            }

            // 4. Render Expanding Shockwaves
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
              ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, ${(alpha * 0.85).toFixed(2)})`;
              ctx.lineWidth = Math.max(2, (1.0 - prog) * 5 * dpr);
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
