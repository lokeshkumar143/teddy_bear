/**
 * teddyAsciiRenderer.js
 * ============================================================================
 * Cinematic Cyber-Romantic ASCII Teddy Bear Canvas 2D Pipeline.
 * Fullscreen Responsive Architecture (100vw x 100svh):
 * - Zero pillarboxing, zero black margins on any device
 * - Proportional SDF coordinate scaling for 70x68 character matrix
 * - Dynamic 3D lighting, radiant chest heart illumination, and fur density maps
 * - Integrates with multi-layer animation (breathing, blinking, waving, gazing)
 * ============================================================================
 */

class TeddyAsciiRenderer {
  constructor(canvas, geometry, parts, lighting, animation) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.geo = geometry;
    this.parts = parts;
    this.lighting = lighting;
    this.anim = animation;

    // Grid configuration matching verified visual anatomy
    this.COLS = 70;
    this.ROWS = 68;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.CELL_W = 14;
    this.CELL_H = 20;
    this.GRID_X0 = 0;
    this.GRID_Y0 = 0;
    this.CENTER_X = this.width / 2;
    this.CENTER_Y = this.height * 0.42;
    this.SCENE_SCALE = 800;

    // Optional user photo for Polaroid integration
    this.userPhoto = null;
    this.userPhotoUrl = null;

    // Precomputed canonical cell matrix
    this.canonicalGrid = [];

    // Portal Warp Transition State
    this.portalActive = false;
    this.portalProgress = 0.0;

    // Connect animation callbacks to renderer
    this.anim.onNameChanged = () => this.precomputeGrid();
    this.anim.onThemeChanged = () => this.precomputeGrid();

