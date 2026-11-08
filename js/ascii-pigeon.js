/**
 * Majestic Living ASCII Carrier Pigeon Engine
 * 
 * Features:
 * - Hand-crafted aerodynamic dove of love carrying a sealed romantic letter.
 * - Sinuous cubic flight path swooping in from top-left, hovering in center,
 *   delivering the letter into center stage, then ascending away into the stars.
 * - Dynamic harmonic flapping wings (14 Hz flapping oscillation with primary feathers).
 * - True-color 24-bit glowing pearlescent white ASCII rasterization.
 * - Feather stardust trail drifting through the night sky.
 * - Seamless integration with the interactive sealed envelope.
 */

export class AsciiPigeon {
  constructor(canvas, onDelivered = null, onDeparted = null) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.onDelivered = onDelivered;
    this.onDeparted = onDeparted;

    this.isRunning = false;
    this.animId = null;
    this.t0 = performance.now();
    this.delivered = false;
    this.departed = false;

    // Simulation & Staging Canvases
    this.simCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.simCtx = this.simCanvas ? this.simCanvas.getContext('2d', { willReadFrequently: true }) : null;

    this.stageCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.stageCtx = this.stageCanvas ? this.stageCanvas.getContext('2d') : null;

    // Feather stardust particles trail
    this.particles = [];

    // ASCII Character Sets
    this.chars = " .':;!~+=*#%@$";

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
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
    this.charAspect = 0.54;

    const targetCellH = Math.max(7.2, Math.min(8.2, cssH / 115));
    this.rows = Math.max(85, Math.min(135, Math.round(cssH / targetCellH)));
    this.columns = Math.round(this.rows * (w / h) / this.charAspect);

    if (this.simCanvas) {
      this.simCanvas.width = this.columns;
      this.simCanvas.height = this.rows;
    }

