/**
 * teddyRenderer.js
 * ============================================================================
 * Cinematic Cyber-Romantic Canvas 2D Pipeline
 * Renders:
 * - Dynamic cosmic nebula & multi-spectral starfield
 * - Streaking shooting stars & cosmic meteors
 * - Heartbeat light shockwave ripple rings
 * - Interactive cursor fairy dust & stardust trails
 * - High-contrast luminous holographic ASCII Teddy Bear & Radiant Heart
 * - Seamless magical portal transition
 * ============================================================================
 */

class TeddyRenderer {
  constructor(canvas, animation) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.anim = animation;

    this.CANVAS_WIDTH = 1080;
    this.CANVAS_HEIGHT = 1920;

    // Portal Warp Transition State
    this.portalActive = false;
    this.portalProgress = 0.0;

    this.setupCanvas();
  }

  setupCanvas() {
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
  }

  /**
   * Render Mini ASCII Teddy Bear for the Welcome Screen Card
   */
  renderMiniBear(targetCanvas, time) {
    const ctx = targetCanvas.getContext("2d");
    const W = targetCanvas.width;
    const H = targetCanvas.height;
    ctx.clearRect(0, 0, W, H);

    const blink = (Math.sin(time * 2.5) > 0.94);
    const pulse = 1.0 + 0.16 * Math.sin(time * 5.0);
    const eyeChar = blink ? "⌒" : "●";

    const miniLines = [
      "   ₍ᐢ. ̫ .ᐢ₎   ",
      "  (  (,,)  )  ",
      `   / ${eyeChar}  ${eyeChar} \\   `,
      "  (  .꒳.  )  ",
      "   /╭───╮\\   ",
      "  ( │ ♥ │ )  ",
      "   \\╰───╯/   ",
      "   (,,) (,,)  "
    ];

    ctx.font = '16px "Fira Code", Menlo, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const startY = 32;
    const lineH = 22;

    miniLines.forEach((line, idx) => {
      let y = startY + idx * lineH;
      if (line.includes("♥")) {
        ctx.fillStyle = `rgb(255, 45, 95)`;
        ctx.shadowColor = "rgba(255, 45, 95, 0.9)";
        ctx.shadowBlur = 14 * pulse;
      } else if (line.includes(eyeChar)) {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = "rgb(255, 125, 155)";
        ctx.shadowColor = "rgba(255, 110, 140, 0.4)";
        ctx.shadowBlur = 6;
      }
      ctx.fillText(line, W / 2, y);
    });
    ctx.shadowBlur = 0;
  }

  /**
   * Render the Complete Fullscreen 9:16 Cinematic Experience
   */
  render(bloomProgress, isBloomed) {
    const ctx = this.ctx;
    const anim = this.anim;
    const t = anim.time;
    const theme = anim.getTheme();

    // 1. Deep Space Void with Cosmic Nebula Clouds
    ctx.fillStyle = "#030308";
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Dynamic procedural nebula glow in background
    const nebPulse = 0.5 + 0.5 * Math.sin(t * 0.8);
    const nebGrad = ctx.createRadialGradient(
      this.CANVAS_WIDTH / 2, anim.CENTER_Y, 80,
      this.CANVAS_WIDTH / 2, anim.CENTER_Y, 750
    );
    nebGrad.addColorStop(0, theme.nebula);
    nebGrad.addColorStop(0.5, "rgba(20, 10, 35, 0.08)");
    nebGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nebGrad;
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // 2. Twinkling Multi-Spectral Cosmic Stars
    for (const star of anim.stars) {
      const val = star.baseBrightness * (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * star.freq + star.phase)));
      if (val > 0.18) {
        if (star.colorType === "rose") {
          ctx.fillStyle = `rgba(255, 180, 210, ${val})`;
        } else if (star.colorType === "gold") {
          ctx.fillStyle = `rgba(255, 230, 160, ${val})`;
        } else {
          ctx.fillStyle = `rgba(180, 215, 255, ${val})`;
        }
        ctx.fillRect(star.x, star.y, 2, 2);
        if (val > 0.85) {
          ctx.fillRect(star.x - 1, star.y, 1, 1);
          ctx.fillRect(star.x + 2, star.y, 1, 1);
        }
      }
    }

    // 3. Four-point Sparkle Diamond Stars
    for (const sp of anim.sparkleStars) {
      const wave = Math.sin(t * sp.freq + sp.phase);
      const sVal = Math.pow(Math.max(0, wave), 3.0);
      if (sVal > 0.08) {
        const arm = 4 + 11 * sVal;
        ctx.strokeStyle = `rgba(255, 255, 255, ${sVal * 0.85})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sp.x - arm, sp.y); ctx.lineTo(sp.x + arm, sp.y);
        ctx.moveTo(sp.x, sp.y - arm); ctx.lineTo(sp.x, sp.y + arm);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${sVal})`;
        ctx.fillRect(sp.x - 1, sp.y - 1, 3, 3);
      }
    }

    // 4. Streaking Shooting Stars / Cosmic Meteors
    for (const ss of anim.shootingStars) {
      ctx.save();
      const tailX = ss.x - (ss.vx / 750) * ss.len;
      const tailY = ss.y - (ss.vy / 750) * ss.len;
      const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, "rgba(255, 255, 255, 0)");
      grad.addColorStop(0.7, `rgba(255, 180, 220, ${ss.alpha * 0.6})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Heartbeat Shockwave Rings
    for (const sw of anim.shockwaves) {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 2.0;
      ctx.globalAlpha = sw.alpha;
      ctx.beginPath();
      ctx.arc(sw.cx, sw.cy, sw.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Glowing Ambient Cosmic Dust Particles
    for (const p of anim.ambientParticles) {
      const pAlpha = p.alpha * (0.6 + 0.4 * Math.sin(t * 3.0 + p.phase));
      ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Cursor Fairy Dust Trails
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

    // 8. Breathing Heartbeat Radial Glow Aura
    const swayDeg = isBloomed ? (1.5 * Math.sin(t * 2.1)) : 0.0;
    const swayRad = (swayDeg * Math.PI) / 180.0;
    const cosSway = Math.cos(-swayRad);
    const sinSway = Math.sin(-swayRad);

    const heartHx = 0.0;
    const heartHy = 0.14;
    const hRotX = (heartHx - 0.0) * Math.cos(swayRad) - (heartHy - 0.40) * Math.sin(swayRad);
    const hRotY = (heartHx - 0.0) * Math.sin(swayRad) + (heartHy - 0.40) * Math.cos(swayRad) + 0.40;

    const heartGlowPx = anim.CENTER_X + hRotX * anim.SCENE_SCALE;
    const heartGlowPy = anim.CENTER_Y + hRotY * anim.SCENE_SCALE;
    const glowR = 270.0 * anim.heartScale * Math.min(1.0, bloomProgress * 1.3);

    if (bloomProgress > 0.05) {
      const radGrad = ctx.createRadialGradient(heartGlowPx, heartGlowPy, 0, heartGlowPx, heartGlowPy, glowR);
      const auraAlpha = 0.65 * (anim.heartScale - 0.65) * Math.min(1.0, bloomProgress * 1.4);
      radGrad.addColorStop(0, `rgba(${theme.heartCore.join(",")}, ${auraAlpha})`);
      radGrad.addColorStop(0.35, `rgba(${theme.heartHighlight.join(",")}, ${auraAlpha * 0.55})`);
      radGrad.addColorStop(0.7, `rgba(${theme.heartHighlight.join(",")}, ${auraAlpha * 0.20})`);
      radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(heartGlowPx, heartGlowPy, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Floating Mini ASCII Hearts (Ascending like glowing embers)
    if (isBloomed) {
      ctx.font = 'bold 18px "Fira Code", monospace';
      for (const p of anim.floatingHearts) {
        const currT = (t + p.timeOffset) % p.period;
        const prog = currT / p.period;
        const ny = 0.14 - prog * 0.95;
        const nx = p.xRel + p.wobbleAmp * Math.sin(currT * p.wobbleFreq + p.phase);
        const alpha = Math.sin(prog * Math.PI);
        if (alpha > 0.05) {
          const px = Math.floor(anim.CENTER_X + nx * anim.SCENE_SCALE);
          const py = Math.floor(anim.CENTER_Y + ny * anim.SCENE_SCALE);
          if (px >= 30 && px <= this.CANVAS_WIDTH - 30 && py >= 40 && py <= this.CANVAS_HEIGHT - 30) {
            ctx.fillStyle = `rgba(${theme.heartHighlight.join(",")}, ${alpha})`;
            ctx.shadowColor = theme.heartGlow;
            ctx.shadowBlur = 10;
            ctx.fillText(p.char, px, py);
          }
        }
      }
      ctx.shadowBlur = 0;
    }

    // 10. Personalized Floating Celestial Arch Header
    if (bloomProgress > 0.20) {
      const archAlpha = Math.min(1.0, (bloomProgress - 0.20) * 2.0);
      ctx.save();
      ctx.font = 'bold 22px "Fira Code", monospace';
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(${theme.heartHighlight.join(",")}, ${archAlpha})`;
      ctx.shadowColor = theme.heartGlow;
      ctx.shadowBlur = 18;
      ctx.fillText(`✧ SPECIALLY CRAFTED FOR ${anim.name.toUpperCase()} ✧`, this.CANVAS_WIDTH / 2, 100);
      ctx.restore();
    }

    // 11. Solid, Delicate, High-Contrast ASCII Teddy Bear Grid
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Gentle breathing physics
    const breath = 0.008 * Math.sin(t * 3.0);
    const bounceY = -anim.bounce * 0.04;

    for (let r = 0; r < anim.ROWS; r++) {
      const rowCells = anim.canonicalGrid[r];
      if (!rowCells) continue;

      for (let c = 0; c < anim.COLS; c++) {
        const cell = rowCells[c];
        if (cell.part === "bg") continue;
        if (bloomProgress < cell.reveal) continue;

        let nx = cell.nx;
        let ny = cell.ny + bounceY;

        // Dynamic transforms:
        // A. Heartbeat pulsing on heart & badge cells
        if (cell.part === "heart" || cell.part === "badge") {
          const dx = nx - 0.0;
          const dy = ny - 0.14;
          nx = 0.0 + dx * anim.heartScale;
          ny = 0.14 + dy * anim.heartScale;
        }

        // B. Waving right paw (smooth wave trajectory)
        if (anim.isWaving && (cell.part === "paw" || cell.part === "paw_pad") && cell.nx > 0.0) {
          const waveX = 0.28 + Math.sin(t * 8.0) * 0.04;
          const waveY = -0.04 + Math.cos(t * 8.0) * 0.02;
          nx = nx + (waveX - 0.17);
          ny = ny + (waveY - 0.13);
        }

        // C. Head tilt and look-at tracking on head/face features
        if (cell.ny < -0.01) {
          const cosTilt = Math.cos(-anim.headTilt);
          const sinTilt = Math.sin(-anim.headTilt);
          const hx = nx - anim.lookOffset.x * 0.07;
          const hy = ny - anim.lookOffset.y * 0.07;
          nx = hx * cosTilt - hy * sinTilt;
          ny = hx * sinTilt + hy * cosTilt;
        }

        // D. Gentle body sway around seated base (0.0, 0.40)
        if (Math.abs(swayDeg) > 0.001) {
          const dx = nx - 0.0;
          const dy = ny - 0.40;
          nx = dx * cosSway - dy * sinSway;
          ny = dx * sinSway + dy * cosSway + 0.40;
        }

        // Breathing expansion
        if (cell.part === "body" || cell.part === "heart") {
          nx *= (1.0 + breath);
          ny *= (1.0 + breath);
        }

        const px = anim.CENTER_X + nx * anim.SCENE_SCALE;
        const py = anim.CENTER_Y + ny * anim.SCENE_SCALE;

        // Shimmer flash for newborn letters
        const delta = bloomProgress - cell.reveal;
        let ch = cell.char;
        let col = cell.color;
        let glow = cell.glow;

        if (delta < 0.04 && bloomProgress < 1.0) {
          ch = "*";
          col = "rgb(255, 255, 240)";
          glow = "rgba(255, 255, 255, 0.95)";
        } else if (cell.part === "eye" && anim.blinkValue > 0.6) {
          ch = "⌒";
          col = `rgb(${theme.furBase.join(",")})`;
        }

        ctx.font = `bold 16px "Fira Code", Menlo, monospace`;
        if (glow) {
          ctx.shadowColor = glow;
          ctx.shadowBlur = (cell.part === "badge" || cell.part === "heart") ? 16 : 10;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = col;
        ctx.fillText(ch, px, py);
      }
    }

    ctx.shadowBlur = 0;

    // 12. Magical Portal Warp Overlay (on Transition)
    if (this.portalActive) {
      this.drawPortalWarp(this.portalProgress);
    }
  }

  /**
   * Magical Portal Warp Explosion for Transition to Portfolio
   */
  drawPortalWarp(progress) {
    const ctx = this.ctx;
    const cx = this.CANVAS_WIDTH / 2;
    const cy = this.CANVAS_HEIGHT * 0.45;

    const maxR = 1500;
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
      ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }
    ctx.restore();
  }
}

window.TeddyRenderer = TeddyRenderer;