    this.setupCanvas();
  }

  setupCanvas(customW = null, customH = null) {
    this.width = customW || window.innerWidth;
    this.height = customH || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const isLandscape = (this.width > this.height && this.width > 800);

    // Responsive positioning & scaling
    if (isLandscape) {
      this.CENTER_X = this.userPhoto ? this.width * 0.42 : this.width * 0.50;
      this.CENTER_Y = this.height * 0.44;
      this.SCENE_SCALE = Math.min(this.height * 0.62, this.width * 0.44);
    } else {
      this.CENTER_X = this.width * 0.50;
      this.CENTER_Y = this.height * 0.38;
      this.SCENE_SCALE = Math.min(this.width * 0.90, this.height * 0.50);
    }

    this.CELL_W = (this.SCENE_SCALE * 0.92) / this.COLS;
    this.CELL_H = (this.SCENE_SCALE * 1.32) / this.ROWS;
    this.GRID_X0 = Math.floor(this.CENTER_X - (this.COLS * this.CELL_W) / 2);
    this.GRID_Y0 = Math.floor(this.CENTER_Y - (this.ROWS * this.CELL_H) / 2);

    this.precomputeGrid();
  }

  setPhoto(photoImg, photoUrl) {
    this.userPhoto = photoImg;
    this.userPhotoUrl = photoUrl;
    this.setupCanvas();
  }

  /**
   * Precomputes cell geometry, ASCII density ramps, 3D normal lighting,
   * and theme colorways for all 70x68 grid cells.
   */
  precomputeGrid() {
    this.canonicalGrid = [];
    const badgeText = this.geo.formatBadgeText(this.anim.name);
    const badgeStartC = Math.floor((this.COLS - badgeText.length) / 2);
    const BADGE_ROW = 40; // Aligns with radiant heart center on chest
    const theme = this.anim.getTheme();

    for (let r = 0; r < this.ROWS; r++) {
      const row = [];
      const py = this.GRID_Y0 + r * this.CELL_H + this.CELL_H / 2;
      const ny = (py - this.CENTER_Y) / this.SCENE_SCALE;
      const isBadgeRow = (r === BADGE_ROW);

      for (let c = 0; c < this.COLS; c++) {
        const px = this.GRID_X0 + c * this.CELL_W + this.CELL_W / 2;
        const nx = (px - this.CENTER_X) / this.SCENE_SCALE;

        const badgeIdx = c - badgeStartC;
        const isBadgeCol = isBadgeRow && (badgeIdx >= 0 && badgeIdx < badgeText.length);
        const bChar = isBadgeCol ? badgeText[badgeIdx] : "";

        // Evaluate anatomy
        const evalRes = this.geo.evalPoint(nx, ny, null, this.anim.name, isBadgeCol, bChar);
        if (isBadgeCol && evalRes.part === "heart") {
          evalRes.part = "badge";
          evalRes.badgeChar = bChar;
          evalRes.isBadge = true;
        }

        // Evaluate 3D normal lighting
        const intensity = this.lighting.computeIntensity(nx, ny, evalRes.z, evalRes.part, 1.0);

        // Select glyph from anatomical density ramp
        const ch = this.parts.getChar(evalRes.part, intensity, c * 37 + r * 17, this.anim.nameLetters, {
          badgeChar: evalRes.badgeChar,
          isLeft: nx < 0
        });

        // Compute regional color & glow
        const colInfo = this.parts.getColor(evalRes.part, intensity, evalRes.depth, theme, {
          badgeChar: evalRes.badgeChar,
          hy: evalRes.hy
        });

        // Reveal order for progressive bloom
        const rv = evalRes.part !== "bg" ? this.geo.calcRevealStage(evalRes.part, nx, ny) : 999.0;

        row.push({
          r, c, nx, ny,
          part: evalRes.part,
          char: ch,
          color: colInfo.color,
          glow: colInfo.glow,
          z: evalRes.z,
          depth: evalRes.depth,
          reveal: rv,
          hash: (c * 37 + r * 17)
        });
      }
      this.canonicalGrid.push(row);
    }
  }

  /**
   * Master Fullscreen Render Pipeline
   */
  render(bloomProgress, isBloomed) {
    const ctx = this.ctx;
    const anim = this.anim;
    const t = anim.time;
    const theme = anim.getTheme();
    const W = this.width;
    const H = this.height;

    // 1. Deep Space Cosmic Void
    ctx.fillStyle = "#030206";
    ctx.fillRect(0, 0, W, H);

    // Dynamic Ambient Nebula
    const nebGrad = ctx.createRadialGradient(
      this.CENTER_X, this.CENTER_Y, 40,
      this.CENTER_X, this.CENTER_Y, Math.max(W, H) * 0.65
    );
    nebGrad.addColorStop(0, theme.nebula || "rgba(255, 45, 95, 0.12)");
    nebGrad.addColorStop(0.4, "rgba(80, 20, 110, 0.06)");
    nebGrad.addColorStop(0.8, "rgba(20, 10, 35, 0.03)");
    nebGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nebGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Twinkling Cosmic Stars
    for (const star of anim.stars) {
      const sx = (star.xRel !== undefined) ? star.xRel * W : ((star.x / 1080) * W);
      const sy = (star.yRel !== undefined) ? star.yRel * H : ((star.y / 1920) * H);
      const val = star.baseBrightness * (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * star.freq + star.phase)));
      if (val > 0.16) {
        if (star.colorType === "rose") {
          ctx.fillStyle = `rgba(255, 180, 210, ${val})`;
        } else if (star.colorType === "gold") {
          ctx.fillStyle = `rgba(255, 230, 160, ${val})`;
        } else {
          ctx.fillStyle = `rgba(180, 215, 255, ${val})`;
        }
        ctx.fillRect(sx, sy, 2, 2);
        if (val > 0.85) {
          ctx.fillRect(sx - 1, sy, 1, 1);
          ctx.fillRect(sx + 2, sy, 1, 1);
        }
      }
    }

    // 3. Four-Point Sparkle Diamond Stars
    for (const sp of anim.sparkleStars) {
      const spx = (sp.x / 1080) * W;
      const spy = (sp.y / 1920) * H;
      const wave = Math.sin(t * sp.freq + sp.phase);
      const sVal = Math.pow(Math.max(0, wave), 3.0);
      if (sVal > 0.08) {
        const arm = 3 + 8 * sVal;
        ctx.strokeStyle = `rgba(255, 255, 255, ${sVal * 0.85})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(spx - arm, spy); ctx.lineTo(spx + arm, spy);
        ctx.moveTo(spx, spy - arm); ctx.lineTo(spx, spy + arm);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${sVal})`;
        ctx.fillRect(spx - 1, spy - 1, 3, 3);
      }
    }

    // 4. Cosmic Meteors / Shooting Stars
    for (const ss of anim.shootingStars) {
      ctx.save();
      const ssX = (ss.x / 1080) * W;
      const ssY = (ss.y / 1920) * H;
      const tailX = ssX - (ss.vx / 750) * ss.len;
      const tailY = ssY - (ss.vy / 750) * ss.len;
      const grad = ctx.createLinearGradient(tailX, tailY, ssX, ssY);
      grad.addColorStop(0, "rgba(255, 255, 255, 0)");
      grad.addColorStop(0.7, `rgba(255, 180, 220, ${ss.alpha * 0.6})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ssX, ssY);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
      ctx.beginPath();
      ctx.arc(ssX, ssY, 2.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Heartbeat Shockwave Rings
    for (const sw of anim.shockwaves) {
      ctx.save();
      const scaleFactor = this.SCENE_SCALE / 1050;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 2.0;
      ctx.globalAlpha = sw.alpha;
      ctx.beginPath();
      ctx.arc(this.CENTER_X, this.CENTER_Y + 0.16 * this.SCENE_SCALE, sw.r * scaleFactor, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Ambient Cosmic Dust
    for (const p of anim.ambientParticles) {
      const px = (p.x / 1080) * W;
      const py = (p.y / 1920) * H;
      const pAlpha = p.alpha * (0.6 + 0.4 * Math.sin(t * 3.0 + p.phase));
      ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Cursor Dust Trails
    ctx.font = 'bold 14px "Fira Code", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const cp of anim.cursorParticles) {
      ctx.save();
      ctx.fillStyle = `rgba(${cp.color.join(",")}, ${cp.alpha})`;
      ctx.shadowColor = `rgba(${cp.color.join(",")}, 0.8)`;
      ctx.shadowBlur = 8;
      ctx.fillText(cp.char, cp.x, cp.y);
      ctx.restore();
    }

    // 8. Radiant Glowing Chest Heart Aura
    const heartGlowPx = this.CENTER_X;
    const heartGlowPy = this.CENTER_Y + 0.16 * this.SCENE_SCALE;
    const glowR = (this.SCENE_SCALE * 0.28) * anim.heartScale * Math.min(1.0, bloomProgress * 1.3);

    if (bloomProgress > 0.05) {
      const radGrad = ctx.createRadialGradient(heartGlowPx, heartGlowPy, 0, heartGlowPx, heartGlowPy, glowR);
      const auraAlpha = 0.65 * (anim.heartScale - 0.70) * Math.min(1.0, bloomProgress * 1.4);
      radGrad.addColorStop(0, `rgba(${theme.heartCore.join(",")}, ${Math.max(0, auraAlpha)})`);
      radGrad.addColorStop(0.35, `rgba(${theme.heartHighlight.join(",")}, ${Math.max(0, auraAlpha * 0.55)})`);
      radGrad.addColorStop(0.7, `rgba(${theme.heartHighlight.join(",")}, ${Math.max(0, auraAlpha * 0.20)})`);
      radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(heartGlowPx, heartGlowPy, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Floating Ascending Mini ASCII Hearts
    if (isBloomed) {
      ctx.font = 'bold 18px "Fira Code", monospace';
      for (const p of anim.floatingHearts) {
        const currT = (t + p.timeOffset) % p.period;
        const prog = currT / p.period;
        const ny = 0.16 - prog * 0.95;
        const nx = p.xRel + p.wobbleAmp * Math.sin(currT * p.wobbleFreq + p.phase);
        const alpha = Math.sin(prog * Math.PI);
        if (alpha > 0.05) {
          const px = Math.floor(this.CENTER_X + nx * this.SCENE_SCALE);
          const py = Math.floor(this.CENTER_Y + ny * this.SCENE_SCALE);
          if (px >= 20 && px <= W - 20 && py >= 30 && py <= H - 30) {
            ctx.fillStyle = `rgba(${theme.heartHighlight.join(",")}, ${alpha})`;
            ctx.shadowColor = theme.heartGlow;
            ctx.shadowBlur = 10;
            ctx.fillText(p.char, px, py);
          }
        }
      }
      ctx.shadowBlur = 0;
    }

    // 10. Personalized Celestial Arch Header
    if (bloomProgress > 0.20) {
      const archAlpha = Math.min(1.0, (bloomProgress - 0.20) * 2.0);
      ctx.save();
      const headerFontSize = Math.min(22, Math.max(14, Math.floor(W * 0.035)));
      ctx.font = `bold ${headerFontSize}px "Fira Code", monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(${theme.heartHighlight.join(",")}, ${archAlpha})`;
      ctx.shadowColor = theme.heartGlow;
      ctx.shadowBlur = 16;
      ctx.fillText(`✧ SPECIALLY CRAFTED FOR ${anim.name.toUpperCase()} ✧`, this.CENTER_X, Math.max(45, this.GRID_Y0 - 35));
      ctx.restore();
    }

    // 11. Advanced ASCII Character Matrix with Multi-Layer Animation
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const breath = (anim.breathScale - 1.0);
    const bounceY = -anim.bounce * 0.04;
    const isWaving = anim.isWaving;
    const waveTimer = anim.waveTimer;
    const blinkVal = anim.blinkValue;
    const headTilt = anim.headTilt;
    const lookOffset = anim.lookOffset;

    const charFontSize = Math.max(10, Math.floor(this.CELL_H * 0.85));
    ctx.font = `bold ${charFontSize}px "Fira Code", Menlo, monospace`;

    for (let r = 0; r < this.ROWS; r++) {
      const rowCells = this.canonicalGrid[r];
      if (!rowCells) continue;

      for (let c = 0; c < this.COLS; c++) {
        const cell = rowCells[c];
        if (cell.part === "bg") continue;
        if (bloomProgress < cell.reveal) continue;

        let nx = cell.nx;
        let ny = cell.ny + bounceY;

        // Transform A: Heart pulsing
        if (cell.part === "heart" || cell.part === "badge") {
          const dx = nx - 0.0;
          const dy = ny - 0.16;
          nx = 0.0 + dx * anim.heartScale;
          ny = 0.16 + dy * anim.heartScale;
        }

        // Transform B: Right paw waving
        if (isWaving && (cell.part === "paw" || cell.part === "paw_pad") && cell.nx > 0.05) {
          const waveX = 0.28 + Math.sin(waveTimer * 8.0) * 0.04;
          const waveY = -0.04 + Math.cos(waveTimer * 8.0) * 0.02;
          nx += (waveX - 0.17);
          ny += (waveY - 0.14);
        }

        // Transform C: 3D Head tilt & mouse gaze tracking
        if (cell.ny < -0.01) {
          const cosTilt = Math.cos(-headTilt);
          const sinTilt = Math.sin(-headTilt);
          const hx = nx - lookOffset.x * 0.07;
          const hy = ny - lookOffset.y * 0.07;
          nx = hx * cosTilt - hy * sinTilt;
          ny = hx * sinTilt + hy * cosTilt;
        }

        // Transform D: Torso breathing expansion
        if (cell.part === "body" || cell.part === "heart") {
          nx *= (1.0 + breath);
          ny *= (1.0 + breath);
        }

        const px = this.CENTER_X + nx * this.SCENE_SCALE;
        const py = this.CENTER_Y + ny * this.SCENE_SCALE;

        // Dynamic character & color states
        let ch = cell.char;
        let col = cell.color;
        let glow = cell.glow;

        // Newborn shimmer flash
        const delta = bloomProgress - cell.reveal;
        if (delta < 0.04 && bloomProgress < 1.0) {
          ch = "*";
          col = "rgb(255, 255, 240)";
          glow = "rgba(255, 255, 255, 0.95)";
        } else if (cell.part === "eye" && blinkVal > 0.6) {
          ch = "⌒";
          col = `rgb(${theme.furBase.join(",")})`;
        }

        if (col === "transparent" || ch === " ") continue;

        if (glow) {
          ctx.shadowColor = glow;
          ctx.shadowBlur = (cell.part === "badge" || cell.part === "heart") ? 14 : 8;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = col;
        ctx.fillText(ch, px, py);
      }
    }

    ctx.shadowBlur = 0;

    // 12. Floating Polaroid Snapshot on Canvas (Landscape or for snapshot exports)
    if (this.userPhoto && isBloomed && (W > 850)) {
      this.drawPolaroidOnCanvas();
    }

    // 13. Magical Portal Warp Overlay
    if (this.portalActive) {
      this.drawPortalWarp(this.portalProgress);
    }
  }

  /**
   * Draw the Polaroid directly on the Canvas when on desktop or during snapshot
   */
  drawPolaroidOnCanvas() {
    if (!this.userPhoto) return;
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;

    const pw = Math.min(260, Math.floor(W * 0.22));
    const ph = Math.floor(pw * 1.25);
    const px = Math.min(W - pw - 60, this.CENTER_X + this.SCENE_SCALE * 0.52);
    const py = this.CENTER_Y - ph * 0.45;

    ctx.save();
    ctx.translate(px + pw / 2, py + ph / 2);
    ctx.rotate(0.04 * Math.sin(this.anim.time * 2.0) + 0.05);

    // Frame shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12;

    // White paper frame
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.shadowBlur = 0;

    // Photo inside
    const pad = pw * 0.07;
    const imgW = pw - pad * 2;
    const imgH = imgW;
    const imgX = -pw / 2 + pad;
    const imgY = -ph / 2 + pad;

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(imgX, imgY, imgW, imgH);

    try {
      ctx.drawImage(this.userPhoto, imgX, imgY, imgW, imgH);
    } catch (e) {}

    // Handwritten caption
    ctx.font = `italic bold ${Math.max(12, Math.floor(pw * 0.065))}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(`Best Friends Forever ❤️ ${this.anim.name}`, 0, ph / 2 - pad * 0.9);

    ctx.restore();
  }

  /**
   * Magical Portal Warp Explosion for Transition to Portfolio
   */
  drawPortalWarp(progress) {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height * 0.45;
    const maxR = Math.max(this.width, this.height) * 1.2;
    const r = progress * maxR;

    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1.0, progress * 1.5)})`);
    grad.addColorStop(0.3, `rgba(255, 45, 95, ${0.9 * (1.0 - progress * 0.2)})`);
    grad.addColorStop(0.7, `rgba(255, 120, 160, ${0.7 * (1.0 - progress * 0.3)})`);
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    const rays = 36;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2 + progress * 2.0;
      const rayLen = r * (0.8 + 0.4 * Math.sin(angle * 4 + progress * 10));
      const rx = cx + Math.cos(angle) * rayLen;
      const ry = cy + Math.sin(angle) * rayLen;

      ctx.strokeStyle = `rgba(255, 180, 210, ${(1.0 - progress) * 0.8})`;
      ctx.lineWidth = 3 + (1.0 - progress) * 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(rx, ry);
      ctx.stroke();
    }

    if (progress > 0.7) {
      const flashAlpha = (progress - 0.7) / 0.3;
      ctx.fillStyle = `rgba(255, 245, 250, ${flashAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    ctx.restore();
  }
}

window.TeddyAsciiRenderer = TeddyAsciiRenderer;