    if (this.stageCanvas) {
      this.stageCanvas.width = 380;
      this.stageCanvas.height = 300;
    }
  }

  smoothstep(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // Draw pure white carrier dove onto stage canvas
  drawDove(ctx, wingFlap, hasLetter, letterProgress) {
    const sW = 380;
    const sH = 300;
    ctx.clearRect(0, 0, sW, sH);

    ctx.save();
    ctx.translate(sW * 0.46, sH * 0.40);

    // Dove Body & Breast
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 24, 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Soft Dove-Blue Underbelly Shadow
    ctx.fillStyle = '#d0def5';
    ctx.beginPath();
    ctx.ellipse(0, 9, 36, 16, 0.1, 0, Math.PI);
    ctx.fill();

    // Spreading Tail Feathers (back)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-30, -2);
    ctx.lineTo(-72, -8 + wingFlap * 4);
    ctx.lineTo(-80, 2 + wingFlap * 3);
    ctx.lineTo(-70, 16 + wingFlap * 2);
    ctx.lineTo(-26, 9);
    ctx.closePath();
    ctx.fill();

    // Tail feather accents
    ctx.strokeStyle = '#c4d4ee';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-30, 2);
    ctx.lineTo(-76, 2 + wingFlap * 3);
    ctx.moveTo(-28, 7);
    ctx.lineTo(-68, 11 + wingFlap * 2);
    ctx.stroke();

    // Slender Dove Head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(34, -13, 16, 0, Math.PI * 2);
    ctx.fill();

    // Golden Beak
    ctx.fillStyle = '#f5b020';
    ctx.beginPath();
    ctx.moveTo(47, -15);
    ctx.lineTo(62, -10);
    ctx.lineTo(47, -7);
    ctx.closePath();
    ctx.fill();

    // Expressive Eye
    ctx.fillStyle = '#11131a';
    ctx.beginPath();
    ctx.arc(38, -15, 3.4, 0, Math.PI * 2);
    ctx.fill();
    // Pupil glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(39, -16, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Far Wing (behind body)
    const farFlap = wingFlap;
    ctx.fillStyle = '#e2ecfa';
    ctx.beginPath();
    ctx.moveTo(-6, -13);
    ctx.quadraticCurveTo(-18, -48 - farFlap * 38, 10, -60 - farFlap * 48);
    ctx.quadraticCurveTo(6, -32 - farFlap * 26, 14, -9);
    ctx.closePath();
    ctx.fill();

    // Near Wing (in front of body)
    const nearFlap = wingFlap;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-9, -7);
    ctx.quadraticCurveTo(-24, -45 - nearFlap * 42, 6, -64 - nearFlap * 52);
    ctx.quadraticCurveTo(14, -34 - nearFlap * 26, 20, -3);
    ctx.closePath();
    ctx.fill();

    // Primary Wing Feather Lines
    ctx.strokeStyle = '#cddcf2';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-5, -11);
    ctx.lineTo(3, -54 - nearFlap * 46);
    ctx.moveTo(5, -9);
    ctx.lineTo(10, -56 - nearFlap * 48);
    ctx.stroke();

    // Talons & Letter Ribbon (if still carrying)
    if (hasLetter) {
      // Golden talons
      ctx.fillStyle = '#ea9818';
      ctx.beginPath();
      ctx.rect(4, 15, 5, 9);
      ctx.rect(12, 15, 5, 9);
      ctx.fill();

      // Golden ribbon thread
      ctx.strokeStyle = '#fcd058';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(9, 24);
      ctx.lineTo(7, 45);
      ctx.stroke();

      // Hanging Sealed Envelope (Small Preview)
      ctx.save();
      ctx.translate(7, 45);
      ctx.rotate(-0.08 + wingFlap * 0.08);

      // Envelope body
      ctx.fillStyle = '#ede0cf';
      ctx.fillRect(-20, 0, 40, 26);
      ctx.strokeStyle = '#b89d7d';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-20, 0, 40, 26);

      // Flap
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(0, 13);
      ctx.lineTo(20, 0);
      ctx.strokeStyle = '#a48464';
      ctx.stroke();

      // Red Wax Heart Seal
      ctx.fillStyle = '#e81d45';
      ctx.beginPath();
      ctx.arc(0, 13, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if (letterProgress < 1.0) {
      // Letter dropping down smoothly to center
      const dropY = 45 + (letterProgress * 95);
      const dropRotate = Math.sin(letterProgress * Math.PI * 3) * 0.14;

      ctx.save();
      ctx.translate(7, dropY);
      ctx.rotate(dropRotate);

      ctx.fillStyle = '#ede0cf';
      ctx.fillRect(-20, 0, 40, 26);
      ctx.strokeStyle = '#b89d7d';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-20, 0, 40, 26);

      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(0, 13);
      ctx.lineTo(20, 0);
      ctx.strokeStyle = '#a48464';
      ctx.stroke();

      ctx.fillStyle = '#e81d45';
      ctx.beginPath();
      ctx.arc(0, 13, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  renderFrame(now) {
    if (!this.canvas || !this.ctx) return;
    const t = Math.max(0, (now - this.t0) / 1000);

    const cols = this.columns;
    const rows = this.rows;
    if (!this.simCanvas || !this.simCtx) return;

    this.simCtx.clearRect(0, 0, cols, rows);

    // ====================================================================
    // Flight Path Kinematics:
    // Phase 1 (0.0s -> 2.5s): Flies in from top-left to center
    // Phase 2 (2.5s -> 3.5s): Hovers in center & drops letter
    // Phase 3 (3.5s -> 5.8s): Flies off to top-right into stars
    // ====================================================================
    const isMobile = (this.cssW || window.innerWidth || 800) < 768;
    let doveGridX = 0;
    let doveGridY = 0;
    let doveRotate = 0;
    let wingSpeed = 13.0;
    let hasLetter = true;
    let letterDropProgress = 0.0;

    const targetHoverX = cols * 0.50;
    const targetHoverY = rows * (isMobile ? 0.32 : 0.28);

    if (t < 2.5) {
      // Swooping in from top-left
      const p = this.smoothstep(0.0, 2.5, t);
      const startX = -cols * 0.25;
      const startY = rows * (isMobile ? 0.08 : 0.06);

      // Arc trajectory
      doveGridX = startX + (targetHoverX - startX) * p;
      doveGridY = startY + (targetHoverY - startY) * Math.sin(p * Math.PI * 0.5);
      doveRotate = (1.0 - p) * 0.18 + Math.sin(t * 4.5) * 0.04;
      hasLetter = true;
    } else if (t < 3.5) {
      // Hovering in center & releasing letter
      const hoverT = t - 2.5;
      wingSpeed = 8.5;
      doveGridX = targetHoverX + Math.sin(hoverT * 3) * (cols * 0.015);
      doveGridY = targetHoverY + Math.sin(hoverT * 5) * (rows * 0.012);
      doveRotate = Math.sin(hoverT * 4) * 0.04;

      hasLetter = hoverT < 0.35;
      letterDropProgress = Math.min(1.0, (hoverT - 0.35) / 0.55);

      if (letterDropProgress >= 1.0 && !this.delivered) {
        this.delivered = true;
        if (this.onDelivered) this.onDelivered();
      }
    } else if (t < 5.8) {
      // Swooping away to top-right into the starry sky
      const departP = this.smoothstep(3.5, 5.8, t);
      const endX = cols * 1.30;
      const endY = -rows * (isMobile ? 0.16 : 0.22);

      doveGridX = targetHoverX + (endX - targetHoverX) * Math.pow(departP, 1.3);
      doveGridY = targetHoverY + (endY - targetHoverY) * Math.sin(departP * Math.PI * 0.5);
      doveRotate = -0.22 - departP * 0.22;
      hasLetter = false;
      letterDropProgress = 1.0;

      if (!this.delivered) {
        this.delivered = true;
        if (this.onDelivered) this.onDelivered();
      }
    } else {
      // Fully departed
      if (!this.departed) {
        this.departed = true;
        if (this.onDeparted) this.onDeparted();
      }
      this.stop();
      return;
    }

    // Wing flap oscillation
    const wingFlap = Math.sin(t * wingSpeed);

    // Draw Dove onto stage canvas
    if (this.stageCanvas && this.stageCtx) {
      this.drawDove(this.stageCtx, wingFlap, hasLetter, letterDropProgress);

      // Staging to simulation grid (optimized scaling for crisp mobile rendering)
      const doveW = isMobile ? Math.round(cols * 0.62) : Math.round(cols * 0.34);
      const doveH = Math.round(doveW * (300 / 380) * this.charAspect);

      this.simCtx.save();
      this.simCtx.translate(doveGridX, doveGridY);
      this.simCtx.rotate(doveRotate);
      this.simCtx.drawImage(this.stageCanvas, -doveW * 0.5, -doveH * 0.5, doveW, doveH);
      this.simCtx.restore();
    }

    // Emit feather stardust particle trail behind dove
    if (Math.random() < 0.45 && doveGridX > 0 && doveGridX < cols) {
      this.particles.push({
        x: doveGridX - cols * 0.08 + (Math.random() - 0.5) * 4,
        y: doveGridY + (Math.random() - 0.5) * 4,
        vx: -0.4 - Math.random() * 0.4,
        vy: 0.1 + Math.random() * 0.3,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.02,
        char: Math.random() < 0.5 ? '✦' : '✧'
      });
    }

    // Update & draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // ====================================================================
    // Sample Simulation Canvas & Render 24-Bit Glowing ASCII Characters
    // ====================================================================
    const simImg = this.simCtx.getImageData(0, 0, cols, rows);
    const data = simImg.data;

    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cellW = W / cols;
    const cellH = H / rows;
    const fontSize = Math.max(9, Math.round(cellH * 1.08));
    ctx.font = `bold ${fontSize}px Menlo, Consolas, "JetBrains Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const dpr = this.dpr || 1;

    for (let r = 0; r < rows; r++) {
      const posY = r * cellH + cellH * 0.5;
      const rowOffset = r * cols * 4;

      for (let c = 0; c < cols; c++) {
        const offset = rowOffset + c * 4;
        const red = data[offset];
        const grn = data[offset + 1];
        const blu = data[offset + 2];
        const alpha = data[offset + 3] / 255;

        if (alpha < 0.10) continue;

        const posX = c * cellW + cellW * 0.5;
        const lum = (0.299 * red + 0.587 * grn + 0.114 * blu) / 255;

        let char = "#";
        let finalCol = "rgb(255, 255, 255)";

        // Detailed semantic feature identification:
        const isWaxSeal = (red > 190 && grn < 60 && blu < 90);
        const isGoldenBeakOrTalon = (red > 210 && grn > 140 && blu < 60);
        const isEye = (red < 55 && grn < 55 && blu < 65);
        const isLetterParchment = (red > 200 && grn > 190 && blu > 170 && !isWaxSeal && Math.abs(red - grn) < 30);

        if (isWaxSeal) {
          finalCol = "#ff2052";
          char = "♥";
          ctx.shadowColor = "#ff2052";
          ctx.shadowBlur = 6;
        } else if (isGoldenBeakOrTalon) {
          finalCol = "#f5c030";
          char = "✦";
          ctx.shadowColor = "#f5c030";
          ctx.shadowBlur = 4;
        } else if (isEye) {
          finalCol = "#1a1d2e";
          char = "•";
          ctx.shadowBlur = 0;
        } else if (isLetterParchment) {
          finalCol = "#f4e8d8";
          char = "=";
          ctx.shadowColor = "rgba(255, 220, 160, 0.35)";
          ctx.shadowBlur = 2;
        } else if (lum > 0.82) {
          // Pure white breast & feather highlights
          finalCol = "#ffffff";
          char = "@";
          ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
          ctx.shadowBlur = dpr > 1 ? 5 : 3;
        } else if (lum > 0.65) {
          // Mid-feather tone
          finalCol = "#e0edff";
          char = "%";
          ctx.shadowColor = "rgba(200, 225, 255, 0.4)";
          ctx.shadowBlur = 2;
        } else {
          // Soft blue-silver underbelly/wing shadows
          finalCol = `rgb(${red}, ${grn}, ${blu})`;
          char = "+";
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = finalCol;
        ctx.fillText(char, posX, posY);
      }
    }

    // Render feather stardust particles
    ctx.shadowBlur = 4;
    ctx.shadowColor = "#ffe27a";
    for (const p of this.particles) {
      const px = p.x * cellW;
      const py = p.y * cellH;
      ctx.fillStyle = `rgba(255, 226, 122, ${p.life * 0.85})`;
      ctx.fillText(p.char, px, py);
    }
    ctx.shadowBlur = 0;
  }

  start() {
    if (this.isRunning) return;
    this.resize();
    this.isRunning = true;
    this.t0 = performance.now();
    this.delivered = false;
    this.departed = false;

    const loop = (now) => {
      if (!this.isRunning) return;
      this.renderFrame(now);
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
    if (this.canvas) {
      const ctx = this.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  reset() {
    this.stop();
    this.resize();
    this.t0 = performance.now();
    this.delivered = false;
    this.departed = false;
    this.particles = [];
  }
}
